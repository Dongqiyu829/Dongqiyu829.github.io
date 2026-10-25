const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const m=require('../assets/quadratic-math'),{tasks}=require('../assets/eigen-practice'),eigen=require('../assets/eigen-labs');
const close=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
const manual=([a,b,c,d],[x,y])=>a*x*x+(b+c)*x*y+d*y*y;
for(const [M,kind] of [[[2,1,1,2],'PD'],[[-2,-1,-1,-2],'ND'],[[1,1,1,1],'PSD'],[[-1,-1,-1,-1],'NSD'],[[1,2,2,1],'IND'],[[0,0,0,0],'ZERO'],[[2,0,0,2],'PD'],[[-2,0,0,-2],'ND'],[[0,0,0,1],'PSD'],[[0,0,0,-1],'NSD']])assert.equal(m.analyze(M).kind,kind);
assert.deepEqual(m.analyze([1,1,1,1]).values,[2,0]);
let count=0;
for(let a=-4;a<=4;a+=.25)for(let b=-4;b<=4;b+=.25)for(let d=-4;d<=4;d+=.25){const M=[a,b,b,d],s=m.analyze(M),[l,k]=s.values;close(l+k,a+d);close(l*k,a*d-b*b);assert.equal(s.kind,m.classifyValues(s.values));
  for(const v of [[1,0],[0,1],[1,1],[1,-1],[2,-1]]){const c=m.coordinates(s.Q,v),q=manual(M,v);close(m.quadratic(M,v),q);close(q,l*c[0]**2+k*c[1]**2);if(s.kind==='PD')assert.ok(q>0);if(s.kind==='ND')assert.ok(q<0);if(s.kind==='PSD')assert.ok(q>=0);if(s.kind==='NSD')assert.ok(q<=0);}
  for(let i=0;i<2;i++){const v=[s.Q[i],s.Q[2+i]],out=m.apply(M,v);out.forEach((n,j)=>close(n,s.values[i]*v[j]));}close(s.Q[0]*s.Q[1]+s.Q[2]*s.Q[3],0);count++;
}
for(const values of [[3,1],[-2,-1],[2,0],[-2,0],[2,-1],[0,0],[2,2]])for(const angle of [0,15,30,45,90,135,180]){const s=m.fromSpectrum(values,angle);assert.equal(s.kind,m.classifyValues(values));for(const v of [[1,-1],[2,.5],[-3,1]]){const c=m.coordinates(s.Q,v),q=values[0]*c[0]**2+values[1]*c[1]**2;close(manual(s.M,v),q);if(s.kind==='PSD')assert.ok(q>=0);}}
let contourCount=0;
for(const M of [...Object.values(m.presets).map(p=>p.M),[4,3,3,4],[4,2,2,1]]){
 const mesh=m.mesh(M);mesh.vertices.forEach(([x,y,z])=>close(z,manual(M,[x,y])));const lines=m.contours(M);if(M.every(n=>n===0))assert.deepEqual(lines,[]);
 for(const line of lines)for(const p of line.points){assert.ok(p.every(n=>n>=-3-1e-9&&n<=3+1e-9));close(manual(M,p),line.level,.064);contourCount++;}
}
const nonSym=[1,2,0,1],S=m.symmetricPart(nonSym);assert.deepEqual(S,[1,1,1,1]);for(const v of [[1,-1],[1,2],[-3,.5]])close(manual(nonSym,v),manual(S,v));assert.throws(()=>m.analyze(nonSym));
close(m.quadratic([2,3,3,2],[1,1]),10);close(m.quadratic([2,3,3,2],[1,-1]),-2);assert.equal(m.analyze([2,3,3,2]).det,-5);
assert.equal(m.analyze([4,2,2,1]).kind,'PSD');close(m.quadratic([4,2,2,1],[1,-2]),0);close(m.quadratic([1,0,0,0],[0,1]),0);
// Lesson 10's added active and negative-root practice is independently verified.
for(const [key,M] of [['A',[2,1,1,2]],['C',[4,1,2,3]]]){const [l,k,y,z]=tasks[key].values;for(const [lambda,v] of [[l,[1,y]],[k,[1,z]]])eigen.apply(M,v).forEach((n,i)=>close(n,lambda*v[i]));}
assert.deepEqual(eigen.eigenInfo([0,2,1,1]).values,[2,-1]);assert.deepEqual(eigen.apply([0,2,1,1],[-2,1]),[2,-1]);
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'lessons/11-definiteness.html'),'utf8');for(const token of ['data-quadratic-explorer','data-eigen-geometry','data-definiteness-challenge','data-number-check','data-quiz','class="beyond"','data-complete-lesson="linear-11"'])assert.ok(html.includes(token));
// Regression: contour annotations consume the shared drawing context.
const vm=require('node:vm'),context={window:{},devicePixelRatio:1};vm.runInNewContext(fs.readFileSync(path.join(root,'assets/plane-tools.js'),'utf8'),context);
const ctx={setTransform(){},clearRect(){},beginPath(){},setLineDash(){},moveTo(){},lineTo(){},stroke(){},fillText(){}};
const canvas={getBoundingClientRect:()=>({width:320,height:320}),getContext:()=>ctx};const view=context.window.LAPlane.plane(canvas,3);assert.equal(view.ctx,ctx);assert.ok(view.unit>0);assert.equal(canvas.width,320);
const previous=fs.readFileSync(path.join(root,'lessons/10-eigenvalues-and-eigendecomposition.html'),'utf8');assert.ok(previous.includes('href="11-definiteness.html"'));assert.ok(previous.includes('eigen-practice.js'));assert.equal([...previous.matchAll(/阶段[一二三]检查/g)].length,3);
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.ok(index.includes('data-lesson-id="linear-11"'));const route=fs.readFileSync(path.join(root,'reference/course-route.html'),'utf8');assert.ok(route.includes('id="lesson-12"'));assert.ok(route.includes('11-definiteness.html'));
console.log(`PASS: ${count} symmetric quarter-step matrices; quadratic/spectral identities, ${contourCount} contour endpoints, surface vertices, all sign/zero cases, symmetric part and lesson 10 practice.`);
