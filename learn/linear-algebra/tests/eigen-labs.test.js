const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {apply,det,multiply,inverse,eigenInfo,eigenStatus,presets}=require('../assets/eigen-labs');
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`),same=(a,b)=>a.forEach((n,i)=>close(n,b[i]));
const A=presets.A.M,info=eigenInfo(A);assert.deepEqual(info.values,[3,1]);assert.ok(info.diagonalizable);
for(const [v,lambda] of [[[1,1],3],[[1,-1],1],[[-2,-2],3]])same(apply(A,v),v.map(n=>lambda*n));
for(const p of Object.values(presets)){
 const e=eigenInfo(p.M);for(let i=0;i<e.vectors.length;i++)same(apply(p.M,e.vectors[i]),e.vectors[i].map(n=>n*e.values[i]));
 if(e.diagonalizable){same(multiply(multiply(e.P,e.D),e.inverse),p.M);same(multiply(e.P,e.inverse),[1,0,0,1]);for(const v of [[2,1],[-3,3],[0,0]])same(apply(e.P,apply(e.D,apply(e.inverse,v))),apply(p.M,v));}
 else {assert.equal(e.P,null);assert.equal(e.D,null);assert.equal(e.inverse,null);}
}
const I=eigenInfo(presets.I.M);assert.deepEqual(I.values,[1,1]);assert.equal(I.vectors.length,2);assert.ok(I.diagonalizable);
for(const v of [[.1,.7],[-2,3],[1e-200,-2e-200]])assert.equal(eigenStatus(presets.I.M,v).kind,'exact');
const J=eigenInfo(presets.J.M);assert.deepEqual(J.values,[1,1]);assert.equal(J.vectors.length,1);assert.equal(J.diagonalizable,false);
const R=eigenInfo(presets.R.M);assert.equal(R.discriminant,-4);assert.deepEqual(R.values,[]);assert.equal(R.diagonalizable,false);
assert.equal(eigenStatus(A,[0,0]).kind,'zero');assert.equal(eigenStatus(A,[0,0]).lambda,null);
for(const v of [[1,1],[1e-200,1e-200]]){const e=eigenStatus(A,v);assert.equal(e.kind,'exact');close(e.lambda,3);}
assert.equal(eigenStatus(A,[1,1.001]).kind,'near');assert.equal(eigenStatus(A,[1e-200,1.001e-200]).kind,'near');assert.equal(eigenStatus(A,[1,.5]).kind,'off');
const zero=eigenStatus(presets.Z.M,[0,2]);assert.equal(zero.kind,'exact');close(zero.lambda,0);assert.ok(eigenInfo(presets.Z.M).diagonalizable);close(det(presets.Z.M),0);
const negative=eigenStatus(presets.Z.M,[2,0]);assert.equal(negative.kind,'exact');close(negative.lambda,-1);
const O=eigenInfo([0,0,0,0]);assert.ok(O.diagonalizable);assert.deepEqual(O.values,[0,0]);
assert.equal(inverse(presets.J.M).length,4);assert.equal(inverse(presets.Z.M),null);
// Exhaustive small integer matrices: roots must satisfy the characteristic polynomial;
// eigenvectors and valid decompositions are checked against direct multiplication.
let count=0;
for(let a=-3;a<=3;a++)for(let b=-3;b<=3;b++)for(let c=-3;c<=3;c++)for(let d=-3;d<=3;d++){
 const M=[a,b,c,d],e=eigenInfo(M);if(e.values.length){e.values.forEach(l=>close(l*l-(a+d)*l+det(M),0));close(e.values[0]+e.values[1],a+d);close(e.values[0]*e.values[1],det(M));e.vectors.forEach((v,i)=>same(apply(M,v),v.map(n=>n*e.values[i])));if(e.diagonalizable)same(multiply(multiply(e.P,e.D),e.inverse),M);}else assert.ok((a-d)**2+4*b*c<0);count++;
}
const Q=[1/Math.sqrt(2),1/Math.sqrt(2),1/Math.sqrt(2),-1/Math.sqrt(2)];same(multiply(Q,Q),[1,0,0,1]);same(multiply(multiply(Q,[3,0,0,1]),Q),A);
const transfer=[3,2,0,1],t=eigenInfo(transfer);assert.deepEqual(t.values,[3,1]);same(apply(transfer,[-1,1]),[-1,1]);same(multiply(multiply([1,-1,0,1],[3,0,0,1]),[1,1,0,1]),transfer);close(det(transfer),3);
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'lessons/10-eigenvalues-and-eigendecomposition.html'),'utf8');
for(const token of ['data-eigen-explorer','data-eigen-calculator','data-diagonalization-lab','data-eigen-cases','data-number-check','data-quiz','class="beyond"','data-complete-lesson="linear-10"'])assert.ok(html.includes(token),token);
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.ok(index.includes('data-lesson-id="linear-10"'));assert.ok(index.includes('10-eigenvalues-and-eigendecomposition.html'));
const prev=fs.readFileSync(path.join(root,'lessons/09-general-inner-products.html'),'utf8');assert.ok(prev.includes('href="10-eigenvalues-and-eigendecomposition.html"'));
const route=fs.readFileSync(path.join(root,'reference/course-route.html'),'utf8');assert.ok(route.includes('id="lesson-11"'));assert.ok(route.includes('10-eigenvalues-and-eigendecomposition.html'));
console.log(`PASS: ${count} integer spectra, eigenvectors, PDP inverse, repeated/complex/zero/near-zero cases, orthogonal decomposition and new exercise answers.`);
