(function(){
  'use strict';
  const I=()=>[[1,0],[0,1]],clone=A=>A.map(r=>r.slice());
  function check(A){if(!Array.isArray(A)||A.length!==2||A.some(r=>!Array.isArray(r)||r.length!==2||r.some(x=>!Number.isFinite(x))))throw new Error('需要有限实数的 2×2 矩阵。');}
  function multiply(A,B){check(A);check(B);return A.map(row=>[0,1].map(j=>row.reduce((s,x,k)=>s+x*B[k][j],0)));}
  function apply(A,x){check(A);if(x.length!==2||x.some(v=>!Number.isFinite(v)))throw new Error('需要两个有限输入分量。');return A.map(r=>r[0]*x[0]+r[1]*x[1]);}
  const scale=(A,s)=>A.map(r=>r.map(x=>x*s)),subtract=(A,B)=>A.map((r,i)=>r.map((x,j)=>x-B[i][j])),norm=x=>Math.hypot(...x);
  function inverse(A){check(A);const [[a,b],[c,d]]=A,det=a*d-b*c;if(det===0)throw new Error('基矩阵不可逆。');return scale([[d,-b],[-c,a]],1/det);}
  const block=(lambda,k=1)=>[[lambda,k],[0,lambda]];
  function power(A,n){check(A);if(!Number.isSafeInteger(n)||n<0)throw new Error('离散步数必须为非负整数。');let out=I(),base=clone(A);while(n){if(n%2)out=multiply(out,base);base=multiply(base,base);n=Math.floor(n/2);}return out;}
  function exponential(lambda,k,t){if(![lambda,k,t].every(Number.isFinite))throw new Error('参数必须有限。');const e=Math.exp(lambda*t),out=[[e,e*k*t],[0,e]];if(out.flat().some(x=>!Number.isFinite(x)))throw new Error('指数超出数值范围。');return out;}
  function similar(A,P){return multiply(multiply(P,A),inverse(P));}
  function eigenspaceDimension(A,lambda,tolerance=0){check(A);const B=subtract(A,scale(I(),lambda)),max=Math.max(...B.flat().map(Math.abs));if(max<=tolerance)return 2;const det=B[0][0]*B[1][1]-B[0][1]*B[1][0];return Math.abs(det)<=tolerance?1:0;}
  function chain(A,lambda,v1,v2){const N=subtract(A,scale(I(),lambda)),first=apply(N,v1),second=apply(N,v2),det=v1[0]*v2[1]-v1[1]*v2[0];return {first,second,firstError:norm(first),secondError:norm(second.map((x,i)=>x-v1[i])),independent:det!==0};}
  function state(lambda,k,t,x){return apply(exponential(lambda,k,t),x);}
  function trajectory(lambda,k,end,x,samples=80){if(!Number.isInteger(samples)||samples<1)throw new Error('采样数需为正整数。');return Array.from({length:samples+1},(_,i)=>{const t=end*i/samples;return {t,x:state(lambda,k,t,x)};});}
  function nilpotent3(t){if(!Number.isFinite(t))throw new Error('时间必须有限。');return [[1,t,t*t/2],[0,1,t],[0,0,1]];}
  const presets={
    identity:{name:'单位矩阵 I',A:I(),values:[1,1],directions:[[1,0],[0,1]],dimension:2},
    diagonal:{name:'不同实根 diag(2,−1)',A:[[2,0],[0,-1]],values:[2,-1],directions:[[1,0],[0,1]],dimension:2},
    jordan:{name:'Jordan 块 J',A:block(1),values:[1,1],directions:[[1,0]],dimension:1,lambda:1,v1:[1,0],v2:[0,1],P:I()},
    similar:{name:'换一组基后的 Jordan 矩阵',A:[[2,-1],[1,0]],values:[1,1],directions:[[1,1]],dimension:1,lambda:1,v1:[1,1],v2:[1,0],P:[[1,1],[1,0]]}
  };
  const api={I,clone,check,multiply,apply,scale,subtract,norm,inverse,block,power,exponential,similar,eigenspaceDimension,chain,state,trajectory,nilpotent3,presets};
  if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.LAJordan=api;
})();
