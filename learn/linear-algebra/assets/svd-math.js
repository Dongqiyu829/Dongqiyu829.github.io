(function(){
  'use strict';
  const zeros=(m,n)=>Array.from({length:m},()=>Array(n).fill(0));
  const identity=n=>Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>+(i===j)));
  function shape(A){if(!Array.isArray(A)||!A.length||!Array.isArray(A[0])||!A[0].length||A.some(r=>r.length!==A[0].length||r.some(x=>!Number.isFinite(x))))throw new Error('需要非空、各行等长的有限实数矩阵。');return [A.length,A[0].length];}
  const transpose=A=>A[0].map((_,j)=>A.map(r=>r[j]));
  const dot=(u,v)=>u.reduce((s,x,i)=>s+x*v[i],0);
  const norm=v=>Math.hypot(...v);
  function multiply(A,B){const [m,n]=shape(A),[p,q]=shape(B);if(n!==p)throw new Error('矩阵内维数必须相等。');return Array.from({length:m},(_,i)=>Array.from({length:q},(_,j)=>A[i].reduce((s,a,k)=>s+a*B[k][j],0)));}
  function apply(A,x){const [,n]=shape(A);if(x.length!==n||x.some(v=>!Number.isFinite(v)))throw new Error('输入维数或数值无效。');return A.map(row=>dot(row,x));}
  const frobenius=A=>Math.hypot(...A.flat());
  const subtract=(A,B)=>A.map((row,i)=>row.map((x,j)=>x-B[i][j]));
  // One-sided Jacobi rotations work on A itself, avoiding squared conditioning of A^T A.
  // A^T A is shown for the mathematical derivation, not used as the numerical solver.
  function tallSVD(A){
    const [m,n]=shape(A),scale=Math.max(...A.flat().map(Math.abs)),B=A.map(r=>r.map(x=>scale?x/scale:0)),V=identity(n);
    let converged=scale===0;
    for(let sweep=0;sweep<100&&!converged;sweep++){
      converged=true;
      for(let p=0;p<n;p++)for(let q=p+1;q<n;q++){
        let a=0,b=0,g=0;for(let i=0;i<m;i++){a+=B[i][p]**2;b+=B[i][q]**2;g+=B[i][p]*B[i][q];}
        if(!a||!b||Math.abs(g)<=8*Number.EPSILON*Math.sqrt(a*b))continue;
        converged=false;const tau=(b-a)/(2*g),t=(tau>=0?1:-1)/(Math.abs(tau)+Math.hypot(1,tau)),c=1/Math.hypot(1,t),s=c*t;
        for(const M of [B,V])for(let i=0;i<M.length;i++){const u=M[i][p],v=M[i][q];M[i][p]=c*u-s*v;M[i][q]=s*u+c*v;}
      }
    }
    if(!converged)throw new Error('小型 SVD 未收敛；请重置输入。');
    const order=Array.from({length:n},(_,j)=>j).sort((p,q)=>norm(B.map(r=>r[q]))-norm(B.map(r=>r[p]))),values=[],columns=[];
    const basisTolerance=64*Number.EPSILON*Math.max(m,n);
    for(const j of order){const column=B.map(r=>r[j]),length=norm(column),unit=length?column.map(x=>x/length):null;
      // Preserve representable tiny orthogonal directions; do not confuse the rank
      // cutoff with setting a positive singular value to zero in the SVD itself.
      const tinyOrthogonal=unit&&columns.filter(Boolean).every(u=>Math.abs(dot(u,unit))<1e-12);
      if(length>basisTolerance||tinyOrthogonal){values.push(length*scale);columns.push(unit);}else{values.push(0);columns.push(null);}}
    // Complete the output basis for zero singular values and rectangular excess dimensions.
    const used=columns.filter(Boolean);
    function complement(){for(let k=0;k<m;k++){let v=Array.from({length:m},(_,i)=>+(i===k));for(let pass=0;pass<2;pass++)for(const u of used){const c=dot(u,v);v=v.map((x,i)=>x-c*u[i]);}const length=norm(v);if(length>1e-10){v=v.map(x=>x/length);used.push(v);return v;}}throw new Error('无法补齐正交基。');}
    for(let j=0;j<n;j++)if(!columns[j])columns[j]=complement();while(columns.length<m)columns.push(complement());
    return {U:transpose(columns),V:V.map(row=>order.map(j=>row[j])),values};
  }
  function svd(A,{rcond=1e-10}={}){
    const [m,n]=shape(A);if(!Number.isFinite(rcond)||rcond<0||rcond>=1)throw new Error('相对阈值需在 [0,1) 内。');
    const raw=m>=n?tallSVD(A):tallSVD(transpose(A)),U=m>=n?raw.U:raw.V,V=m>=n?raw.V:raw.U,values=raw.values;
    const threshold=(values[0]||0)*rcond,rank=values.filter(s=>s>threshold).length,Sigma=zeros(m,n);values.forEach((s,i)=>Sigma[i][i]=s);
    return {U,V,values,Sigma,rank,threshold,rcond,rows:m,cols:n,truncated:values.some(s=>s>0&&s<=threshold)};
  }
  // Exact 2x2 determinant test on the current finite decimal entries. No SVD
  // cutoff, rounded products or underflow may turn a thin ellipse into a line.
  // Fraction inputs are first converted to the stored decimal by the UI parser.
  function exactRank2(A){
    const [m,n]=shape(A);if(m!==2||n!==2)throw new Error('此精确形状判定只用于 2×2 实验。');
    function decimal(x){const [mantissa,e='0']=String(x).toLowerCase().split('e'),[whole,fraction='']=mantissa.split('.');return [BigInt(whole+fraction),Number(e)-fraction.length];}
    const [a,b,c,d]=A.flat().map(decimal),left=[a[0]*d[0],a[1]+d[1]],right=[b[0]*c[0],b[1]+c[1]],exponent=Math.min(left[1],right[1]);
    const determinant=left[0]*10n**BigInt(left[1]-exponent)-right[0]*10n**BigInt(right[1]-exponent);
    return determinant!==0n?2:A.flat().some(x=>x!==0)?1:0;
  }
  function shapeModels(A,info=svd(A)){const exactRank=exactRank2(A);return {exactRank,numericalRank:info.rank,threshold:info.threshold,answer:exactRank+'/'+info.rank};}
  function svdCoordinates(A,x,info=svd(A)){const inputBasis=apply(transpose(info.V),x),outputBasis=apply(info.Sigma,inputBasis);return {input:x.slice(),inputBasis,outputBasis,output:apply(info.U,outputBasis),directOutput:apply(A,x)};}
  function reconstruct(info,k=info.values.length){if(!Number.isInteger(k)||k<0||k>info.values.length)throw new Error('k 超出奇异值数量。');const S=zeros(info.rows,info.cols);for(let i=0;i<k;i++)S[i][i]=info.values[i];return multiply(multiply(info.U,S),transpose(info.V));}
  function pseudoinverse(A,options){const info=svd(A,options),S=zeros(info.cols,info.rows);info.values.forEach((s,i)=>{if(s>info.threshold)S[i][i]=1/s;});return {matrix:multiply(multiply(info.V,S),transpose(info.U)),info};}
  function leastSquares(A,b,options){const {matrix,info}=pseudoinverse(A,options),x=apply(matrix,b),fitted=apply(A,x),residual=b.map((v,i)=>v-fitted[i]);return {x,fitted,residual,sse:dot(residual,residual),normalResidual:apply(transpose(A),residual),norm:norm(x),info,pseudoinverse:matrix};}
  function fitLine(points,options){if(points.length<2||points.some(p=>p.length!==2||p.some(x=>!Number.isFinite(x))))throw new Error('至少需要两个有限二维观测点。');const X=points.map(([x])=>[1,x]),y=points.map(p=>p[1]);return {...leastSquares(X,y,options),X,y,normal:multiply(transpose(X),X),rhs:apply(transpose(X),y)};}
  function toyImage(kind='toy',n=16){return Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>kind==='zero'?0:kind==='rank1'?(.15+.7*i/(n-1))*(.25+.75*j/(n-1)):.1+.18*i/(n-1)+.15*j/(n-1)+(Math.hypot(i-n*.48,j-n*.5)<n*.28?.38:0)+(i>n*.65&&j<n*.42?.16:0)));}
  const presets={shear:{A:[[1,2],[0,1]],name:'剪切：不能对角化'},identity:{A:[[1,0],[0,1]],name:'单位矩阵：重奇异值'},stretch:{A:[[2,0],[0,1]],name:'沿轴伸缩'},rotation:{A:[[0,-1],[1,0]],name:'旋转 90°'},reflection:{A:[[1,0],[0,-1]],name:'反射'},rank1:{A:[[1,1],[2,2]],name:'秩一：圆压成线段'},zero:{A:[[0,0],[0,0]],name:'零矩阵：压成原点'},near:{A:[[1,0],[0,1e-11]],name:'近奇异：小方向仍非零'}};
  const api={zeros,identity,shape,transpose,dot,norm,multiply,apply,frobenius,subtract,svd,exactRank2,shapeModels,svdCoordinates,reconstruct,pseudoinverse,leastSquares,fitLine,toyImage,presets};
  if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.LASVD=api;
})();
