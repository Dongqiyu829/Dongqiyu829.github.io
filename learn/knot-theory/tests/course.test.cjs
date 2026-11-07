const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const lesson = require("../assets/course.js");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "assets", "course.css"), "utf8");
const js = fs.readFileSync(path.join(root, "assets", "course.js"), "utf8");

// Laurent derivative arithmetic, including negative exponents.
assert.equal(lesson.evaluateAtOne([[1, -2]], 1), -2);
assert.equal(lesson.evaluateAtOne([[1, -2]], 2), 6);
assert.equal(lesson.evaluateAtOne([[-1, -8]], 1), 8);
assert.equal(lesson.evaluateAtOne([[-1, -8]], 2), -72);
assert.equal(lesson.evaluateAtOne(lesson.POLYNOMIALS.unknot.terms, 2), 0);
assert.equal(lesson.evaluateAtOne(lesson.POLYNOMIALS.positive.terms, 1), 0);
assert.equal(lesson.evaluateAtOne(lesson.POLYNOMIALS.positive.terms, 2), -24);
assert.equal(lesson.evaluateAtOne(lesson.POLYNOMIALS.negative.terms, 1), 0);
assert.equal(lesson.evaluateAtOne(lesson.POLYNOMIALS.negative.terms, 2), -24);

// Practice diagnostics distinguish missing, first-order, and second-order errors.
assert.equal(lesson.checkDerivativePractice(NaN, NaN).reason, "missing");
assert.equal(lesson.checkDerivativePractice(-9, 12).reason, "first");
assert.equal(lesson.checkDerivativePractice(-10, 13).reason, "second");
assert.deepEqual(lesson.checkDerivativePractice(-10, 12), { correct: true, reason: "correct" });

// Correction term cancels for arbitrary k; key teaching examples are exact.
assert.deepEqual(lesson.correctionLab(-1), { k: -1, deltaSecond: 30, squareCorrection: -24, linearCorrection: -6, total: 0 });
assert.deepEqual(lesson.correctionLab(0), { k: 0, deltaSecond: -18, squareCorrection: 24, linearCorrection: -6, total: 0 });
assert.deepEqual(lesson.correctionLab(1), { k: 1, deltaSecond: -66, squareCorrection: 72, linearCorrection: -6, total: 0 });
for (let k = -50; k <= 50; k += 1) assert.equal(lesson.correctionLab(k).total, 0, `correction must cancel at k=${k}`);

assert.equal(lesson.finalInvariant(-24, 0), -176);
assert.equal(lesson.finalInvariant(0, -24), -176);
assert.equal(lesson.finalInvariant(0, 0), 16);
assert.equal(-176 - 16, -192);

const rightConclusion = { a: -24, b: 0, s: -176, difference: -192, conclusion: "different-polynomial" };
assert.equal(lesson.checkComprehensive({ ...rightConclusion, a: 0 }).reason, "a");
assert.equal(lesson.checkComprehensive({ ...rightConclusion, b: -24 }).reason, "b");
assert.equal(lesson.checkComprehensive({ ...rightConclusion, s: 176 }).reason, "s");
assert.equal(lesson.checkComprehensive({ ...rightConclusion, difference: 192 }).reason, "difference");
assert.equal(lesson.checkComprehensive({ ...rightConclusion, conclusion: "all-collisions" }).reason, "conclusion");
assert.equal(lesson.checkComprehensive(rightConclusion).correct, true);

assert.equal(lesson.PRODUCT_STEPS.length, 6);
assert.ok(lesson.PRODUCT_STEPS.some((step) => step.title.includes("(δ²)″(1)=8")));
assert.deepEqual(lesson.STUDY_KEYS, ["terms", "derivative", "detector", "correction", "product", "comprehensive"]);

[
  "两个分量各自均为平凡结",
  "lk(H)=0",
  "split link（分离链环）",
  "lk=0</span> 不等于 split",
  "Whitehead link",
  "投影与交叉",
  "x<sup>−2</sup>",
  "−x<sup>−8</sup>",
  "P(x)=1",
  "Q₂(x)=1+(x−1)²",
  "Q₃(x)=1+(x−1)³",
  "不声称</strong>它们都是某个结或链环的 Jones 多项式",
  "本课采用的已知事实与假设",
  "三幅链环图在一个小球外完全相同",
  "M₀</span> 则按箭头方向重新接线",
  "F=f₊(1)=f₋(1)",
  "|₁</span> 表示",
  "自交叉，沿方向重接会把一个分量拆成两个",
  "混合交叉，重接会把两个分量接成一个结",
  "x<sup>−2</sup>f<sub>+</sub>−x²f<sub>−</sub>",
  "f′<sub>M</sub>(1)=−6lk(M)",
  "−48k−18",
  "校正后的量不随这次换叉改变",
  "(δ²)″(1)=2+6=8",
  "S″<sub>M</sub>(1)=16+8(a+b)",
  "−176−16=−192≠0",
  "不同的 <span class=\"math\">S</span> 也能排除相应同痕",
  "不变量值相同不能自动证明链环同痕"
].forEach((needle) => assert.ok(html.includes(needle), `missing required lesson statement: ${needle}`));

assert.ok(!html.includes("J₂"), "undefined J₂ notation should not appear");
const privateConversationPattern = new RegExp(["chatgpt" + "\\.com\\/c\\/", "6ae7" + "d12e", "9e09" + "3ba9", "74f3" + "def6"].join("|"));
assert.ok(!privateConversationPattern.test(html + css + js), "private conversation reference found");
assert.match(html, /class="readout" aria-live="polite" aria-atomic="true"[^>]*>[\s\S]*data-final-result/);
assert.ok(html.includes('data-derivative-practice'));
assert.ok(html.includes('data-comprehensive-exercise'));
assert.ok(html.includes('data-reset-derivative'));
assert.ok(html.includes('data-reset-comprehensive'));
assert.ok(html.includes('data-study-progress'));
assert.ok(css.includes('@media (max-width: 760px)'));
assert.ok(css.includes('overflow-wrap: anywhere'));

const localLinks = [...html.matchAll(/(?:href|src)="([^"]+)"/g)]
  .map((match) => match[1].split("?")[0].split("#")[0])
  .filter((link) => link && !/^(?:https?:|mailto:)/.test(link));
for (const link of localLinks) assert.ok(fs.existsSync(path.resolve(root, link)), `broken local link: ${link}`);

console.log("knot-theory self-study course: math, pedagogy, diagnostics, scope, privacy, responsive CSS, and local links passed");
