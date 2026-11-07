const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const lesson = require("../assets/course.js");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "assets", "course.css"), "utf8");

assert.equal(lesson.evaluateAtOne(lesson.POLYNOMIALS.unknot.terms, 2), 0);
assert.equal(lesson.evaluateAtOne(lesson.POLYNOMIALS.positive.terms, 1), 0);
assert.equal(lesson.evaluateAtOne(lesson.POLYNOMIALS.positive.terms, 2), -24);
assert.equal(lesson.evaluateAtOne(lesson.POLYNOMIALS.negative.terms, 1), 0);
assert.equal(lesson.evaluateAtOne(lesson.POLYNOMIALS.negative.terms, 2), -24);

for (let k = -50; k <= 50; k += 1) {
  assert.equal(lesson.correctionLab(k).total, 0, `correction must cancel at k=${k}`);
}

assert.equal(lesson.finalInvariant(-24, 0), -176);
assert.equal(lesson.finalInvariant(0, -24), -176);
assert.equal(lesson.finalInvariant(0, 0), 16);
assert.equal(-176 - 16, -192);

[
  "lk=0</span> 不等于链环分离",
  "每个分量单独看都是平凡结",
  "x<sup>−2</sup>f<sub>+</sub>−x²f<sub>−</sub>",
  "f′<sub>M</sub>(1)=−6lk(M)",
  "−48k−18",
  "24lk(M)²−6lk(M)",
  "S″<sub>M</sub>(1)=16+8(a+b)",
  "−176",
  "−192≠0",
  "相同二阶导数不能证明多项式相同",
  "不承诺",
  "替换前",
  "替换后",
  "本课直接定义需要比较的 Laurent 多项式组合"
].forEach((needle) => assert.ok(html.includes(needle), `missing required lesson statement: ${needle}`));

assert.ok(!html.includes("J₂"), "undefined J₂ notation should not appear in the beginner lesson");
assert.match(html, /class="readout" aria-live="polite" aria-atomic="true"[^>]*>[\s\S]*data-final-result/);

assert.ok(html.includes('data-derivative-lab'));
assert.ok(html.includes('data-correction-lab'));
assert.ok(html.includes('data-product-stepper'));
assert.ok(html.includes('data-quiz'));
assert.ok(css.includes('@media (max-width: 760px)'));
assert.ok(css.includes('overflow-wrap: anywhere'));

const localLinks = [...html.matchAll(/(?:href|src)="([^"]+)"/g)]
  .map((match) => match[1].split("?")[0].split("#")[0])
  .filter((link) => link && !/^(?:https?:|mailto:)/.test(link));

for (const link of localLinks) {
  const target = path.resolve(root, link);
  assert.ok(fs.existsSync(target), `broken local link: ${link}`);
}

console.log("knot-theory course: math, required content, interactions, responsive CSS, and local links passed");
