const assert=require("node:assert/strict");
const {lineSystem,setMember,closureExample,exact}=require("../assets/foundations-labs.js");
const {operationTrace}=require("../assets/matrix-labs.js");

assert.deepEqual(lineSystem(-2,5,-0.5,2),{type:"unique",point:[2,1]});
assert.equal(lineSystem(-1,2,-1,3).type,"no-solution");
assert.equal(lineSystem(-1,2,-1,2).type,"infinite");
assert.deepEqual(lineSystem(-3,-6,-2.5,6).point,[-24,66]);
assert.equal(exact(1/3),"1/3");
assert.equal(exact(-0.5),"-1/2");

let systems=0;
for(let m1=-3;m1<=3;m1++)for(let m2=-3;m2<=3;m2++)for(let h1=-2;h1<=2;h1++)for(let h2=-2;h2<=2;h2++){
  const answer=lineSystem(m1,h1,m2,h2);systems++;
  if(answer.point){const [x,y]=answer.point;assert.ok(Math.abs(y-m1*x-h1)<1e-9);assert.ok(Math.abs(y-m2*x-h2)<1e-9);}
  else assert.equal(answer.type,m1===m2&&h1===h2?"infinite":"no-solution");
}
for(const kind of ["line","quadrant","shifted","cross"]){
  assert.equal(setMember(kind,[0,0]),kind!=="shifted");
  for(let s=kind==="quadrant"?0:-2;s<=2;s+=0.5)for(let t=kind==="quadrant"?0:-2;t<=2;t+=0.5)for(let c=-2;c<=2;c+=0.5){
    const sum=closureExample(kind,s,t,c,"sum"),scaled=closureExample(kind,s,t,c,"scale");
    assert.ok(setMember(kind,sum.u)&&setMember(kind,sum.v));
    if(kind==="line"){assert.ok(sum.inside);assert.ok(scaled.inside);}
    if(kind==="quadrant"){assert.ok(sum.inside);assert.equal(scaled.inside,c>=0);}
    if(kind==="shifted"){assert.equal(sum.inside,false);assert.equal(scaled.inside,c===1);}
    if(kind==="cross"){assert.equal(sum.inside,s===0||t===0);assert.ok(scaled.inside);}
  }
}

const A=[2,1,1,2];
for(const B of [[1,1,0,1],[-3,2,1,-2]])for(let target=0;target<4;target++){
  const row=Math.floor(target/2),col=target%2;
  for(const operation of ["AB","BA","identity"]){
    const trace=operationTrace(A,B,operation,target);
    trace.parts.forEach((part,k)=>{
      assert.deepEqual(part.sources,[{side:"left",index:row*2+k},{side:"right",index:k*2+col}]);
      assert.equal(part.value,trace.left[row*2+k]*trace.right[k*2+col]);
    });
    assert.equal(trace.parts.reduce((sum,part)=>sum+part.value,0),trace.values[target]);
  }
  const transpose=operationTrace(A,B,"transpose",target);
  assert.equal(transpose.parts[0].sources[0].index,col*2+row);
  assert.equal(transpose.values[target],B[col*2+row]);
  const sum=operationTrace(A,B,"sum",target);
  assert.deepEqual(sum.parts.flatMap(part=>part.sources),[{side:"left",index:target},{side:"right",index:target}]);
  assert.equal(sum.values[target],A[target]+B[target]);
  const scale=operationTrace(A,B,"double",target);
  assert.equal(scale.values[target],2*B[target]);
  assert.deepEqual(scale.parts[0].sources,[{side:"scalar",index:0},{side:"right",index:target}]);
  const trace=operationTrace(A,B,"trace",target);
  assert.deepEqual(trace.parts.flatMap(part=>part.sources),[{side:"left",index:0},{side:"left",index:3}]);
  assert.equal(trace.value,B[0]+B[3]);
}
console.log(`${systems} line systems, closure examples, and all matrix arrow source mappings: OK`);
