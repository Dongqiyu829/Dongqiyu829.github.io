(function(){
  'use strict';
  const near=(x,y=0)=>Math.abs(x-y)<1e-9;
  const apply=([a,b,c,d],[x,y])=>[a*x+b*y,c*x+d*y];
  function recipe(M,target){
    const [a,b,c,d]=M,[x,y]=target,det=a*d-b*c;
    const magnitude=Math.max(...M.map(Math.abs));
    if(Math.abs(det)>8*Number.EPSILON*magnitude*magnitude)return {kind:'unique',rank:2,particular:[(d*x-b*y)/det,(a*y-c*x)/det]};
    if(M.every(n=>n===0))return {kind:target.every(n=>n===0)?'all':'none',rank:0,particular:[0,0]};
    const row=a||b?[a,b,x]:[c,d,y],particular=row[0]?[row[2]/row[0],0]:[0,row[2]/row[1]];
    return {kind:apply(M,particular).every((n,i)=>near(n,target[i]))?'many':'none',rank:1,particular,direction:[row[1],-row[0]]};
  }
  function rowOperation(rows,operation,target=0,source=1,factor=1){
    const next=rows.map(r=>r.slice());
    if(operation==='swap')return [next[1],next[0]];
    if(!Number.isFinite(factor))throw new Error('倍数必须是有限数字。可输入小数或分数。');
    if(operation==='scale'){if(factor===0)throw new Error('一行乘 0 会删除原来的限制，不能倒回，因此不是合法初等行变换。');next[target]=next[target].map(n=>n*factor);}
    else if(operation==='add'){if(target===source)throw new Error('加倍数操作需选择另一行作来源；给自身加负一倍会删除整行。若只想缩放，请选“整行乘倍数”。');next[target]=next[target].map((n,i)=>n+factor*next[source][i]);}
    else throw new Error('未知操作。');
    if(next.flat().some(n=>!Number.isFinite(n)||Math.abs(n)>1e6||(n!==0&&Math.abs(n)<1e-8)))throw new Error('此数值练习只处理绝对值在 10⁻⁸ 到 10⁶ 内的非零结果，以免极小/极大数误导读数；这是显示精度限制，不表示数学操作本身不合法。');
    const classify=r=>recipe([r[0][0],r[0][1],r[1][0],r[1][1]],[r[0][2],r[1][2]]).kind;
    if(classify(next)!==classify(rows))throw new Error('本次浮点计算不足以可靠保持解集类型，未执行。请换一条数值更温和的消元路径；这不是说该行变换在精确数学中不合法。');
    return next;
  }
  function parseNumber(raw){const s=String(raw).trim(),parts=s.split('/');if(!s)return NaN;if(parts.length===1)return Number(s);if(parts.length===2&&parts.every(p=>p.trim()!==''&&Number.isFinite(Number(p)))&&Number(parts[1])!==0)return Number(parts[0])/Number(parts[1]);return NaN;}
  if(typeof module!=='undefined')module.exports={recipe,rowOperation,parseNumber,apply};
  if(typeof document==='undefined')return;
  window.LABeginner={parseNumber};
  const fmt=n=>String(Number(n.toFixed(3))),pair=v=>'('+v.map(fmt).join(', ')+')';
  const col=v=>`<span class="column-vector">${v.map(n=>`<span>${fmt(n)}</span>`).join('')}</span>`;
  const matrix=M=>`<span class="matrix">${M.map(n=>`<span>${fmt(n)}</span>`).join('')}</span>`;
  function plane(canvas,extent=6){
    const r=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2),ctx=canvas.getContext('2d');canvas.width=Math.round(r.width*ratio);canvas.height=Math.round(r.height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);
    const w=r.width,h=r.height,unit=Math.min(w,h)/(2*extent+2),origin=[w/2,h/2];
    const point=([x,y])=>[origin[0]+x*unit,origin[1]-y*unit];ctx.clearRect(0,0,w,h);
    function line(a,b,color='#ddd9ce',width=1,dash=[]){const p=point(a),q=point(b);ctx.beginPath();ctx.setLineDash(dash);ctx.moveTo(...p);ctx.lineTo(...q);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();ctx.setLineDash([]);}
    for(let k=-extent;k<=extent;k++){line([-extent,k],[extent,k]);line([k,-extent],[k,extent]);}
    line([-extent,0],[extent,0],'#819798');line([0,-extent],[0,extent],'#819798');ctx.fillStyle='#405c60';ctx.font='12px sans-serif';ctx.fillText('0',origin[0]-12,origin[1]+15);ctx.fillText('1',origin[0]+unit-3,origin[1]+15);ctx.fillText('x',w-20,origin[1]-8);ctx.fillText('y',origin[0]+8,20);
    function arrow(v,color,label='',from=[0,0],offset=-14){const end=v,p=point(from),q=point(end);line(from,end,color,3);const a=Math.atan2(q[1]-p[1],q[0]-p[0]);ctx.fillStyle=color;ctx.beginPath();ctx.arc(...q,5,0,2*Math.PI);ctx.fill();if(Math.hypot(q[0]-p[0],q[1]-p[1])>2){ctx.beginPath();ctx.moveTo(...q);ctx.lineTo(q[0]-10*Math.cos(a-.45),q[1]-10*Math.sin(a-.45));ctx.lineTo(q[0]-10*Math.cos(a+.45),q[1]-10*Math.sin(a+.45));ctx.closePath();ctx.fill();}ctx.font='bold 14px sans-serif';ctx.fillText(label,Math.max(5,Math.min(w-95,q[0]+8)),Math.max(18,Math.min(h-16,q[1]+offset)));}
    return {ctx,point,line,arrow,origin,unit,w,h};
  }
  const range=(key,name,value,min=-3,max=3,step=.25)=>`<label class="control">${name}<output data-output="${key}">${value}</output><input type="range" aria-label="${name}" data-field="${key}" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;
  function dragging(canvas,getPoints,setPoint,getView){let active=null;canvas.addEventListener('pointerdown',e=>{const r=canvas.getBoundingClientRect(),view=getView();const ds=getPoints().map(p=>{const q=view.point(p);return Math.hypot(q[0]-e.clientX+r.left,q[1]-e.clientY+r.top);});const min=Math.min(...ds);if(min<=26){active=ds.indexOf(min);canvas.setPointerCapture(e.pointerId);}});canvas.addEventListener('pointermove',e=>{if(active===null)return;const r=canvas.getBoundingClientRect(),v=getView();const snap=n=>Math.max(-3,Math.min(3,Math.round(n*4)/4));setPoint(active,[snap((e.clientX-r.left-v.origin[0])/v.unit),snap((v.origin[1]-e.clientY+r.top)/v.unit)]);});['pointerup','pointercancel','lostpointercapture'].forEach(event=>canvas.addEventListener(event,()=>{active=null;}));}
  document.querySelectorAll('[data-coordinate-lab]').forEach(lab=>{
    const canvas=lab.querySelector('canvas'),controls=lab.querySelector('.lab-controls');let p=[2,1],view;
    controls.innerHTML=range('x','先水平走 x',2,-3,3,1)+range('y','再竖直走 y',1,-3,3,1)+'<button type="button" data-point="2,1">(2,1)</button><button type="button" data-point="1,2">(1,2)</button><button type="button" data-point="-2,1">(−2,1)</button><button type="button" data-point="0,0">原点</button><p class="lab-readout" aria-live="polite"></p>';
    function render(){view=plane(canvas,4);view.line([0,0],[p[0],0],'#086c72',4);view.line([p[0],0],p,'#b7861b',4,[5,3]);const pixel=view.point(p);view.ctx.fillStyle='#c35c3a';view.ctx.beginPath();view.ctx.arc(...pixel,6,0,2*Math.PI);view.ctx.fill();view.ctx.font='bold 14px sans-serif';view.ctx.fillText(pair(p),pixel[0]+8,pixel[1]-12);controls.querySelector('.lab-readout').textContent=`当前点 ${pair(p)}：先${p[0]>=0?'向右':'向左'} ${Math.abs(p[0])} 格，再${p[1]>=0?'向上':'向下'} ${Math.abs(p[1])} 格。注意先横后竖，(2,1) 与 (1,2) 不同。`;controls.querySelectorAll('[data-field]').forEach((s,i)=>{s.value=p[i];controls.querySelector(`[data-output="${s.dataset.field}"]`).textContent=p[i];});}
    controls.querySelectorAll('input').forEach((s,i)=>s.addEventListener('input',()=>{p[i]=Number(s.value);render();}));controls.querySelectorAll('[data-point]').forEach(b=>b.addEventListener('click',()=>{p=b.dataset.point.split(',').map(Number);render();}));new ResizeObserver(render).observe(canvas);render();
  });
  document.querySelectorAll('[data-basis-explorer]').forEach(lab=>{
    let M=[1,1,1,-1],target=[3,1],free=[0,0],view,gate;
    const canvas=lab.querySelector('canvas'),controls=lab.querySelector('.lab-controls');
    controls.innerHTML=['第一支 b₁ 的 x','第二支 b₂ 的 x','第一支 b₁ 的 y','第二支 b₂ 的 y'].map((name,i)=>`<label>${name}<input type="number" min="-3" max="3" step=".25" data-basis-cell="${i}" aria-label="${name}" value="${M[i]}"></label>`).join('')+'<div class="number-fields"><label>固定目标的 x<input type="number" min="-6" max="6" step=".25" data-target-cell="0" value="3" aria-label="固定目标 x"></label><label>固定目标的 y<input type="number" min="-6" max="6" step=".25" data-target-cell="1" value="1" aria-label="固定目标 y"></label></div>'+range('s','自由用量 s',0,-2,2,.25)+range('t','自由用量 t（全零组才需要）',0,-2,2,.25)+'<div><button type="button" data-basis-preset="1,0,0,1">标准基</button><button type="button" data-basis-preset="1,1,1,-1">恢复斜基</button><button type="button" data-basis-preset="1,2,1,2">平行方向</button><button type="button" data-basis-preset="1,0,1,0">一支为零</button><button type="button" data-basis-preset="0,0,0,0">两支全零</button><button type="button" data-target-preset="3,3">目标改为 (3,3)</button><button type="button" data-target-preset="0,0">目标改为零</button><button type="button" data-basis-reset>全部重置</button></div>';
    const status=lab.querySelector('[data-basis-status]'),formula=lab.querySelector('[data-basis-formula]');
    function render(){
      view=plane(canvas,6);const solved=recipe(M,target),b1=[M[0],M[2]],b2=[M[1],M[3]],conceal=gate?.hidden()||false;
      if(!conceal&&solved.rank===2){for(let k=-5;k<=5;k++){view.line(apply(M,[-6,k]),apply(M,[6,k]),'#b8d9d5');view.line(apply(M,[k,-6]),apply(M,[k,6]),'#b8d9d5');}}
      if(!conceal&&solved.rank===1){const direction=b1.some(n=>n)?b1:b2;view.line(direction.map(n=>-20*n),direction.map(n=>20*n),'#a4cdc7',8);}
      if(!conceal&&solved.rank===0){const q=view.point([0,0]);view.ctx.fillStyle='#a4cdc7';view.ctx.beginPath();view.ctx.arc(...q,10,0,2*Math.PI);view.ctx.fill();}
      view.arrow(b1,'#086c72','b₁ '+pair(b1));view.arrow(b2,'#b7861b','b₂ '+pair(b2),[0,0],24);view.arrow(target,'#c35c3a','目标 '+pair(target));
      let coefficients=solved.particular;
      if(solved.kind==='many')coefficients=coefficients.map((n,i)=>n+free[0]*solved.direction[i]);
      if(solved.kind==='all')coefficients=free.slice();
      status.textContent=solved.rank===2?'生成整个 ℝ²；两向量线性无关，是平面的一组基。目标几何箭头不动，唯一坐标为 '+pair(coefficients)+'。':solved.kind==='none'?`生成集合退化为${solved.rank?'一条直线':'原点'}，目标不在其中：无解，不能作为 ℝ² 的基。`:solved.kind==='many'?`生成一条直线，目标在线上：有无穷多份配方。当前配方 ${pair(coefficients)}，移动自由用量 s 看不同配方得到同一目标；它们不是 ℝ² 的基。`:'只能生成零向量；目标恰好为零。任意两个系数都能生成它，移动 s、t 核对；不是平面的基。';
      const approximate=coefficients.some(n=>!near(n,Number(n.toFixed(3))));
      formula.innerHTML=`${matrix(M)}${col(coefficients)} ${solved.kind==='none'?'≠':approximate?'≈':'='} ${col(target)}${solved.kind==='none'?'（所示只是一次尝试；方程无解）':''}`;
      if(approximate)status.textContent+=' 配方读数约取三位小数，内部计算不先舍入。';
      controls.querySelectorAll('[data-basis-cell]').forEach((s,i)=>{s.value=M[i];s.removeAttribute('aria-invalid');});controls.querySelectorAll('[data-target-cell]').forEach((s,i)=>{s.value=target[i];s.removeAttribute('aria-invalid');});controls.querySelector('[data-field="s"]').disabled=solved.kind!=='many'&&solved.kind!=='all';controls.querySelector('[data-field="t"]').disabled=solved.kind!=='all';controls.querySelectorAll('[data-field]').forEach((s,i)=>{s.value=free[i];controls.querySelector(`[data-output="${s.dataset.field}"]`).textContent=fmt(free[i]);});
      const within=coefficients.every(n=>Math.abs(n)<20);if(!conceal&&solved.kind!=='none'&&within){const first=b1.map(n=>n*coefficients[0]);view.line([0,0],first,'#086c72',2,[4,4]);view.line(first,target,'#b7861b',2,[4,4]);}
      if(solved.rank===2&&coefficients.some(n=>Math.abs(n)>10))status.textContent+=' 两方向几乎平行，系数可能很大，但只要没有真正相关，仍然是基；图的有限视野不等于数学上的限制。';
      formula.hidden=conceal;if(conceal)status.textContent='挑战进行中：只显示输入方向与固定目标；生成集合、配方及结论将在提交预测后显示。';gate?.sync();
    }
    function changedRender(){gate?.changed();render();}
    function edit(event){const el=event.target,n=Number(el.value),limit=el.hasAttribute('data-target-cell')?6:3;if(!el.value.trim()||!Number.isFinite(n)||Math.abs(n)>limit||!near(n*4,Math.round(n*4))){el.setAttribute('aria-invalid','true');status.textContent=`先填完整的 −${limit} 到 ${limit} 的数字，步长 0.25；图保留上次合法状态。`;return;}el.removeAttribute('aria-invalid');if(el.hasAttribute('data-basis-cell'))M[Number(el.dataset.basisCell)]=n;else target[Number(el.dataset.targetCell)]=n;changedRender();}
    controls.querySelectorAll('input[type="number"]').forEach(el=>{el.addEventListener('input',edit);el.addEventListener('change',edit);});controls.querySelectorAll('[data-field]').forEach((s,i)=>s.addEventListener('input',()=>{free[i]=Number(s.value);changedRender();}));
    controls.querySelectorAll('[data-basis-preset]').forEach(b=>b.addEventListener('click',()=>{M=b.dataset.basisPreset.split(',').map(Number);changedRender();}));controls.querySelectorAll('[data-target-preset]').forEach(b=>b.addEventListener('click',()=>{target=b.dataset.targetPreset.split(',').map(Number);changedRender();}));controls.querySelector('[data-basis-reset]').addEventListener('click',()=>{M=[1,1,1,-1];target=[3,1];free=[0,0];controls.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));changedRender();});
    window.LAStudy.basisControls(controls);
    gate=window.LAStudy.challenge(lab,{question:()=>`输入 b₁=${pair([M[0],M[2]])}，b₂=${pair([M[1],M[3]])}，目标 ${pair(target)}。能到达吗？若能，配方是否唯一？`,choices:[['unique','可达，配方唯一'],['none','不可达，无解'],['many','可达，但配方不唯一']],assess:choice=>{const r=recipe(M,target),key=r.kind==='all'?'many':r.kind;return {correct:choice===key,explanation:r.rank===2?'两方向独立，生成整个平面，每个目标恰有一份配方。':r.kind==='none'?'所有组合都留在这条直线（或原点），当前目标不在生成集合中。':r.rank===0?'两支都为零，目标也是零：任意系数组合都得到它，所以不唯一。':'目标在生成直线上，但两方向相关；给任一配方加一份非零的零配方，结果不变，因此有无穷多份配方。'};},render});
    dragging(canvas,()=>[[M[0],M[2]],[M[1],M[3]]],(i,p)=>{M[i]=p[0];M[i+2]=p[1];changedRender();},()=>view);new ResizeObserver(render).observe(canvas);render();
  });
  document.querySelectorAll('[data-equation-bridge]').forEach(lab=>{
    let step=0;const views=[['原方程：每行是一条限制','<span class="focus-first">2x</span> + <span class="focus-second">y</span> = 5<br><span class="focus-first">x</span> + <span class="focus-second">2y</span> = 4'],['同类未知数放在同一列','<span class="focus-first">x·2</span> + <span class="focus-second">y·1</span> = 5<br><span class="focus-first">x·1</span> + <span class="focus-second">y·2</span> = 4'],['把上下分量装入列向量',`<span class="focus-first">x${col([2,1])}</span> + <span class="focus-second">y${col([1,2])}</span> = ${col([5,4])}`],['给列的数字表起名 A',`${matrix([2,1,1,2])}<span class="column-vector"><span>x</span><span>y</span></span> = ${col([5,4])}，即 A<strong>x</strong>=<strong>b</strong>`],['用上课的解核对：x=2，y=1',`2${col([2,1])} + 1${col([1,2])} = ${col([5,4])}`]];
    function render(){lab.querySelector('[data-bridge-output]').innerHTML=`<h3>${step+1}/5 · ${views[step][0]}</h3><div class="formula">${views[step][1]}</div><p>青色部分始终属于 x，金色部分始终属于 y；目标上下两格始终是 5、4。并排对照：<span class="focus-first">2x</span>+<span class="focus-second">y</span>=5；<span class="focus-first">x</span>+<span class="focus-second">2y</span>=4。</p>`;lab.querySelector('[data-bridge-prev]').disabled=step===0;lab.querySelector('[data-bridge-next]').disabled=step===4;}
    lab.querySelector('[data-bridge-prev]').addEventListener('click',()=>{step--;render();});lab.querySelector('[data-bridge-next]').addEventListener('click',()=>{step++;render();});lab.querySelector('[data-bridge-reset]').addEventListener('click',()=>{step=0;render();});render();
  });
  document.querySelectorAll('[data-coordinate-motion]').forEach(lab=>{
    let motion=false,oblique=false;const canvas=lab.querySelector('canvas');
    function render(){const view=plane(canvas,8),v=[3,1],M=oblique?[1,1,1,-1]:[1,0,0,1];view.arrow(v,'#c35c3a',motion?'原来的 v':'同一个 v');if(motion)view.arrow(apply([2,1,1,2],v),'#086c72','Av=(7,5)');else{view.arrow([M[0],M[2]],'#086c72','b₁');view.arrow([M[1],M[3]],'#b7861b','b₂',[0,0],22);}lab.querySelector('[data-motion-output]').textContent=motion?'固定标准坐标：A 把 v=(3,1) 真的变成 Av=(7,5)。这是改变对象。':`固定几何向量 v=(3,1)：${oblique?'斜基下坐标为 (2,1)':'标准基下坐标为 (3,1)'}。箭头没有移动，这是改变表示。`;}
    lab.querySelector('[data-motion-mode]').addEventListener('click',()=>{motion=true;render();});lab.querySelector('[data-coordinate-mode]').addEventListener('click',()=>{motion=false;oblique=!oblique;render();});new ResizeObserver(render).observe(canvas);render();
  });
  document.querySelectorAll('[data-row-workbench]').forEach(lab=>{
    let rows=[[2,1,5],[1,2,4]],history=[],gate,hints=0;
    const canvas=lab.querySelector('canvas'),out=lab.querySelector('[data-row-feedback]');
    const operationUI=()=>{const op=lab.querySelector('[data-row-operation]').value;lab.querySelector('[data-row-target]').disabled=op==='swap';lab.querySelector('[data-row-source]').disabled=op!=='add';lab.querySelector('[data-row-factor]').disabled=op==='swap';};
    lab.querySelector('[data-row-operation]').addEventListener('change',operationUI);operationUI();
    function render(){lab.querySelector('[data-row-matrix]').innerHTML=rows.flat().map(n=>`<span>${fmt(n)}</span>`).join('');const M=[rows[0][0],rows[0][1],rows[1][0],rows[1][1]],target=[rows[0][2],rows[1][2]],answer=recipe(M,target),view=plane(canvas,6);
      rows.forEach(([a,b,c],i)=>{const color=i?'#c35c3a':'#086c72';if(!near(b))view.line([-20,(c+20*a)/b],[20,(c-20*a)/b],color,3);else if(!near(a))view.line([c/a,-20],[c/a,20],color,3);});if(answer.kind==='unique'&&!gate?.hidden())view.arrow(answer.particular,'#b7861b','共同解 '+pair(answer.particular));
      lab.querySelector('[data-row-verdict]').textContent=`当前两条限制：${rows.map(r=>`${fmt(r[0])}x + (${fmt(r[1])})y = ${fmt(r[2])}`).join('；')}。${answer.kind==='unique'?'唯一解 '+pair(answer.particular):answer.kind==='none'?'无解：两条限制不相容。':'无穷多解：存在自由用量。'} 图中的线可改变，公共解不应改变；竖线右侧必须一起操作。`;lab.querySelector('[data-row-undo]').disabled=history.length===0;
      if(gate?.hidden())lab.querySelector('[data-row-verdict]').textContent='当前增广矩阵是输入。请先预测下一行操作的右端与可执行性，提交后才揭晓操作结果及共同解。';
      lab.querySelector('[data-row-apply]').hidden=gate?.active()||false;
      lab.querySelectorAll('[data-row-quick]').forEach(b=>b.textContent=(gate?.active()?'选择':'执行')+(b.dataset.rowQuick==='swap'?'交换两行':'R₂ 减 R₁'));
      gate?.sync();
    }
    const draft=()=>{const operation=lab.querySelector('[data-row-operation]').value,target=operation==='swap'?0:Number(lab.querySelector('[data-row-target]').value),source=Number(lab.querySelector('[data-row-source]').value),factor=parseNumber(lab.querySelector('[data-row-factor]').value);return {operation,target,source,factor,next:rowOperation(rows,operation,target,source,factor)};};
    const resetHint=()=>{hints=0;lab.querySelector('[data-row-hint-output]').textContent='';};
    function execute(){try{const d=draft();history.push(rows);rows=d.next;resetHint();out.textContent='操作成功：整行系数与右端同步变化，解集保持。可以撤销，也可继续尝试其他合法路径。';render();}catch(e){out.textContent=e.message;}}
    lab.querySelector('[data-row-apply]').addEventListener('click',execute);
    lab.querySelector('[data-row-undo]').addEventListener('click',()=>{rows=history.pop();out.textContent='已撤销上一步。';resetHint();gate.changed();render();});lab.querySelectorAll('[data-row-preset]').forEach(b=>b.addEventListener('click',()=>{rows=JSON.parse(b.dataset.rowPreset);history=[];out.textContent='已重置；先预测消元后会留下什么限制。';resetHint();gate.changed();render();}));lab.querySelector('[data-row-invalid]').addEventListener('click',()=>{out.textContent='不执行：只改系数、不改右端，会换成另一个方程组。比如把 2x+y=5 的左边乘 2，右边也必须变成 10。';});
    const controls=lab.querySelector('.lab-controls'),presets=document.createElement('div'),basic=document.createElement('details'),full=document.createElement('details'),hintBox=document.createElement('div');
    presets.innerHTML='<h4>① 先选一种方程组</h4>';controls.querySelectorAll('[data-row-preset]').forEach(b=>presets.append(b));basic.innerHTML='<summary>② 常用操作：交换或相减</summary><button type="button" data-row-quick="swap">执行交换两行</button><button type="button" data-row-quick="subtract">执行 R₂ 减 R₁</button>';full.innerHTML='<summary>③ 完整探索：自选目标、来源和倍数</summary>';full.append(controls.querySelector('.number-fields'),controls.querySelector('[data-row-apply]'),controls.querySelector('[data-row-invalid]'));hintBox.innerHTML='<button type="button" data-row-hint>需要一点提示</button><p data-row-hint-output aria-live="polite"></p>';
    const matrixNode=controls.querySelector('[data-row-matrix]'),undo=controls.querySelector('[data-row-undo]');controls.replaceChildren(matrixNode,presets,basic,full,undo,hintBox,out);
    lab.querySelector('[data-row-hint]').addEventListener('click',()=>{hints++;let text='先选一个非零主元，考虑把它下面的同列系数消成 0；不必强求某一固定路径。';if(hints>1){const [[a,b],[c,d]]=rows;text=!near(a)&&!near(c)?`若想把 R₂ 的第一格消成 0，可让 R₂ 加 R₁ 的 ${fmt(-c/a)} 倍；自己先算右端。`:near(a)&&!near(c)?'当前 R₁ 的首格为零，交换两行可以把非零主元移上来。':!near(d)?`第一列下方已为零，可考虑将 R₂ 乘 ${fmt(1/d)}，让其非零主元变成 1。`:'检查剩余行：左边全零时，右端为零表示没有新限制；非零则说明矛盾。';}lab.querySelector('[data-row-hint-output]').textContent=text;});
    lab.querySelectorAll('[data-row-quick]').forEach(button=>button.addEventListener('click',()=>{lab.querySelector('[data-row-operation]').value=button.dataset.rowQuick==='swap'?'swap':'add';lab.querySelector('[data-row-target]').value='1';lab.querySelector('[data-row-source]').value='0';lab.querySelector('[data-row-factor]').value='-1';operationUI();gate.changed();if(gate.active())render();else execute();}));
    lab.querySelectorAll('[data-row-operation],[data-row-target],[data-row-source],[data-row-factor]').forEach(el=>el.addEventListener(el.tagName==='INPUT'?'input':'change',()=>{gate?.changed();render();}));
    gate=window.LAStudy.challenge(lab,{question:()=>`当前两行 ${rows.map(r=>'['+r.map(fmt).join(', ')+']').join('；')}（第三格是右端）。${lab.querySelector('[data-row-operation]').value==='swap'?'交换两行，预测新 R₁ 的右端。':`R${Number(lab.querySelector('[data-row-target]').value)+1} ← ${lab.querySelector('[data-row-operation]').value==='scale'?'('+lab.querySelector('[data-row-factor]').value+') × R'+(Number(lab.querySelector('[data-row-target]').value)+1):'R'+(Number(lab.querySelector('[data-row-target]').value)+1)+' + ('+lab.querySelector('[data-row-factor]').value+') × R'+(Number(lab.querySelector('[data-row-source]').value)+1)}；预测这个目标行的新右端。`}`,choices:[['legal','能执行，并填写新右端'],['illegal','不能执行：非法或超出演示范围']],numeric:'合法时：预测新右端',submitLabel:'提交预测，再执行该步',assess:(choice,raw)=>{let d;try{d=draft();}catch(e){return {correct:choice==='illegal',explanation:e.message,next:null};}const predicted=parseNumber(raw);if(choice==='legal'&&!Number.isFinite(predicted))return {incomplete:true,explanation:'请先填新右端（可填分数），空白不等于 0。尚未执行操作。'};return {correct:choice==='legal'&&near(predicted,d.next[d.target][2]),next:d.next,explanation:`该步可执行。新目标行的三格为 ${pair(d.next[d.target])}，右端是 ${fmt(d.next[d.target][2])}；系数与右端必须同算。现已执行一次；下一步重新预测或切回自由探索。`};},commit:result=>{if(result.next){history.push(rows);rows=result.next;resetHint();out.textContent='已按所预测的操作更新一次；即使预测错误，也用真实结果帮助纠正。';}},render});
    new ResizeObserver(render).observe(canvas);render();
  });
  document.querySelectorAll('[data-trace-lab]').forEach(lab=>{let M=[2,1,1,2];const controls=lab.querySelector('[data-trace-controls]');controls.innerHTML=['左上 a','右上 b','左下 c','右下 d'].map((name,i)=>range(String(i),name,M[i],-3,3,.5)).join('')+'<button type="button" data-trace-reset>恢复 A</button><button type="button" data-trace-zero>迹为零但不是零矩阵</button>';
    function render(){lab.querySelector('[data-trace-output]').innerHTML=`M=${matrix(M)}；<span class="focus-first">左上 ${fmt(M[0])}</span> + <span class="focus-second">右下 ${fmt(M[3])}</span> = tr(M) = ${fmt(M[0]+M[3])}。<p>第一支标准方向的输出是 ${pair([M[0],M[2]])}，沿自身横轴贡献 ${fmt(M[0])}；第二支标准方向的输出是 ${pair([M[1],M[3]])}，沿自身纵轴贡献 ${fmt(M[3])}。改变另外两格不会改变迹，但会改变变换。</p>`;controls.querySelectorAll('input').forEach((s,i)=>{s.value=M[i];controls.querySelector(`[data-output="${i}"]`).textContent=M[i];});}
    controls.querySelectorAll('input').forEach((s,i)=>s.addEventListener('input',()=>{M[i]=Number(s.value);render();}));controls.querySelector('[data-trace-reset]').addEventListener('click',()=>{M=[2,1,1,2];render();});controls.querySelector('[data-trace-zero]').addEventListener('click',()=>{M=[1,2,0,-1];render();});render();
  });
})();
