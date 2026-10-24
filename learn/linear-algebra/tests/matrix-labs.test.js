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
assert.deepEqual(math.multiply(A, [2 / 3, -1 / 3, -1 / 3, 2 / 3]).map((n) => Math.round(n)), [1, 0, 0, 1]);
assert.deepEqual(math.apply(A, [2, 1]), [5, 4]);
assert.deepEqual([math.rank(A), math.rank(S), math.rank([0, 0, 0, 0])], [2, 1, 0]);
assert.deepEqual(math.apply(S, math.nullVector(S)), [0, 0]);

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
console.log("Matrix math, lesson components, and local links: OK");
