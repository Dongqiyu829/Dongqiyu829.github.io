(function (root) {
  "use strict";

  const POLYNOMIALS = {
    unknot: { name: "平凡结 U", display: "1", terms: [[1, 0]] },
    positive: { name: "三叶结 J₊", display: "x² + x⁶ − x⁸", terms: [[1, 2], [1, 6], [-1, 8]] },
    negative: { name: "镜像三叶结 J₋", display: "x⁻² + x⁻⁶ − x⁻⁸", terms: [[1, -2], [1, -6], [-1, -8]] }
  };

  const STUDY_KEYS = ["terms", "derivative", "detector", "correction", "product", "comprehensive"];
  const STORAGE_KEY = "knot-second-order-study-v2";

  const PRODUCT_STEPS = [
    { title: "1. 先收集在 x=1 的数据", html: "<p><span class=\"math\">δ=−(x+x⁻¹)</span>，所以 <span class=\"math\">δ(1)=−2, δ′(1)=0, δ″(1)=−2</span>。</p><p>当 <span class=\"math\">lk(M)=0</span> 时，<span class=\"math\">f<sub>M</sub>(1)=−2, f′<sub>M</sub>(1)=0</span>。</p>" },
    { title: "2. 完整展开 (δfM)″", html: "<p><span class=\"math\">(δf<sub>M</sub>)″=δ″f<sub>M</sub>+2δ′f′<sub>M</sub>+δf″<sub>M</sub></span>。</p><p>代入 1：<span class=\"math\">(−2)(−2)+2·0·0+(−2)f″<sub>M</sub>=4−2f″<sub>M</sub></span>。中间项写出来后才因 0 消失。</p>" },
    { title: "3. 用校正公式替换 fM″", html: "<p>在 <span class=\"math\">lk=0</span> 时，校正公式给 <span class=\"math\">f″<sub>M</sub>=−2−2(a+b)</span>。</p><p>因此 <span class=\"math\">(δf<sub>M</sub>)″=4−2[−2−2(a+b)]=8+4(a+b)</span>。</p>" },
    { title: "4. 单独算清 (δ²)″(1)=8", html: "<p><span class=\"math\">δ²=(x+x⁻¹)²=x²+2+x⁻²</span>。</p><p>所以 <span class=\"math\">(δ²)′(1)=2−2=0</span>，<span class=\"math\">(δ²)″(1)=2+6=8</span>。其中 6 来自 <span class=\"math\">x⁻²</span> 的二阶贡献。</p>" },
    { title: "5. 完整展开 (δ²p)″", html: "<p><span class=\"math\">(δ²p)″=(δ²)″p+2(δ²)′p′+δ²p″</span>。</p><p>用 <span class=\"math\">p(1)=1,p′(1)=0,p″(1)=a+b,δ²(1)=4</span>：<span class=\"math\">8·1+2·0·0+4(a+b)=8+4(a+b)</span>。</p>" },
    { title: "6. 合并两部分", html: "<p><span class=\"math\">S″<sub>M</sub>=(δf<sub>M</sub>)″+(δ²p)″</span></p><p><span class=\"math\">=[8+4(a+b)]+[8+4(a+b)]=16+8(a+b)</span>。</p><p><strong>现在每个 8、每个交叉项消失的原因都有出处。</strong></p>" }
  ];

  function evaluateAtOne(terms, order) {
    return terms.reduce(function (sum, term) {
      const coefficient = term[0]; const exponent = term[1];
      if (order === 0) return sum + coefficient;
      if (order === 1) return sum + coefficient * exponent;
      if (order === 2) return sum + coefficient * exponent * (exponent - 1);
      throw new Error("Only derivative orders 0, 1, and 2 are supported.");
    }, 0);
  }

  function correctionLab(k) {
    const deltaSecond = -48 * k - 18; const squareCorrection = 24 * (2 * k + 1); const linearCorrection = -6;
    return { k, deltaSecond, squareCorrection, linearCorrection, total: deltaSecond + squareCorrection + linearCorrection };
  }

  function finalInvariant(a, b) { return 16 + 8 * (a + b); }

  function checkDerivativePractice(first, second) {
    if (!Number.isFinite(first) || !Number.isFinite(second)) return { correct: false, reason: "missing" };
    if (first !== -10) return { correct: false, reason: "first" };
    if (second !== 12) return { correct: false, reason: "second" };
    return { correct: true, reason: "correct" };
  }

  function checkComprehensive(values) {
    const numericKeys = ["a", "b", "s", "difference"];
    if (numericKeys.some(function (key) { return !Number.isFinite(values[key]); }) || !values.conclusion) return { correct: false, reason: "missing" };
    if (values.a !== -24) return { correct: false, reason: "a" };
    if (values.b !== 0) return { correct: false, reason: "b" };
    if (values.s !== -176) return { correct: false, reason: "s" };
    if (values.difference !== -192) return { correct: false, reason: "difference" };
    if (values.conclusion !== "different-polynomial") return { correct: false, reason: "conclusion" };
    return { correct: true, reason: "correct" };
  }

  function formatSigned(n) { return n < 0 ? "−" + Math.abs(n) : String(n); }

  function setFeedback(element, correct, message) {
    element.textContent = message; element.className = "feedback " + (correct ? "correct" : "incorrect"); element.dataset.result = correct ? "correct" : "incorrect";
  }

  function clearFeedback(element) { element.textContent = ""; element.className = "feedback"; delete element.dataset.result; }

  function createProgressTracker(doc) {
    let completed = new Set();
    try { const saved = JSON.parse(root.localStorage.getItem(STORAGE_KEY) || "[]"); completed = new Set(saved.filter(function (key) { return STUDY_KEYS.includes(key); })); } catch (_) { completed = new Set(); }
    const count = doc.querySelector("[data-study-progress]"); const bar = doc.querySelector("[data-progress-bar]"); const note = doc.querySelector("[data-progress-note]"); const reset = doc.querySelector("[data-reset-progress]");
    function render(message) {
      if (count) count.textContent = completed.size + " / " + STUDY_KEYS.length;
      if (bar) bar.style.width = (completed.size / STUDY_KEYS.length * 100) + "%";
      if (note) note.textContent = message || (completed.size === STUDY_KEYS.length ? "主线练习已完成。建议隔一天再独立做综合题。" : "完成六个关键检查后，你就走完主线。");
    }
    function save() { try { root.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(completed))); } catch (_) { /* storage may be unavailable */ } }
    function mark(key) { if (!STUDY_KEYS.includes(key) || completed.has(key)) return; completed.add(key); save(); render("已记录本次练习：" + completed.size + " / " + STUDY_KEYS.length + "。"); }
    if (reset) reset.addEventListener("click", function () { completed.clear(); save(); render("练习记录已清除；页面内容和答案不会被删除。"); });
    render();
    return { mark, size: function () { return completed.size; } };
  }

  function initDerivativeLab(doc) {
    const lab = doc.querySelector("[data-derivative-lab]"); if (!lab) return;
    const buttons = Array.from(lab.querySelectorAll("[data-poly]")); const name = lab.querySelector("[data-poly-name]"); const formula = lab.querySelector("[data-poly-formula]"); const body = lab.querySelector("[data-term-body]"); const result = lab.querySelector("[data-derivative-result]");
    function render(key) {
      const polynomial = POLYNOMIALS[key]; buttons.forEach(function (button) { button.setAttribute("aria-pressed", String(button.dataset.poly === key)); }); name.textContent = polynomial.name; formula.textContent = "f(x) = " + polynomial.display;
      body.innerHTML = polynomial.terms.map(function (term) { const c = term[0]; const n = term[1]; return "<tr><td>" + formatSigned(c) + " · x<sup>" + formatSigned(n) + "</sup></td><td>" + formatSigned(c * n) + "</td><td>" + formatSigned(c * n * (n - 1)) + "</td></tr>"; }).join("");
      const first = evaluateAtOne(polynomial.terms, 1); const second = evaluateAtOne(polynomial.terms, 2);
      result.innerHTML = "<strong>合计：</strong> f′(1) = " + formatSigned(first) + "；f″(1) = " + formatSigned(second) + (key === "unknot" ? "。" : "。注意：两种手性的二阶值相同，不表示多项式相同。");
    }
    buttons.forEach(function (button) { button.addEventListener("click", function () { render(button.dataset.poly); }); }); render("unknot");
  }

  function initDerivativePractice(doc, progress) {
    const box = doc.querySelector("[data-derivative-practice]"); if (!box) return;
    const first = box.querySelector("[data-derivative-first]"); const second = box.querySelector("[data-derivative-second]"); const feedback = box.querySelector("[data-derivative-feedback]");
    box.querySelector("[data-check-derivative]").addEventListener("click", function () {
      const outcome = checkDerivativePractice(first.value === "" ? NaN : Number(first.value), second.value === "" ? NaN : Number(second.value));
      const messages = { missing: "请先填两个空。建议把每个单项式的一阶、二阶贡献分别写在纸上，再求和。", first: "一阶还不对。2x⁻³ 的贡献是 2·(−3)=−6，−x⁴ 的贡献是 −4，常数贡献 0；请把三项相加后再试。", second: "一阶已经对了，二阶还需检查。负幂项用 2·(−3)·(−4)=24；−x⁴ 的贡献是 −4·3=−12。不要把 n(n−1) 写成 n²。", correct: "正确：g′(1)=−10，g″(1)=12。你已正确处理负幂、负系数和常数项。" };
      setFeedback(feedback, outcome.correct, messages[outcome.reason]); if (outcome.correct) progress.mark("derivative");
    });
    box.querySelector("[data-reset-derivative]").addEventListener("click", function () { first.value = ""; second.value = ""; clearFeedback(feedback); first.focus(); });
  }

  function initCorrectionLab(doc, progress) {
    const lab = doc.querySelector("[data-correction-lab]"); if (!lab) return;
    const slider = lab.querySelector("[data-k-slider]"); const value = lab.querySelector("[data-k-value]"); const raw = lab.querySelector("[data-raw-change]"); const square = lab.querySelector("[data-square-change]"); const linear = lab.querySelector("[data-linear-change]"); const total = lab.querySelector("[data-total-change]"); const coverage = lab.querySelector("[data-correction-coverage]"); const viewed = new Set([0]);
    function render(fromInput) {
      const data = correctionLab(Number(slider.value)); value.textContent = "k = " + data.k; raw.textContent = formatSigned(data.deltaSecond); square.textContent = formatSigned(data.squareCorrection); linear.textContent = formatSigned(data.linearCorrection); total.textContent = formatSigned(data.total);
      if (fromInput && [-1, 0, 1].includes(data.k)) viewed.add(data.k); if (coverage) coverage.textContent = "关键值 k=−1,0,1 已核对 " + viewed.size + " / 3。"; if (viewed.size === 3) progress.mark("correction");
    }
    slider.addEventListener("input", function () { render(true); }); render(false);
  }

  function initStepper(doc, progress) {
    const stepper = doc.querySelector("[data-product-stepper]"); if (!stepper) return;
    const stage = stepper.querySelector("[data-step-stage]"); const previous = stepper.querySelector("[data-step-prev]"); const next = stepper.querySelector("[data-step-next]"); const reset = stepper.querySelector("[data-step-reset]"); const count = stepper.querySelector("[data-step-count]"); let index = 0;
    function render() { const step = PRODUCT_STEPS[index]; stage.innerHTML = "<h3>" + step.title + "</h3>" + step.html; count.textContent = "第 " + (index + 1) + " / " + PRODUCT_STEPS.length + " 步"; previous.disabled = index === 0; next.disabled = index === PRODUCT_STEPS.length - 1; if (index === PRODUCT_STEPS.length - 1) progress.mark("product"); }
    previous.addEventListener("click", function () { if (index > 0) { index -= 1; render(); } }); next.addEventListener("click", function () { if (index < PRODUCT_STEPS.length - 1) { index += 1; render(); } }); reset.addEventListener("click", function () { index = 0; render(); stage.focus(); }); render();
  }

  function initQuizzes(doc, progress) {
    Array.from(doc.querySelectorAll("[data-quiz]")).forEach(function (quiz) {
      const output = quiz.querySelector("[data-feedback]");
      Array.from(quiz.querySelectorAll("button[data-answer]")).forEach(function (button) { button.addEventListener("click", function () { const correct = button.dataset.answer === "correct"; setFeedback(output, correct, button.dataset.message); if (correct && quiz.dataset.progressKey) progress.mark(quiz.dataset.progressKey); }); });
    });
  }

  function initFinalCalculator(doc) {
    const calc = doc.querySelector("[data-final-calculator]"); if (!calc) return;
    const buttons = Array.from(calc.querySelectorAll("[data-components]")); const aOut = calc.querySelector("[data-a]"); const bOut = calc.querySelector("[data-b]"); const sumOut = calc.querySelector("[data-sum]"); const resultOut = calc.querySelector("[data-final-result]");
    function render(value) { const pair = value.split(",").map(Number); const answer = finalInvariant(pair[0], pair[1]); buttons.forEach(function (button) { button.setAttribute("aria-pressed", String(button.dataset.components === value)); }); aOut.textContent = formatSigned(pair[0]); bOut.textContent = formatSigned(pair[1]); sumOut.textContent = formatSigned(pair[0] + pair[1]); resultOut.textContent = formatSigned(answer); }
    buttons.forEach(function (button) { button.addEventListener("click", function () { render(button.dataset.components); }); }); render("0,0");
  }

  function initComprehensive(doc, progress) {
    const box = doc.querySelector("[data-comprehensive-exercise]"); if (!box) return;
    const fields = { a: box.querySelector("[data-answer-a]"), b: box.querySelector("[data-answer-b]"), s: box.querySelector("[data-answer-s]"), difference: box.querySelector("[data-answer-difference]"), conclusion: box.querySelector("[data-answer-conclusion]") }; const feedback = box.querySelector("[data-comprehensive-feedback]");
    function readNumber(field) { return field.value === "" ? NaN : Number(field.value); }
    box.querySelector("[data-check-comprehensive]").addEventListener("click", function () {
      const values = { a: readNumber(fields.a), b: readNumber(fields.b), s: readNumber(fields.s), difference: readNumber(fields.difference), conclusion: fields.conclusion.value }; const outcome = checkComprehensive(values);
      const messages = { missing: "还有空没有填写。按 a、b → 代入 S″ → 与 16 作差 → 选择逻辑结论的顺序完成。", a: "a 是第一分量 J₋ 的二阶数据。回看逐项表：6+42−72=−24。", b: "b 来自第二分量 U。fU=1 是常数，所以一、二阶导数都为 0。", s: "a、b 已对，但 S″ 代入有误：16+8(−24+0)=16−192=−176。", difference: "前面的值已对。题目规定顺序是 S″L−S″L′，所以应算 −176−16，而不是取绝对值或倒序。", conclusion: "二阶数值不同能推出两个 S 多项式不相等；但这并没有解决所有 Jones 多项式碰撞。请选择恰好由本题数据支持的结论。", correct: "整题正确：a=−24，b=0，S″L=−176，差为 −192，因此两个 S 多项式不相等。" };
      setFeedback(feedback, outcome.correct, messages[outcome.reason]); if (outcome.correct) progress.mark("comprehensive");
    });
    box.querySelector("[data-reset-comprehensive]").addEventListener("click", function () { Object.keys(fields).forEach(function (key) { fields[key].value = ""; }); clearFeedback(feedback); fields.a.focus(); });
  }

  function init(doc) {
    const progress = createProgressTracker(doc); initDerivativeLab(doc); initDerivativePractice(doc, progress); initCorrectionLab(doc, progress); initStepper(doc, progress); initQuizzes(doc, progress); initFinalCalculator(doc); initComprehensive(doc, progress);
  }

  const api = { POLYNOMIALS, PRODUCT_STEPS, STUDY_KEYS, evaluateAtOne, correctionLab, finalInvariant, checkDerivativePractice, checkComprehensive, init };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.KnotLesson = api;
  if (typeof document !== "undefined") { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { init(document); }); else init(document); }
})(typeof globalThis !== "undefined" ? globalThis : this);
