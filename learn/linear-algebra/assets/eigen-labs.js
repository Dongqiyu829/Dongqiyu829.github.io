(function(){
  'use strict';
  const apply=([a,b,c,d],[x,y])=>[a*x+b*y,c*x+d*y];
  const det=([a,b,c,d])=>a*d-b*c;
  const multiply=(A,B)=>[A[0]*B[0]+A[1]*B[2],A[0]*B[1]+A[1]*B[3],A[2]*B[0]+A[3]*B[2],A[2]*B[1]+A[3]*B[3]];
  function inverse(M){const d=det(M);return d===0?null:[M[3]/d,-M[1]/d,-M[2]/d,M[0]/d];}
  function eigenInfo(M){
    const [a,b,c,d]=M,trace=a+d,determinant=det(M),discriminant=(a-d)**2+4*b*c;
    if(discriminant<0)return {trace,determinant,discriminant,values:[],vectors:[],diagonalizable:false,P:null,D:null,inverse:null};
    const root=Math.sqrt(discriminant),values=[(trace+root)/2,(trace-root)/2],vectors=[];
    if(root===0&&b===0&&c===0&&a===d)vectors.push([1,0],[0,1]);
    else for(const lambda of root===0?[values[0]]:values){
      const rows=[[a-lambda,b],[c,d-lambda]],row=rows[0].reduce((s,n)=>s+n*n,0)>=rows[1].reduce((s,n)=>s+n*n,0)?rows[0]:rows[1];
      let v=[-row[1],row[0]],scale=Math.max(...v.map(Math.abs));v=v.map(n=>n/scale);if((v[0]||v[1])<0)v=v.map(n=>-n);vectors.push(v.map(n=>Object.is(n,-0)?0:n));
    }
    const P=vectors.length===2?[vectors[0][0],vectors[1][0],vectors[0][1],vectors[1][1]]:null,inv=P?inverse(P):null;
    return {trace,determinant,discriminant,values,vectors,diagonalizable:!!inv,P:inv?P:null,D:inv?[values[0],0,0,values[1]]:null,inverse:inv};
  }
  function eigenStatus(M,v){
    const output=apply(M,v),scale=Math.max(...v.map(Math.abs));if(scale===0)return {kind:'zero',output,lambda:null,error:null};
    // Scale first so near-zero inputs do not underflow into false exact collinearity.
    const u=v.map(n=>n/scale),w=apply(M,u),norm=Math.hypot(...u),lambda=(u[0]*w[0]+u[1]*w[1])/(norm*norm),cross=u[0]*w[1]-u[1]*w[0],den=norm*Math.hypot(...w),error=den===0?0:Math.abs(cross)/den;
    return {kind:cross===0?'exact':error<.01?'near':'off',output,lambda,error};
  }
  const presets={
    A:{name:'贯穿矩阵 A',M:[2,1,1,2],note:'两个不同实特征值 3、1，有两条独立方向 (1,1)、(1,−1)，可作基。'},
    I:{name:'单位矩阵 I',M:[1,0,0,1],note:'特征值 1 重复两次，但整个平面都是其特征空间；任意非零向量都满足 Iv=v。可选两条独立方向，因此可对角化。'},
    J:{name:'剪切 J：重根但缺方向',M:[1,1,0,1],note:'特征方程 (1−λ)²=0，只给 λ=1。解 (J−I)v=0 得 y=0；只有横轴这一条独立方向，凑不齐平面的一组基，不能对角化。'},
    R:{name:'旋转 R：90°',M:[0,-1,1,0],note:'特征方程 λ²+1=0，没有实数解。任何非零实箭头都转了 90°，不会留在原直线；不能在实数范围内对角化。'},
    Z:{name:'负数与零：diag(−1,0)',M:[-1,0,0,0],note:'横轴特征值 −1，反向；纵轴特征值 0，压到原点。两方向独立，仍可对角化；可对角化不等于可逆。'},
    C:{name:'非对称 C：方向不垂直',M:[4,1,2,3],note:'特征值 5、2，方向 (1,1)、(1,−2)，点积 −1，互不垂直。两方向仍独立，所以可对角化；正交不是一般对角化的要求。'}
  };
  if(typeof module!=='undefined')module.exports={apply,det,multiply,inverse,eigenInfo,eigenStatus,presets};
  if(typeof document==='undefined')return;
  const {plane,drag,colors}=window.LAPlane,fmt=n=>n!==0&&Math.abs(n)<1e-4?n.toExponential(5):String(Number(n.toFixed(4))),pair=v=>'('+v.map(fmt).join(', ')+')',col=v=>'<span class="column-vector">'+v.map(n=>'<span>'+fmt(n)+'</span>').join('')+'</span>',matrix=M=>'<span class="matrix">'+M.map(n=>'<span>'+fmt(n)+'</span>').join('')+'</span>';
  const options=()=>Object.entries(presets).map(([key,p])=>`<option value="${key}">${p.name}</option>`).join('');
  const vectorFields=(prefix,v)=>`<div class="number-fields"><label>输入 vₓ<input type="number" step="any" min="-3" max="3" value="${v[0]}" data-eigen-x aria-label="${prefix} 输入 x"></label><label>输入 vᵧ<input type="number" step="any" min="-3" max="3" value="${v[1]}" data-eigen-y aria-label="${prefix} 输入 y"></label></div><label class="control">旋转角度（度）<output data-angle-value></output><input type="range" min="0" max="360" step="1" value="0" data-eigen-angle aria-label="${prefix} 旋转角度"></label><button type="button" data-vector-reset>重置输入</button><p class="feedback" data-vector-error aria-live="polite"></p>`;
  function bindVector(lab,initial,get,set){
    const fields=[lab.querySelector('[data-eigen-x]'),lab.querySelector('[data-eigen-y]')],angle=lab.querySelector('[data-eigen-angle]'),err=lab.querySelector('[data-vector-error]');
    fields.forEach((el,i)=>el.addEventListener('input',()=>{if(!el.value.trim()||!Number.isFinite(Number(el.value))||Math.abs(Number(el.value))>3){err.textContent='分量须为 −3 到 3 内的有限数；尚未改变箭头。';return;}err.textContent='';const v=get().slice();v[i]=Number(el.value);set(v);}));
    angle.addEventListener('input',()=>{const a=Number(angle.value),originalLength=Math.hypot(...get()),r=Math.min(originalLength,3)||1,t=a*Math.PI/180;let v=[r*Math.cos(t),r*Math.sin(t)];if(a%45===0){const dirs=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1],[1,0]],d=dirs[a/45],s=r/Math.hypot(...d);v=d.map(n=>n*s);}if(v.some(n=>Math.abs(n)>3)){const scale=3/Math.max(...v.map(Math.abs));v=v.map(n=>n*scale);}err.textContent=originalLength>3?'为使整圈旋转不超出分量范围，先将长度缩至 3，再按所选角度旋转；方向实验的判断方式相同。':originalLength===0?'零向量没有方向；开始旋转时，改用长度为 1 的非零箭头。':'';set(v);});
    lab.querySelector('[data-vector-reset]').addEventListener('click',()=>{err.textContent='';set(initial.slice());});
    return ()=>{const v=get(),deg=(Math.atan2(v[1],v[0])*180/Math.PI+360)%360;fields.forEach((el,i)=>{if(document.activeElement!==el)el.value=String(v[i]);});angle.value=String(Math.round(deg));lab.querySelector('[data-angle-value]').textContent=Math.hypot(...v)===0?'零向量无方向':Number(deg.toFixed(1))+'°';};
  }
  function paint(canvas,M,v,reveal,directions=[],lockedExtent=null,outputName="Mv"){const out=apply(M,v),extent=lockedExtent??Math.max(4,Math.ceil(Math.max(...v.map(Math.abs),...out.map(Math.abs)))+1),view=plane(canvas,extent);if(!view)return null;
    directions.forEach((d,i)=>{const s=extent/Math.max(...d.map(Math.abs));view.line(d.map(n=>-n*s),d.map(n=>n*s),i?colors.secondary:colors.basis,2,[5,5]);});
    view.arrow(v,colors.input,'v（可拖）',{width:6,offset:22});if(reveal)view.arrow(out,colors.output,Math.hypot(...out)===0?outputName+'=0':outputName,{width:2.5,offset:-18});return view;}
  document.querySelectorAll('[data-eigen-explorer]').forEach(lab=>{
    const M=presets.A.M,canvas=lab.querySelector('canvas'),controls=lab.querySelector('.lab-controls'),out=lab.querySelector('[data-eigen-readout]');let v=[2,.5],view,gate,showDirections=false,lockedExtent=null;
    controls.innerHTML=vectorFields('探索',v)+'<button type="button" data-show-directions>揭示两条特征直线</button><div data-direction-buttons hidden><button type="button" data-eigen-vector="1,1">试 (1,1)</button><button type="button" data-eigen-vector="1,-1">试 (1,−1)</button></div><button type="button" data-eigen-vector="0,0">检验零向量</button>';
    const sync=bindVector(lab,[2,.5],()=>v,next=>{v=next;gate.changed();render();});
    function render(){const hidden=gate?.hidden()||false,s=eigenStatus(M,v);view=paint(canvas,M,v,!hidden,showDirections&&!hidden?[[1,1],[1,-1]]:[],lockedExtent,"Av");sync();lab.querySelector('[data-direction-buttons]').hidden=!showDirections||hidden;lab.querySelector('[data-show-directions]').disabled=hidden;
      out.textContent=hidden?'已记录输入 v='+pair(v)+'。请先判断，提交后才显示 Av 与特征关系。':`v=${pair(v)}，Av=${pair(s.output)}。`+(s.kind==='zero'?'v=0 无方向；即使 A0=λ0 对任何 λ 成立，也不叫特征向量。':s.kind==='exact'?`当前输入数值满足共线，λ=${fmt(s.lambda)}；Av=${pair(s.output)} = ${fmt(s.lambda)}v。`+(s.lambda===0?'非零 v 被送到零，这是合法的零特征值。':s.lambda<0?'λ 为负，射线反向，仍在同一直线。':'λ 为正，射线方向保持。'):s.kind==='near'?'画面接近共线，但数值不精确共线，不能据此宣布是特征向量。请用分量关系验证，或试精确预设。':`输出离开了原直线；不存在一个数能同时使两格满足 Av=λv。`);gate?.sync();}
    gate=window.LAStudy.challenge(lab,{question:()=>`固定 A，输入 v=${pair(v)}。它是 A 的特征向量吗？`,choices:[['yes','是：非零且仍在原直线'],['no','不是：输出离开原直线'],['zero','不是：输入是零向量']],assess:choice=>{const s=eigenStatus(M,v),expected=s.kind==='zero'?'zero':s.kind==='exact'?'yes':'no';return {correct:choice===expected,explanation:s.kind==='zero'?'零向量必须排除，否则每个 λ 都会平凡成立。':s.kind==='exact'?`Av=${pair(s.output)}，由同一比例 λ=${fmt(s.lambda)} 连接两个分量。`:'要两格都满足同一个倍数；图像接近不等于精确满足。'};},render});
    lab.querySelector('[data-show-directions]').addEventListener('click',()=>{showDirections=!showDirections;lab.querySelector('[data-show-directions]').textContent=showDirections?'隐藏特征直线':'揭示两条特征直线';render();});lab.querySelectorAll('[data-eigen-vector]').forEach(b=>b.addEventListener('click',()=>{v=b.dataset.eigenVector.split(',').map(Number);gate.changed();render();}));drag(canvas,()=>v,next=>{v=next;gate.changed();render();},()=>view,{start:extent=>{lockedExtent=extent;},end:()=>{lockedExtent=null;render();}});new ResizeObserver(render).observe(canvas);render();
  });
  const calculationSteps={
    A:[['先构造 A−λI','只从主对角线减 λ；I 的非对角格是 0。','A−λI = <span class="matrix"><span>2−λ</span><span>1</span><span>1</span><span>2−λ</span></span>'],['求行列式','下一步请先在纸上展开平方。','det(A−λI)=(2−λ)(2−λ)−1×1'],['写特征方程','不是解 A v=0，而是找让 A−λI 有非零零空间的 λ。','λ²−4λ+3=0'],['求根','用乘积为 3、和为 4 的两个数分解；按重数记录根。','(λ−3)(λ−1)=0 → λ₁=3，λ₂=1'],['λ=3：求零空间','−x+y=0 与 x−y=0 是同一限制；所以 y=x。','A−3I = '+matrix([-1,1,1,-1])+'；v=t'+col([1,1])+'，t≠0'],['λ=1：求零空间','x+y=0 给 y=−x；排除 t=0，剩下整条直线上的非零向量。','A−I = '+matrix([1,1,1,1])+'；v=t'+col([1,-1])+'，t≠0'],['检查独立，才能组基','两支不平行，P 可逆。P 的列顺序与 D 的特征值顺序必须一致。','P='+matrix([1,1,1,-1])+'，D='+matrix([3,0,0,1])+'；AP=PD']],
    C:[['构造 C−λI','C 是新的非对称例子，仍只减主对角线。','C−λI = <span class="matrix"><span>4−λ</span><span>1</span><span>2</span><span>3−λ</span></span>'],['求行列式','先相乘再减交叉项 2。','(4−λ)(3−λ)−2'],['写特征方程','展开常数 12−2=10，λ 的系数为 −7。','λ²−7λ+10=0'],['求根','两个根的和为 7、积为 10。','(λ−5)(λ−2)=0 → 5、2'],['λ=5：求零空间','−x+y=0，所以 y=x。','C−5I='+matrix([-1,1,2,-2])+'；v=t'+col([1,1])+'，t≠0'],['λ=2：求零空间','2x+y=0，所以 y=−2x。','C−2I='+matrix([2,1,2,1])+'；v=t'+col([1,-2])+'，t≠0'],['检查基','两方向独立，但点积为 −1，并不正交。','P='+matrix([1,1,1,-2])+'，D='+matrix([5,0,0,2])+'；AP=PD']]
  };
  document.querySelectorAll('[data-eigen-calculator]').forEach(lab=>{let index=0;const select=lab.querySelector('select'),title=lab.querySelector('[data-calc-title]'),body=lab.querySelector('[data-calc-body]'),note=lab.querySelector('[data-calc-note]');function render(){const steps=calculationSteps[select.value],[h,n,b]=steps[index];title.textContent=`${index+1} / ${steps.length} · ${h}`;body.innerHTML=b;note.textContent=n;lab.querySelector('[data-calc-prev]').disabled=index===0;lab.querySelector('[data-calc-next]').disabled=index===steps.length-1;}select.addEventListener('change',()=>{index=0;render();});lab.querySelector('[data-calc-prev]').addEventListener('click',()=>{index--;render();});lab.querySelector('[data-calc-next]').addEventListener('click',()=>{index++;render();});lab.querySelector('[data-calc-reset]').addEventListener('click',()=>{index=0;render();});render();});
  document.querySelectorAll('[data-diagonalization-lab]').forEach(lab=>{
    const controls=lab.querySelector('[data-diag-controls]'),physical=lab.querySelector('[data-physical-plane]'),coordinate=lab.querySelector('[data-eigen-coordinate-plane]');let v=[2,1],step=0,timer=null;
    controls.innerHTML='<label>矩阵预设<select data-diag-preset aria-label="对角化矩阵">'+options()+'</select></label>'+vectorFields('对角化',v);
    const select=lab.querySelector('[data-diag-preset]'),sync=bindVector(lab,[2,1],()=>v,next=>{stop();v=next;step=0;render();});
    function stop(){if(timer!==null)clearTimeout(timer);timer=null;lab.querySelector('[data-diag-play]').textContent='播放步骤';}
    function render(){const preset=presets[select.value],M=preset.M,info=eigenInfo(M),output=apply(M,v),extent=Math.max(4,Math.ceil(Math.max(...v.map(Math.abs),...output.map(Math.abs)))+1),left=plane(physical,extent),right=plane(coordinate,extent,['c₁','c₂']);sync();
      lab.querySelectorAll('[data-diag-prev],[data-diag-next],[data-diag-play]').forEach(b=>b.disabled=!info.diagonalizable);lab.querySelector('[data-diag-prev]').disabled=!info.diagonalizable||step===0;lab.querySelector('[data-diag-next]').disabled=!info.diagonalizable||step===3;
      left?.arrow(v,colors.input,'原 v',{width:6,offset:22});const formula=lab.querySelector('[data-diag-formula]'),readout=lab.querySelector('[data-diag-readout]');
      if(!info.diagonalizable){formula.textContent='此预设没有足够多独立实特征向量，不能构造可逆 P；不显示 P⁻¹ 或伪造三步分解。';readout.textContent=preset.note;left?.arrow(output,colors.output,'Mv');lab.querySelector('[data-diag-stage]').textContent='不能在实数范围内对角化';return;}
      const c=apply(info.inverse,v),scaled=apply(info.D,c),back=apply(info.P,scaled),coord=step<2?c:scaled;
      if(step>=1)right?.arrow(coord,colors.basis,step===1?'c=P⁻¹v':'Dc',{width:4});
      if(step>=2)left?.arrow(back,colors.output,'Mv',{width:2.5,offset:-18});
      const stages=['0 · 原向量：先预测它在特征基下的配方','1 · P⁻¹：读出新坐标，左图的原向量没有移动','2 · D：独立缩放配方，实际向量在此发生变化','3 · P：把新配方写回标准坐标；同一输出没有再变形'];
      lab.querySelector('[data-diag-stage]').textContent=stages[step];
      formula.innerHTML='<span>M='+matrix(M)+'</span><span>P='+matrix(info.P)+'</span><span>D='+matrix(info.D)+'</span><span>P⁻¹='+matrix(info.inverse)+'</span>';
      readout.innerHTML=step===0?'输入 v='+col(v)+'。先想：沿 P 的两列各需要多少？点击下一步核对。':step===1?'v='+col(v)+' 与 c=P⁻¹v='+col(c)+' 是同一向量的两套坐标；左图几何箭头保持原位。':step===2?'Dc='+col(scaled)+'；左图实际输出 P(Dc)='+col(back)+'。D 改变了配方；P 只是把此配方解释为实际向量。':'PDP⁻¹v='+col(back)+' = Mv='+col(output)+'。对当前输入核对一致；AP=PD 的列等式解释了为何对任意输入都成立。';
    }
    function play(){if(step===3)step=0;step++;render();if(step<3)timer=setTimeout(play,1800);else stop();}
    lab.querySelector('[data-diag-prev]').addEventListener('click',()=>{stop();step--;render();});lab.querySelector('[data-diag-next]').addEventListener('click',()=>{stop();step++;render();});lab.querySelector('[data-diag-play]').addEventListener('click',()=>{if(timer!==null){stop();return;}lab.querySelector('[data-diag-play]').textContent='暂停';play();});lab.querySelector('[data-diag-reset]').addEventListener('click',()=>{stop();step=0;v=[2,1];render();});select.addEventListener('change',()=>{stop();step=0;render();});new ResizeObserver(render).observe(physical);new ResizeObserver(render).observe(coordinate);render();
  });
  document.querySelectorAll('[data-eigen-cases]').forEach(lab=>{let v=[1,1],view,gate,lockedExtent=null;const controls=lab.querySelector('.lab-controls'),canvas=lab.querySelector('canvas');controls.innerHTML='<label>选择反例<select data-case-preset aria-label="反例矩阵">'+options()+'</select></label>'+vectorFields('反例',v)+'<button type="button" data-case-vector="1,0">试横轴 (1,0)</button><button type="button" data-case-vector="0,1">试纵轴 (0,1)</button>';
    const select=lab.querySelector('[data-case-preset]'),sync=bindVector(lab,[1,1],()=>v,next=>{v=next;gate.changed();render();});
    function render(){const p=presets[select.value],info=eigenInfo(p.M),hidden=gate?.hidden()||false,s=eigenStatus(p.M,v);lab.querySelector('[data-case-matrix]').innerHTML='M='+matrix(p.M);view=paint(canvas,p.M,v,!hidden,!hidden?info.vectors:[],lockedExtent);sync();lab.querySelector('[data-case-readout]').textContent=hidden?'先判断是否有足够的独立实特征方向，再提交观察。':p.note+` 当前 v=${pair(v)}，Mv=${pair(s.output)}。`+(s.kind==='zero'?'零输入不作特征向量。':s.kind==='exact'?`当前是特征向量，λ=${fmt(s.lambda)}。`:s.kind==='near'?'当前仅接近共线，不是精确特征向量。':'当前不是特征向量。');gate?.sync();}
    gate=window.LAStudy.challenge(lab,{question:()=>`${presets[select.value].name}：能否选出整个实平面的一组特征基？`,choices:[['yes','能：有两条独立实方向'],['no','不能：方向不够']],assess:choice=>({correct:(choice==='yes')===eigenInfo(presets[select.value].M).diagonalizable,explanation:presets[select.value].note}),render});select.addEventListener('change',()=>{gate.changed();render();});lab.querySelectorAll('[data-case-vector]').forEach(b=>b.addEventListener('click',()=>{v=b.dataset.caseVector.split(',').map(Number);gate.changed();render();}));drag(canvas,()=>v,next=>{v=next;gate.changed();render();},()=>view,{start:extent=>{lockedExtent=extent;},end:()=>{lockedExtent=null;render();}});new ResizeObserver(render).observe(canvas);render();
  });
})();
