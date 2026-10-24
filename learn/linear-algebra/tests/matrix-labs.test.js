const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const math = require("../assets/matrix-labs.js");

const A = [2, 1, 1, 2];
const B = [1, 1, 0, 1];
const S = [1, 1, 2, 2];
assert.deepEqual(math.add(A, B), [3, 2, 1, 3]);
assert.deepEqual(math.scale(B, 2), [2, 2, 0, 2]);
assert.deepEqual(math.transpose(B), [1, 0, 1, 1]);
assert.deepEqual(math.multiply(A, B), [2, 3, 1, 3]);
assert.deepEqual(math.multiply(B, A), [3, 3, 1, 2]);
const inverse = [2 / 3, -1 / 3, -1 / 3, 2 / 3];
for (const product of [math.multiply(A,inverse),math.multiply(inverse,A)]) {
  product.forEach((value,i) => assert.ok(Math.abs(value-[1,0,0,1][i]) < 1e-12));
}
assert.deepEqual(math.apply(A, [2, 1]), [5, 4]);
assert.deepEqual([math.rank(A), math.rank(S), math.rank([0, 0, 0, 0])], [2, 1, 0]);
assert.deepEqual(math.apply(S, math.nullVector(S)), [0, 0]);

// Cover all 2,401 matrices reachable with the integer sliders, including
// zero rows/columns, negative entries and rank changes.
let matrixCount = 0;
for (let a=-3;a<=3;a++) for(let b=-3;b<=3;b++) for(let c=-3;c<=3;c++) for(let d=-3;d<=3;d++) {
  const M=[a,b,c,d]; matrixCount++;
  for (const t of [-2,0,0.5,2]) {
    const demo=math.collisionExample(M,t);
    const sameOutput=demo.startOutput.every((value,i) => value === demo.movedOutput[i]);
    assert.equal(sameOutput,math.rank(M)<2 || t===0,`collision ${M}, t=${t}`);
    if (math.rank(M)===1) {
      assert.ok(demo.direction.some((value)=>value!==0));
      assert.ok(math.apply(M,demo.direction).every((value)=>value===0));
    }
  }
}

for (const [number, file] of [
  ["04", "04-matrix-operations.html"],
  ["05", "05-matrices-and-linear-transformations.html"],
  ["06", "06-inverse-rank-nullspace.html"],
]) {
  const html = fs.readFileSync(path.join(__dirname, "../lessons", file), "utf8");
  for (const required of ["data-quiz", "data-reveal-target", "class=\"beyond\"", `data-complete-lesson=\"linear-${number}\"`, "<canvas"]) {
    assert.ok(html.includes(required), `${file} missing ${required}`);
  }
  for (const match of html.matchAll(/(?:href|src)="([^"#?]+)(?:\?[^"#]*)?"/g)) {
    const url = match[1];
    if (/^(?:https?:)?\/\//.test(url)) continue;
    assert.ok(fs.existsSync(path.resolve(__dirname, "../lessons", url)), `${file} broken link ${url}`);
  }
}
console.log(`Matrix math, ${matrixCount} interactive matrices, lesson components, and local links: OK`);
