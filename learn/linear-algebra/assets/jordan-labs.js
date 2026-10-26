(function(){
  'use strict';
  const M=window.LAJordan,{plane,colors}=window.LAPlane,parse=window.LAStudy.parseNumber;
  const fmt=x=>x!==0&&(Math.abs(x)<1e-4||Math.abs(x)>=1e6)?x.toExponential(3):String(Number(x.toFixed(5))),pair=x=>'('+x.map(fmt).join(', ')+')',matrix=A=>'<span class="matrix">'+A.flat().map(x=>'<span>'+fmt(x)+'</span>').join('')+'</span>';
  const scaled=(x,s)=>x.map(v=>v/s),row=t=>'<div>'+t+'</div>',limit=x=>Math.max(-2,Math.min(2,x));
  function unitScale(points){return Math.max(1,Math.ceil(Math.max(0,...points.flatMap(x=>x.map(Math.abs)))/3));}
  function path(view,points,color,scale,dots=false){if(!view)return;for(let i=1;i<points.length;i++)view.line(scaled(points[i-1],scale),scaled(points[i],scale),color,2);if(dots)for(const x of points){view.ctx.beginPath();view.ctx.arc(...view.point(scaled(x,scale)),4,0,2*Math.PI);view.ctx.fillStyle=color;view.ctx.fill();}}
  function arrow(view,x,s,color,label,options={}){if(view)view.arrow(scaled(x,s),color,label,options);}
  function observe(lab,render){lab.querySelectorAll('canvas').forEach(c=>new ResizeObserver(render).observe(c));}
  // Endpoint-only touch capture leaves the rest of the plot free for vertical scrolling.
  function handle(canvas,label,get,set,getView,getScale=()=>1){
    const button=document.createElement('button');button.type='button';button.className='j-handle';canvas.parentElement.append(button);let active=false,lockedScale=1;
    button.addEventListener('pointerdown',e=>{active=true;lockedScale=getScale();button.setPointerCapture(e.pointerId);});
    button.addEventListener('pointermove',e=>{if(!active)return;const view=getView(),r=canvas.getBoundingClientRect();if(view)set([(e.clientX-r.left-view.origin[0])*lockedScale/view.unit,(view.origin[1]-e.clientY+r.top)*lockedScale/view.unit].map(x=>limit(Math.round(x*4)/4)));});
    ['pointerup','pointercancel','lostpointercapture'].forEach(e=>button.addEventListener(e,()=>active=false));
    button.addEventListener('keydown',e=>{const d={ArrowLeft:[-.25,0],ArrowRight:[.25,0],ArrowUp:[0,.25],ArrowDown:[0,-.25]}[e.key];if(d){e.preventDefault();set(get().map((x,i)=>limit(x+d[i])));}});
    return {sync(){const view=getView();if(!view)return;const p=view.point(scaled(get(),getScale()));button.style.left=p[0]+'px';button.style.top=p[1]+'px';button.setAttribute('aria-label',label+'，当前 '+pair(get()));}};
  }
  function vectorFields(lab,prefix,get,set){
    const fields=['x','y'].map(a=>lab.querySelector('[data-'+prefix+'-'+a+']')),error=lab.querySelector('[data-'+prefix+'-error]');
    fields.forEach((f,i)=>f.addEventListener('input',()=>{const n=parse(f.value);if(!Number.isFinite(n)||Math.abs(n)>2){error.textContent='每个分量需在 −2 到 2 之间；支持分数。无效输入未改变向量。';error.className='feedback incorrect j-error';return;}error.textContent='';error.className='feedback j-error';const x=get().slice();x[i]=n;set(x);}));
    return {sync(){fields.forEach((f,i)=>{if(document.activeElement!==f)f.value=fmt(get()[i]);});},clear(){error.textContent='';error.className='feedback j-error';fields.forEach((f,i)=>f.value=fmt(get()[i]));}};
  }
  document.querySelectorAll('[data-chain-lab]').forEach(lab=>{
    let preset='jordan',x=[0,1],view,scale=1,gate;
    const canvas=lab.querySelector('[data-chain-plane]'),select=lab.querySelector('[data-chain-preset]');
    function move(p){x=p;gate?.changed();render();}
    const fields=vectorFields(lab,'chain',()=>x,move),drag=handle(canvas,'链测试输入端点，可拖动或用方向键',()=>x,move,()=>view,()=>scale);
    function render(){
      const p=M.presets[preset],lambda=p.values[0],N=M.subtract(p.A,M.scale(M.I(),lambda)),y=M.apply(p.A,x),difference=M.apply(N,x),hidden=gate?.hidden();scale=unitScale(hidden?[x]:[x,y,difference,...p.directions,...(p.v2?[p.v2]:[])]);
      view=plane(canvas,4);const other=plane(lab.querySelector('[data-chain-difference]'),4);arrow(view,x,scale,colors.input,'w',{width:5});
      if(!hidden){p.directions.forEach((v,i)=>{if(view)view.line(scaled(v.map(t=>-3*t),scale),scaled(v.map(t=>3*t),scale),colors.basis,2,[5,4]);arrow(view,v,scale,colors.basis,'v'+(i+1),{offset:28});});if(p.v2)arrow(view,p.v2,scale,colors.secondary,'v₂',{dash:[5,4],offset:28});arrow(view,y,scale,colors.output,'Aw',{width:3,offset:-24});arrow(other,difference,scale,colors.input,'差');if(p.v1)arrow(other,p.v1,scale,colors.basis,'v₁',{dash:[4,4],offset:26});}
      drag.sync();fields.sync();lab.querySelector('[data-chain-current]').innerHTML='A='+matrix(p.A)+'；测试输入 w='+pair(x)+'；右图使用 λ='+lambda+'。';
      lab.querySelector('[data-chain-scale]').textContent='两图每个标为 1 的网格单位实际代表 '+fmt(scale)+'。拖动只改 w；方向组来自当前矩阵。';
      const result=lab.querySelector('[data-chain-result]');if(hidden){result.textContent='普通方向、差向量与分类在提交预测后显示。切换矩阵或输入会清除上一次答案。';}else{
        const ordinary=M.norm(x)>0&&difference.every(v=>v===0);
        let text=row('Aw='+pair(y)+'；(A−'+lambda+'I)w='+pair(difference)+'。')+row(M.norm(x)===0?'w=0 属于零空间，但不是普通或广义特征向量。':ordinary?'w 是对应 λ='+lambda+' 的普通特征向量。':'w 不是对应 λ='+lambda+' 的普通特征向量。');
        if(p.v2){const c=M.chain(p.A,lambda,p.v1,p.v2);text+=row('特征值 1 重复两次；ker(A−I) 的维数为 1，不能用普通特征向量构成基。')+row('链：v₁='+pair(p.v1)+'，v₂='+pair(p.v2)+'；(A−I)v₁='+pair(c.first)+'，(A−I)v₂='+pair(c.second)+'=v₁。')+row('P='+matrix(p.P)+'；P⁻¹AP='+matrix(M.multiply(M.multiply(M.inverse(p.P),p.A),p.P))+ '。P⁻¹只更换坐标表示，图上仍画原平面的实际箭头。');}
        else text+=row(preset==='identity'?'ker(I−I) 的维数为 2；任意非零方向都是特征方向，可对角化，不需要非平凡链。':'λ=2 与 −1 的特征空间各维数 1，两条独立方向组成特征基。右图只检查 λ=2；纵轴向量属于 λ=−1。');
        result.innerHTML=text;
      }gate?.sync();
    }
    gate=window.LAStudy.challenge(lab,{question:()=> '对当前矩阵“'+M.presets[preset].name+'”，能否找到两个线性无关的普通特征向量构成平面的基？',choices:[['yes','能，普通特征向量足够'],['no','不能，需要补广义方向']],assess:c=>({correct:(c==='yes')===(M.presets[preset].dimension===2),explanation:M.presets[preset].dimension===2?'当前矩阵有两个独立普通方向。I 虽有重根，特征空间仍为整个平面；不同根的对角矩阵则有两条独立轴。':'特征值 1 重复两次，但 ker(A−I) 只有一条直线。链第二支满足 (A−I)v₂=v₁，补基时保留了耦合，不能称对角化。'}),render});
    select.addEventListener('change',()=>{preset=select.value;x=[0,1];fields.clear();gate.changed();render();});lab.querySelector('[data-chain-reset]').addEventListener('click',()=>{preset='jordan';select.value=preset;x=[0,1];fields.clear();gate.changed();render();});observe(lab,render);render();
  });
  document.querySelectorAll('[data-time-lab]').forEach(lab=>{
    let x=[0,1],n=0,t=0,view,ds=1,gate,discreteTimer=null,continuousTimer=null;
    const J=M.block(1),canvas=lab.querySelector('[data-discrete-plane]'),nField=lab.querySelector('[data-discrete-n]'),tField=lab.querySelector('[data-continuous-t]');
    function stop(which='both'){if(which!=='continuous'){clearInterval(discreteTimer);discreteTimer=null;lab.querySelector('[data-discrete-play]').textContent='播放离散步';}if(which!=='discrete'){clearInterval(continuousTimer);continuousTimer=null;lab.querySelector('[data-continuous-play]').textContent='播放连续流';}}
    function move(p){stop();x=p;gate?.changed();render();}
    const fields=vectorFields(lab,'time',()=>x,move),drag=handle(canvas,'离散与连续系统的共同初值端点',()=>x,move,()=>view,()=>ds);
    function render(){
      const hidden=gate?.hidden(),discrete=Array.from({length:n+1},(_,i)=>M.apply(M.power(J,i),x)),continuous=M.trajectory(1,1,t,x).map(p=>p.x),d=discrete.at(-1),c=continuous.at(-1);
      // Fit the current trajectory, keeping the initial state readable at early times.
      ds=unitScale(hidden?[x]:discrete);const cs=unitScale(hidden?[x]:continuous);view=plane(canvas,4);const right=plane(lab.querySelector('[data-continuous-plane]'),4);
      arrow(view,x,ds,colors.input,'x₀',{width:5,offset:26});arrow(right,x,cs,colors.input,'x₀',{width:5,offset:26});if(!hidden){path(view,discrete,colors.secondary,ds,true);path(right,continuous,colors.secondary,cs);arrow(view,d,ds,colors.output,'xₙ',{offset:-25});arrow(right,c,cs,colors.output,'x(t)',{offset:-25});}drag.sync();fields.sync();
      nField.value=n;tField.value=t;lab.querySelector('[data-n-value]').textContent=n;lab.querySelector('[data-t-value]').textContent=fmt(t);lab.querySelector('[data-time-scale]').textContent='初值 x₀='+pair(x)+'。左图每格实际 '+fmt(ds)+'；右图每格实际 '+fmt(cs)+'。按当前轨迹自动调整比例；播放时网格单位可能改变，请用读数比较实际大小。';
      lab.querySelector('[data-time-result]').innerHTML=hidden?'结果暂未揭示；可使用 xₙ=(u+nv,v) 手算左侧横分量。播放请切回自由探索；仍可手动改变 n、t 重新预测。':row('离散 n='+n+'：Jⁿ='+matrix(M.power(J,n))+'；xₙ='+pair(d)+'。')+row('连续 t='+fmt(t)+'：e^(tJ)='+matrix(M.exponential(1,1,t))+'；x(t)='+pair(c)+'。')+row('连续速度 Jx(t)='+pair(M.apply(J,c))+'。连续解含 e^(t) 因子；离散一步与连续一单位时间不是同一规则。');lab.querySelectorAll('[data-discrete-play],[data-continuous-play]').forEach(b=>b.disabled=!!gate?.active());gate?.sync();
    }
    gate=window.LAStudy.challenge(lab,{question:()=> '共同初值 '+pair(x)+'，离散 n='+n+'。先手算 Jⁿx₀ 的横分量（不是连续流的横分量）。',choices:[['ready','我已用离散规则计算']],numeric:'预测左侧横分量',assess:(_,raw)=>{const a=parse(raw),expected=M.apply(M.power(J,n),x)[0];return !Number.isFinite(a)?{incomplete:true,explanation:'请填写有限数值，可用分数。'}:{correct:Math.abs(a-expected)<1e-7,explanation:'xₙ=(u+nv,v)，横分量='+fmt(x[0])+'+'+n+'×'+fmt(x[1])+'='+fmt(expected)+'。右侧则用 e^(t)(u+tv,v)，不能漏掉指数。'};},render:()=>{stop();if(gate.hidden()&&n===0)n=2;render();}});
    function changed(){stop();gate.changed();render();}
    nField.addEventListener('input',()=>{n=Number(nField.value);changed();});tField.addEventListener('input',()=>{t=Number(tField.value);changed();});
    lab.querySelector('[data-discrete-next]').addEventListener('click',()=>{n=Math.min(8,n+1);changed();});lab.querySelector('[data-continuous-next]').addEventListener('click',()=>{t=Math.min(3,Math.round((t+.05)*100)/100);changed();});
    lab.querySelector('[data-discrete-play]').addEventListener('click',()=>{if(discreteTimer!==null){stop('discrete');return;}if(gate.hidden())return;if(n===8)n=0;lab.querySelector('[data-discrete-play]').textContent='暂停离散步';discreteTimer=setInterval(()=>{n=Math.min(8,n+1);if(n===8)stop('discrete');render();},650);render();});
    lab.querySelector('[data-continuous-play]').addEventListener('click',()=>{if(continuousTimer!==null){stop('continuous');return;}if(gate.hidden())return;if(t===3)t=0;lab.querySelector('[data-continuous-play]').textContent='暂停连续流';continuousTimer=setInterval(()=>{t=Math.min(3,Math.round((t+.05)*100)/100);if(t===3)stop('continuous');render();},100);render();});
    lab.querySelector('[data-time-reset]').addEventListener('click',()=>{stop();x=[0,1];n=gate.active()?2:0;t=0;fields.clear();gate.changed();render();});document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});observe(lab,render);render();
  });
  document.querySelectorAll('[data-dynamics-lab]').forEach(lab=>{
    let lambda=-1,k=4,t=1,x=[0,1],timer=null,view,scale=1,gate;
    const canvas=lab.querySelector('[data-diagonal-plane]'),select=lab.querySelector('[data-dynamics-preset]'),lField=lab.querySelector('[data-lambda]'),kField=lab.querySelector('[data-k]'),tField=lab.querySelector('[data-dynamics-t]');
    select.insertAdjacentHTML('afterbegin','<option value="" disabled>自定义参数</option>');select.value='transient';
    function stop(){clearInterval(timer);timer=null;lab.querySelector('[data-dynamics-play]').textContent='播放演化';}
    function move(p){stop();x=p;select.value='';gate?.changed();render();}
    const fields=vectorFields(lab,'dynamics',()=>x,move),drag=handle(canvas,'动力系统共同初值端点',()=>x,move,()=>view,()=>scale);
    function normPlot(a,b,hidden){
      const c=lab.querySelector('[data-norm-plot]'),r=c.getBoundingClientRect();if(!r.width||!r.height)return;const ratio=Math.min(devicePixelRatio||1,2);c.width=Math.round(r.width*ratio);c.height=Math.round(r.height*ratio);const ctx=c.getContext('2d');ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,r.width,r.height);
      const max=Math.max(1,M.norm(x),...a.map(p=>M.norm(p.x)),...b.map(p=>M.norm(p.x)))*1.08,left=48,bottom=r.height-32,w=r.width-left-15,h=bottom-24,point=(time,value)=>[left+w*(t?time/t:0),bottom-h*value/max];
      ctx.strokeStyle='#819798';ctx.beginPath();ctx.moveTo(left,20);ctx.lineTo(left,bottom);ctx.lineTo(r.width-10,bottom);ctx.stroke();ctx.fillStyle='#405c60';ctx.font='12px sans-serif';ctx.fillText('||x||',4,14);ctx.fillText(fmt(max),2,32);ctx.fillText('0',left-13,bottom+16);ctx.fillText('t='+fmt(t),r.width-66,bottom+22);
      const y=point(0,M.norm(x))[1];ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(r.width-15,y);ctx.stroke();ctx.setLineDash([]);if(hidden)return;
      for(const [points,color] of [[a,colors.basis],[b,colors.secondary]]){ctx.beginPath();points.forEach((p,i)=>{const q=point(p.t,M.norm(p.x));if(i)ctx.lineTo(...q);else ctx.moveTo(...q);});ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.stroke();}
    }
    function render(){
      const hidden=gate?.hidden(),a=M.trajectory(lambda,0,t,x),b=M.trajectory(lambda,k,t,x),diagonal=a.at(-1).x,jordan=b.at(-1).x;
      scale=unitScale(hidden?[x]:[...a,...b].map(p=>p.x));view=plane(canvas,4);const right=plane(lab.querySelector('[data-jordan-plane]'),4);arrow(view,x,scale,colors.input,'x₀',{width:5,offset:26});arrow(right,x,scale,colors.input,'x₀',{width:5,offset:26});
      if(!hidden){path(view,a.map(p=>p.x),colors.basis,scale);path(right,b.map(p=>p.x),colors.secondary,scale);arrow(view,diagonal,scale,colors.basis,'x_B(t)',{offset:-26});arrow(right,jordan,scale,colors.secondary,'x_A(t)',{offset:-26});}drag.sync();fields.sync();lab.querySelector('[data-norm-plot]').hidden=!!hidden;normPlot(a,b,hidden);lab.querySelector('[data-dynamics-play]').disabled=!!gate?.active();
      lField.value=lambda;kField.value=k;tField.value=t;lab.querySelector('[data-lambda-value]').textContent=fmt(lambda);lab.querySelector('[data-k-value]').textContent=fmt(k);lab.querySelector('[data-dynamics-t-value]').textContent=fmt(t);
      lab.querySelector('[data-dynamics-scale]').textContent='共同初值 x₀='+pair(x)+'。两相平面每个网格单位实际代表 '+fmt(scale)+'；两图按当前轨迹使用共同缩放，播放时单位可能改变。请用数值和长度曲线比较增长，别用跨帧屏幕长度。长度图显示 0 到当前 t，纵轴随数据调整。';
      lab.querySelector('[data-dynamics-result]').innerHTML=hidden?'当前轨迹、长度与矩阵指数在提交后揭示；修改参数会清除旧判断。':row('B='+matrix(M.block(lambda,0))+'；A='+matrix(M.block(lambda,k))+'。')+row('e^(tA)='+matrix(M.exponential(lambda,k,t))+'。')+row('t='+fmt(t)+'：对照状态='+pair(diagonal)+'，长度='+fmt(M.norm(diagonal))+'；Jordan 状态='+pair(jordan)+'，长度='+fmt(M.norm(jordan))+'；初始长度='+fmt(M.norm(x))+'。')+row('解析式：e^('+fmt(lambda)+'t)('+fmt(x[0])+'+'+fmt(k)+'t×'+fmt(x[1])+', '+fmt(x[1])+')。'+(lambda<0?'最终两者都趋于零，当前是否放大需另看长度。':lambda===0?'λ=0：若 kv=0 状态不动，否则第一分量线性变化。':'λ>0：非零初值最终增长；零初值始终为零。'));gate?.sync();
    }
    gate=window.LAStudy.challenge(lab,{question:()=> 'λ='+fmt(lambda)+'，k='+fmt(k)+'，x₀='+pair(x)+'，t='+fmt(t)+'。当前 Jordan 状态是否比初始向量更长？只判断这一时刻。',choices:[['larger','当前长度大于初始长度'],['not-larger','当前长度不大于初始长度']],assess:c=>{const now=M.norm(M.state(lambda,k,t,x)),initial=M.norm(x),larger=now>initial+1e-10*Math.max(1,now,initial);return {correct:(c==='larger')===larger,explanation:'当前长度='+fmt(now)+'，初始长度='+fmt(initial)+'。用 e^(λt)(u+ktv,v) 直接计算后比较。'+(initial===0?'零初值始终为零。':larger?'这给出当前时刻的放大证据；不是对所有初值的断言。':'这个时刻没有放大；单个时刻还不足以排除其他时刻。')+'差异小于 10⁻¹⁰ 的相对显示容差时按数值上未检出放大处理。'};},render:()=>{stop();render();}});
    function changed(){stop();gate.changed();render();}
    lField.addEventListener('input',()=>{lambda=Number(lField.value);select.value='';changed();});kField.addEventListener('input',()=>{k=Number(kField.value);select.value='';changed();});tField.addEventListener('input',()=>{t=Number(tField.value);changed();});
    const settings={transient:[-1,4,[0,1]],'no-growth':[-1,4,[1,0]],diagonal:[-1,0,[0,1]],growing:[.5,1,[0,1]],nilpotent:[0,1,[0,1]],zero:[0,0,[0,1]]};
    function preset(id){[lambda,k,x]=settings[id];x=x.slice();t=1;stop();fields.clear();gate.changed();render();}
    select.addEventListener('change',()=>preset(select.value));lab.querySelector('[data-dynamics-reset]').addEventListener('click',()=>{select.value='transient';preset('transient');});
    lab.querySelector('[data-dynamics-play]').addEventListener('click',()=>{if(timer!==null){stop();return;}if(gate.hidden())return;if(t===6)t=0;lab.querySelector('[data-dynamics-play]').textContent='暂停演化';timer=setInterval(()=>{t=Math.min(6,Math.round((t+.05)*100)/100);if(t===6)stop();render();},100);render();});document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});observe(lab,render);render();
  });
})();
