const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {inner,length,measure,errorSquared,rescale}=require('../assets/inner-product-lab.js');
const {integral}=require('../assets/function-inner-lab.js');
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
let count=0;
for(let x=-3;x<=3;x++)for(let y=-3;y<=3;y++)for(let a=-3;a<=3;a++)for(let b=-3;b<=3;b++)
for(const wx of [.5,1,3])for(const wy of [.5,1,3]){
  const u=[x,y],v=[a,b],w=[wx,wy],m=measure(u,v,w);
  close(inner(u,v,w),inner(v,u,w));close(length(u,w)**2,inner(u,u,w));
  close(inner(rescale(u,w),rescale(v,w)),inner(u,v,w));
  assert.equal(m.angle===null,!(x||y)||!(a||b));
  if(a||b){
    close(inner(m.residual,v,w),0);
    close(m.projection[0]+m.residual[0],x);close(m.projection[1]+m.residual[1],y);
    const minimum=wx*(x-m.coefficient*a)**2+wy*(y-m.coefficient*b)**2;
    for(const delta of [-2,-.25,0,.5,2]){
      const t=m.coefficient+delta;
      const independent=wx*(x-t*a)**2+wy*(y-t*b)**2;
      close(errorSquared(u,v,t,w),independent);
      close(independent,minimum+delta**2*(wx*a*a+wy*b*b));
    }
    if(x||y)assert.ok(m.angle>=0&&m.angle<=180);
  }else {assert.equal(m.projection,null);assert.equal(m.coefficient,null);close(errorSquared(u,v,9,w),wx*x*x+wy*y*y);}
  count++;
}
assert.throws(()=>measure([1,2],[3,4],[1,0]),RangeError);
assert.throws(()=>measure([1,2],[3,4],[1,-1]),RangeError);
close(measure([2,1],[1,1]).coefficient,1.5);
close(measure([2,1],[1,1],[1,3]).coefficient,1.25);
close(measure([2,1],[1,1],[3,1]).coefficient,1.75);
close(measure([2,1],[1,2]).coefficient,.8);
close(measure([2,1],[-1,2]).angle,90);
close(inner([2,1],[-1,2],[1,3]),4);
let functionCount=0;
for(let a=-2;a<=2;a+=.5)for(let b=-2;b<=2;b+=.5)for(let c=-2;c<=2;c+=.5)for(let d=-2;d<=2;d+=.5){
  // Simpson's rule integrates this quadratic exactly: an independent three-point check.
  const product=s=>(a+b*s)*(c+d*s);
  close(integral([a,b],[c,d]),(product(0)+4*product(.5)+product(1))/6);
  assert.ok(integral([a,b],[a,b])>=0);
  assert.equal(integral([a,b],[a,b])===0,!a&&!b);
  functionCount++;
}
close(integral([1,0],[-1,2]),0);close(integral([-1,2],[-1,2]),1/3);
const root=path.resolve(__dirname,'..');
for(const [name,id] of [['08-euclidean-inner-product.html','08'],['09-general-inner-products.html','09']]){
  const file=path.join(root,'lessons',name),html=fs.readFileSync(file,'utf8');
  for(const token of ['data-inner-lab','data-number-check','data-quiz','data-reveal-target','class="beyond"',`data-complete-lesson="linear-${id}"`])assert.ok(html.includes(token),token);
  for(const [,url] of html.matchAll(/(?:href|src)="([^"#]+)"/g))if(!/^https?:/.test(url))assert.ok(fs.existsSync(path.resolve(path.dirname(file),url.split('?')[0])),url);
  for(const [,id] of html.matchAll(/data-reveal-target="#([^"]+)"/g))assert.ok(html.includes(`id="${id}"`));
}
console.log(`Passed ${count} weighted vector pairs, ${functionCount} function pairs, zero/invalid cases, projection minima and lesson links.`);
