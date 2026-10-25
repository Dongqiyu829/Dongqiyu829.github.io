(function(){
  'use strict';
  const apply=([a,b,c,d],[x,y])=>[a*x+b*y,c*x+d*y];
  const quadratic=(M,v)=>{const out=apply(M,v);return v[0]*out[0]+v[1]*out[1];};
  const symmetricPart=([a,b,c,d])=>[a,(b+c)/2,(b+c)/2,d];
  const classifyValues=([a,b])=>a>0&&b>0?'PD':a<0&&b<0?'ND':a===0&&b===0?'ZERO':a>=0&&b>=0?'PSD':a<=0&&b<=0?'NSD':'IND';
  function rotation(degrees){if(degrees%45===0){const h=Math.SQRT1_2,[c,s]=[[1,0],[h,h],[0,1],[-h,h],[-1,0],[-h,-h],[0,-1],[h,-h]][((degrees/45)%8+8)%8];return [c,-s,s,c];}const t=degrees*Math.PI/180;if(degrees%90===0){const [c,s]=[[1,0],[0,1],[-1,0],[0,-1]][((degrees/90)%4+4)%4];return [c,-s,s,c];}const c=Math.cos(t),s=Math.sin(t);return [c,-s,s,c];}
  function fromSpectrum(values,degrees){const Q=rotation(degrees),[l,m]=values,[c,minusS,s]=Q;return {Q,M:[l*c*c+m*s*s,(l-m)*c*s,(l-m)*c*s,l*s*s+m*c*c],values:values.slice(),kind:classifyValues(values)};}
  function analyze(M){
    if(M.length!==4||M.some(n=>!Number.isFinite(n))||M[1]!==M[2])throw new Error('本判据要求有限的实对称 2×2 矩阵。');
    const [a,b,,d]=M,trace=a+d,det=a*d-b*b,delta=Math.hypot(a-d,2*b);let values=[(trace+delta)/2,(trace-delta)/2];
    // Recover the small root from the determinant to avoid cancellation at a flat direction.
    if(Math.abs(values[0])>=Math.abs(values[1])&&values[0]!==0)values[1]=det/values[0];else if(values[1]!==0)values[0]=det/values[1];
    values=values.map(n=>Object.is(n,-0)?0:n);const angle=Math.atan2(2*b,a-d)*90/Math.PI,Q=rotation(angle);
    const kind=det<0?'IND':det>0?(trace>0?'PD':'ND'):trace>0?'PSD':trace<0?'NSD':'ZERO';return {values,Q,angle,trace,det,kind};
  }
  const coordinates=(Q,[x,y])=>[Q[0]*x+Q[2]*y,Q[1]*x+Q[3]*y];
  function mesh(M,steps=24,extent=3,value=v=>quadratic(M,v)){const vertices=[];for(let j=0;j<=steps;j++)for(let i=0;i<=steps;i++){const v=[-extent+2*extent*i/steps,-extent+2*extent*j/steps];vertices.push([...v,value(v)]);}const faces=[];for(let j=0;j<steps;j++)for(let i=0;i<steps;i++){const k=j*(steps+1)+i;faces.push([k,k+1,k+steps+2,k+steps+1]);}return {vertices,faces};}
  function contours(M,levels=[-8,-4,-2,-1,0,1,2,4,8],steps=48,value=v=>quadratic(M,v)){
    if(M.every(n=>n===0))return [];const {vertices,faces}=mesh(M,steps,3,value),segments=[];
    for(const f of faces)for(const triangle of [[f[0],f[1],f[2]],[f[0],f[2],f[3]]]){const points=triangle.map(i=>vertices[i]);for(const level of levels){if(points.every(p=>p[2]===level))continue;const hits=[];const add=p=>{if(!hits.some(q=>Math.hypot(p[0]-q[0],p[1]-q[1])<1e-10))hits.push(p);};for(let i=0;i<3;i++){const p=points[i],q=points[(i+1)%3];if(p[2]===level)add(p.slice(0,2));if(q[2]===level)add(q.slice(0,2));if((p[2]<level&&q[2]>level)||(p[2]>level&&q[2]<level)){const t=(level-p[2])/(q[2]-p[2]);add([p[0]+t*(q[0]-p[0]),p[1]+t*(q[1]-p[1])]);}}if(hits.length===2)segments.push({level,points:hits});}}
    return segments;
  }
  const presets={A:{M:[2,1,1,2],name:'A：向上碗'},ND:{M:[-2,-1,-1,-2],name:'向下碗'},PSD:{M:[1,1,1,1],name:'有平坦方向的谷'},NSD:{M:[-1,-1,-1,-1],name:'有平坦方向的倒谷'},IND:{M:[1,2,2,1],name:'鞍面'},ZERO:{M:[0,0,0,0],name:'整个平面为零'}};
  const api={apply,quadratic,symmetricPart,classifyValues,rotation,fromSpectrum,analyze,coordinates,mesh,contours,presets};
  if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.LAQuadratic=api;
})();
