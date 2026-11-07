(function (root) {
  "use strict";

  const POLYNOMIALS = {
    unknot: { name: "平凡结 U", display: "1", terms: [[1, 0]] },
    positive: { name: "三叶结 J₊", display: "x² + x⁶ − x⁸", terms: [[1, 2], [1, 6], [-1, 8]] },
    negative: { name: "镜像三叶结 J₋", display: "x⁻² + x⁻⁶ − x⁻⁸", terms: [[1, -2], [1, -6], [-1, -8]] }
  };

  function evaluateAtOne(terms, order) {
    return terms.reduce(function (sum, term) {
      const coefficient = term[0];
      const exponent = term[1];
      if (order === 0) return sum + coefficient;
      if (order === 1) return sum + coefficient * exponent;
      if (order === 2) return sum + coefficient * exponent * (exponent - 1);
      throw new Error("Only derivative orders 0, 1, and 2 are supported.");
    }, 0);
  }

  function correctionLab(k) {
    const deltaSecond = -48 * k - 18;
    const squareCorrection = 24 * (2 * k + 1);
    const linearCorrection = -6;
    return {
      k: k,
      deltaSecond: deltaSecond,
      squareCorrection: squareCorrection,
      linearCorrection: linearCorrection,
      total: deltaSecond + squareCorrection + linearCorrection
    };
  }

  function finalInvariant(a, b) {
    return 16 + 8 * (a + b);
  }

  const PRODUCT_STEPS = [
    {
      title: "先记住三个在 x=1 的数据",
      html: "<p><span class=\"math\">p=f<sub>K₁</sub>f<sub>K₂</sub></span>。每个结都满足 <span class=\"math\">f(1)=1</span> 与 <span class=\"math\">f′(1)=0</span>，所以 <span class=\"math\">p(1)=1</span>、<span class=\"math\">p′(1)=0</span>、<span class=\"math\">p″(1)=a+b</span>。</p>"
    },
    {
      title: "为什么 p″ 里没有交叉项？",
      html: "<p><span class=\"math\">p″=f″<sub>K₁</sub>f<sub>K₂</sub>+2f′<sub>K₁</sub>f′<sub>K₂</sub>+f<sub>K₁</sub>f″<sub>K₂</sub></span>。代入 x=1，中间项是 <span class=\"math\">2·0·0=0</span>，因此只剩 <span class=\"math\">a+b</span>。</p>"
    },
    {
      title: "对 δfM 用二阶乘积法则",
      html: "<p><span class=\"math\">δ(1)=−2，δ′(1)=0，δ″(1)=−2</span>；而二分量链环 <span class=\"math\">f<sub>M</sub>(1)=−2</span>、当 <span class=\"math\">lk=0</span> 时 <span class=\"math\">f′<sub>M</sub>(1)=0</span>。所以 <span class=\"math\">(δf<sub>M</sub>)″=δ″f<sub>M</sub>+2δ′f′<sub>M</sub>+δf″<sub>M</sub>=4−2f″<sub>M</sub></span>。</p>"
    },
    {
      title: "对 δ²p 用二阶乘积法则",
      html: "<p><span class=\"math\">δ²(1)=4，(δ²)′(1)=0，(δ²)″(1)=8</span>。于是 <span class=\"math\">(δ²p)″=8·1+2·0·0+4(a+b)=8+4(a+b)</span>。</p>"
    },
    {
      title: "合并两部分",
      html: "<p>由校正恒等式且 <span class=\"math\">lk=0</span>，<span class=\"math\">f″<sub>M</sub>=−2−2(a+b)</span>。故 <span class=\"math\">S″<sub>M</sub>=(4−2f″<sub>M</sub>)+(8+4(a+b))=16+8(a+b)</span>。</p><p><strong>这一步就是最终的二阶检测器。</strong></p>"
    }
  ];

  function formatSigned(n) {
    return n < 0 ? "−" + Math.abs(n) : String(n);
  }

  function initDerivativeLab(doc) {
    const lab = doc.querySelector("[data-derivative-lab]");
    if (!lab) return;
    const buttons = Array.from(lab.querySelectorAll("[data-poly]"));
    const name = lab.querySelector("[data-poly-name]");
    const formula = lab.querySelector("[data-poly-formula]");
    const body = lab.querySelector("[data-term-body]");
    const result = lab.querySelector("[data-derivative-result]");

    function render(key) {
      const polynomial = POLYNOMIALS[key];
      buttons.forEach(function (button) {
        button.setAttribute("aria-pressed", String(button.dataset.poly === key));
      });
      name.textContent = polynomial.name;
      formula.textContent = "f(x) = " + polynomial.display;
      body.innerHTML = polynomial.terms.map(function (term) {
        const c = term[0];
        const n = term[1];
        return "<tr><td>" + formatSigned(c) + " · x<sup>" + formatSigned(n) + "</sup></td><td>" + formatSigned(c * n) + "</td><td>" + formatSigned(c * n * (n - 1)) + "</td></tr>";
      }).join("");
      const first = evaluateAtOne(polynomial.terms, 1);
      const second = evaluateAtOne(polynomial.terms, 2);
      result.innerHTML = "<strong>合计：</strong> f′(1) = " + formatSigned(first) + "；f″(1) = " + formatSigned(second) + (key === "unknot" ? "。" : "。两种手性的二阶值相同，但这不表示它们的多项式相同。");
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () { render(button.dataset.poly); });
    });
    render("unknot");
  }

  function initCorrectionLab(doc) {
    const lab = doc.querySelector("[data-correction-lab]");
    if (!lab) return;
    const slider = lab.querySelector("[data-k-slider]");
    const value = lab.querySelector("[data-k-value]");
    const raw = lab.querySelector("[data-raw-change]");
    const square = lab.querySelector("[data-square-change]");
    const linear = lab.querySelector("[data-linear-change]");
    const total = lab.querySelector("[data-total-change]");

    function render() {
      const data = correctionLab(Number(slider.value));
      value.textContent = "k = " + data.k;
      raw.textContent = formatSigned(data.deltaSecond);
      square.textContent = formatSigned(data.squareCorrection);
      linear.textContent = formatSigned(data.linearCorrection);
      total.textContent = formatSigned(data.total);
    }
    slider.addEventListener("input", render);
    render();
  }

  function initStepper(doc) {
    const stepper = doc.querySelector("[data-product-stepper]");
    if (!stepper) return;
    const stage = stepper.querySelector("[data-step-stage]");
    const previous = stepper.querySelector("[data-step-prev]");
    const next = stepper.querySelector("[data-step-next]");
    const reset = stepper.querySelector("[data-step-reset]");
    const count = stepper.querySelector("[data-step-count]");
    let index = 0;

    function render() {
      const step = PRODUCT_STEPS[index];
      stage.innerHTML = "<h3>" + step.title + "</h3>" + step.html;
      count.textContent = "第 " + (index + 1) + " / " + PRODUCT_STEPS.length + " 步";
      previous.disabled = index === 0;
      next.disabled = index === PRODUCT_STEPS.length - 1;
    }
    previous.addEventListener("click", function () { if (index > 0) { index -= 1; render(); } });
    next.addEventListener("click", function () { if (index < PRODUCT_STEPS.length - 1) { index += 1; render(); } });
    reset.addEventListener("click", function () { index = 0; render(); stage.focus(); });
    render();
  }

  function initQuizzes(doc) {
    const quizzes = Array.from(doc.querySelectorAll("[data-quiz]"));
    quizzes.forEach(function (quiz) {
      const output = quiz.querySelector("[data-feedback]");
      Array.from(quiz.querySelectorAll("button[data-answer]")).forEach(function (button) {
        button.addEventListener("click", function () {
          const correct = button.dataset.answer === "correct";
          output.textContent = button.dataset.message;
          output.className = "feedback " + (correct ? "correct" : "incorrect");
          output.dataset.result = correct ? "correct" : "incorrect";
        });
      });
    });
  }

  function initFinalCalculator(doc) {
    const calc = doc.querySelector("[data-final-calculator]");
    if (!calc) return;
    const buttons = Array.from(calc.querySelectorAll("[data-components]"));
    const aOut = calc.querySelector("[data-a]");
    const bOut = calc.querySelector("[data-b]");
    const sumOut = calc.querySelector("[data-sum]");
    const resultOut = calc.querySelector("[data-final-result]");
    function render(value) {
      const pair = value.split(",").map(Number);
      const answer = finalInvariant(pair[0], pair[1]);
      buttons.forEach(function (button) { button.setAttribute("aria-pressed", String(button.dataset.components === value)); });
      aOut.textContent = formatSigned(pair[0]);
      bOut.textContent = formatSigned(pair[1]);
      sumOut.textContent = formatSigned(pair[0] + pair[1]);
      resultOut.textContent = formatSigned(answer);
    }
    buttons.forEach(function (button) { button.addEventListener("click", function () { render(button.dataset.components); }); });
    render("0,0");
  }

  function init(doc) {
    initDerivativeLab(doc);
    initCorrectionLab(doc);
    initStepper(doc);
    initQuizzes(doc);
    initFinalCalculator(doc);
  }

  const api = {
    POLYNOMIALS: POLYNOMIALS,
    PRODUCT_STEPS: PRODUCT_STEPS,
    evaluateAtOne: evaluateAtOne,
    correctionLab: correctionLab,
    finalInvariant: finalInvariant,
    init: init
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.KnotLesson = api;
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { init(document); });
    else init(document);
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
