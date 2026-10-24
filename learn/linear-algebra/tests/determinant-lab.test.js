const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {determinant,vertices,swapColumns} = require('../assets/determinant-lab.js');
const {multiply} = require('../assets/matrix-labs.js');
// Independent polygon shoelace calculation, including orientation and degeneracy.
const signedArea = points => points.reduce((s,[x,y],i) => {
  const [nx,ny]=points[(i+1)%points.length];return s+x*ny-y*nx;
},0)/2;
let count=0;
for(let a=-3;a<=3;a+=.5)for(let b=-3;b<=3;b+=.5)
for(let c=-3;c<=3;c+=.5)for(let d=-3;d<=3;d+=.5) {
  const M=[a,b,c,d],det=determinant(M);
  assert.ok(signedArea(vertices(M))===det);
  assert.equal(determinant(swapColumns(M))||0,-det||0);
  assert.ok(determinant(M.map(n=>2*n))===4*det);
  assert.ok(determinant([2*a,b,2*c,d])===2*det);
  assert.ok(determinant([a,b+2*a,c,d+2*c])===det);
  assert.ok(determinant(multiply(M,[1,2,-1,3]))===5*det);
  count++;
}
assert.equal(determinant([2,1,1,2]),3);
assert.equal(determinant([1,2,3,1]),-5);
assert.equal(determinant([1,1,2,2]),0);
const triangles=[[[0,0],[2,0],[2,1]],[[2,1],[3,1],[3,3]],[[0,0],[0,2],[1,2]],[[1,2],[1,3],[3,3]]];
triangles.forEach(p=>assert.equal(Math.abs(signedArea(p)),1));
assert.equal(9-triangles.reduce((s,p)=>s+Math.abs(signedArea(p)),0)-2,determinant([2,1,1,2]));
const root=path.resolve(__dirname,'..');
const file=path.join(root,'lessons/07-determinants.html'),html=fs.readFileSync(file,'utf8');
for(const token of ['data-determinant-lab','data-number-check','data-quiz','data-reveal-target','class="beyond"','data-complete-lesson="linear-07"','<canvas','<svg'])assert.ok(html.includes(token),token);
for(const [,url] of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
  if(!/^(https?:|mailto:)/.test(url))assert.ok(fs.existsSync(path.resolve(path.dirname(file),url.split('?')[0])),url);
}
assert.equal((html.match(/data-det-preset=/g)||[]).length,6);
assert.equal((html.match(/type="range"/g)||[]).length,4);
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.equal(Number(index.match(/data-total="(\d+)"/)[1]),[...index.matchAll(/data-lesson-id=/g)].length);
console.log(`Passed: ${count} matrices checked against signed polygon area, determinant laws, lesson structure and links.`);
