(function () {
  'use strict';
  function inner(u,v,w=[1,1]) {return w[0]*u[0]*v[0]+w[1]*u[1]*v[1];}
  function length(u,w=[1,1]) {return Math.sqrt(inner(u,u,w));}
  function measure(u,v,w=[1,1]) {
    if(w.some(n=>!Number.isFinite(n)||n<=0))throw new RangeError('Weights must be positive.');
    const dot=inner(u,v,w), uu=inner(u,u,w),vv=inner(v,v,w);
    const coefficient=vv===0?null:dot/vv;
    const projection=coefficient===null?null:v.map(n=>n*coefficient);
    const residual=projection?u.map((n,i)=>n-projection[i]):null;
    return {dot,uu,vv,coefficient,projection,residual,angle:uu&&vv?Math.acos(Math.max(-1,Math.min(1,dot/Math.sqrt(uu*vv))))*180/Math.PI:null};
  }
  const errorSquared=(u,v,t,w=[1,1])=>inner(u.map((n,i)=>n-t*v[i]),u.map((n,i)=>n-t*v[i]),w);
  const rescale=(u,w)=>u.map((n,i)=>n*Math.sqrt(w[i]));
  if(typeof module!=='undefined')module.exports={inner,length,measure,errorSquared,rescale};
  if(typeof document==='undefined')return;
  const fmt=n=>n===null?'未定义':String(Number(n.toFixed(3)));
  const pair=v=>`(${v.map(fmt).join(', ')})`;
  const factor=n=>n<0?`(${fmt(n)})`:fmt(n);
  document.querySelectorAll('[data-inner-lab]').forEach(lab=>{
    const weighted=lab.dataset.innerLab==='weighted';
    let u=[2,1],v=[1,1],weights=[1,weighted?3:1],scaled=false,t=0,dragged=null,zoom=1;
    const canvas=lab.querySelector('[data-inner-plane]'),ctx=canvas.getContext('2d');
    const graph=lab.querySelector('[data-error-curve]'),gc=graph.getContext('2d');
    const controls=lab.querySelector('.lab-controls');
    const slider=(key,label,value,min,max,step)=>`<label class="control">${label}<output data-inner-value="${key}">${value}</output><input aria-label="${label}" data-inner-input="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;
    controls.innerHTML=[slider('ux','u 的 x',2,-3,3,.5),slider('uy','u 的 y',1,-3,3,.5),slider('vx','v 的 x',1,-3,3,.5),slider('vy','v 的 y',1,-3,3,.5),...(weighted?[slider('wx','横向权重 wₓ',1,.5,3,.5),slider('wy','纵向权重 wᵧ',3,.5,3,.5)]:[])].join('')+
      `<div>${['默认例子','A 的两列','欧氏垂直例子','反向例子','零向量 u','零向量 v'].map((name,i)=>`<button type="button" data-inner-preset="${i}">${name}</button>`).join('')}</div>`+
      (weighted?'<button type="button" data-equal-weights>恢复权重 (1,1)</button><button type="button" data-scaled-view aria-pressed="false">切换到缩放后的坐标</button>':'')+
      '<button type="button" data-inner-zoom aria-pressed="false">放大图像 ×2</button>';
    const summary=document.createElement('p');summary.className='lab-readout';summary.setAttribute('data-inner-summary','');summary.setAttribute('aria-live','polite');lab.querySelector('.lab-grid').after(summary);
    const trial=lab.querySelector('[data-trial-controls]');
    trial.innerHTML=slider('t','候选系数 t',0,-3,3,'any')+'<button type="button" data-best-t>移到最佳系数</button><p class="lab-readout" data-trial-summary aria-live="polite"></p>';
    let width=500,height=390,unit=25;
    const display=p=>scaled?rescale(p,weights):p;
    const point=p=>{const q=display(p);return [width/2+q[0]*unit,height/2-q[1]*unit];};
    function stroke(points,color,dash=[]) {
      ctx.setLineDash(dash);ctx.beginPath();points.map(point).forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();ctx.setLineDash([]);
    }
    function arrow(p,color,label,offset) {
      stroke([[0,0],p],color);const [x,y]=point(p),q=display(p),angle=Math.atan2(-q[1],q[0]);
      if(q[0]||q[1]) {ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-10*Math.cos(angle-.45),y-10*Math.sin(angle-.45));ctx.lineTo(x-10*Math.cos(angle+.45),y-10*Math.sin(angle+.45));ctx.closePath();ctx.fillStyle=color;ctx.fill();}
      ctx.beginPath();ctx.arc(x,y,6,0,2*Math.PI);ctx.fillStyle=color;ctx.fill();
      ctx.font='bold 14px sans-serif';ctx.fillText(label,Math.max(5,Math.min(width-80,x+9)),Math.max(16,Math.min(height-28,y+offset)));
    }
    function size(c,context) {const r=c.getBoundingClientRect(),ratio=window.devicePixelRatio||1;c.width=Math.round(r.width*ratio);c.height=Math.round(r.height*ratio);context.setTransform(ratio,0,0,ratio,0,0);return r;}
    function draw() {
      const r=size(canvas,ctx);width=r.width;height=r.height;unit=Math.min(width,height)/14*zoom;
      ctx.clearRect(0,0,width,height);
      // Grid is in displayed coordinates. No automatic zoom during dragging or weight changes.
      ctx.lineWidth=1;for(let k=-7;k<=7;k++) {ctx.strokeStyle=k?'#e0e8e7':'#8ba0a0';ctx.beginPath();ctx.moveTo(width/2+k*unit,0);ctx.lineTo(width/2+k*unit,height);ctx.moveTo(0,height/2-k*unit);ctx.lineTo(width,height/2-k*unit);ctx.stroke();}
      const ellipse=Array.from({length:121},(_,i)=>{const a=i*Math.PI/60;return [Math.cos(a)/Math.sqrt(weights[0]),Math.sin(a)/Math.sqrt(weights[1])];});
      stroke(ellipse,'#8c66aa');
      const m=measure(u,v,weights);
      if(m.angle!==null&&(scaled||weights[0]===weights[1])) {
        const du=display(u),dv=display(v),start=Math.atan2(-dv[1],dv[0]);
        let difference=Math.atan2(-du[1],du[0])-start;
        if(difference>Math.PI)difference-=2*Math.PI;if(difference< -Math.PI)difference+=2*Math.PI;
        ctx.beginPath();ctx.arc(width/2,height/2,24,start,start+difference,difference<0);ctx.strokeStyle='#607d83';ctx.lineWidth=1;ctx.stroke();
      }
      if(m.projection) {
        const n=length(v);stroke([v.map(x=>-10*x/n),v.map(x=>10*x/n)],'#c8a45c',[5,5]);
        stroke([m.projection,u],'#725a99',[5,4]);arrow(m.projection,'#a57718','p',29);
      }
      arrow(u,'#087d82','u',-16);arrow(v,'#c05a3a','v',18);
      ctx.fillStyle='#4b6061';ctx.font='12px sans-serif';ctx.fillText(scaled?'缩放坐标：x′=√wₓ x，y′=√wᵧ y；每格 1':'原坐标：x 向右，y 向上；每格 1',10,height-12);
      drawCurve();
    }
    function drawCurve() {
      const r=size(graph,gc),w=r.width,h=r.height,pad=36;
      gc.clearRect(0,0,w,h);const maximum=Math.max(1,errorSquared(u,v,-3,weights),errorSquared(u,v,3,weights))*1.05;
      const xy=(t,y)=>[pad+(t+3)/6*(w-2*pad),h-pad-y/maximum*(h-2*pad)];
      gc.strokeStyle='#7e9394';gc.lineWidth=1;gc.beginPath();gc.moveTo(pad,12);gc.lineTo(pad,h-pad);gc.lineTo(w-12,h-pad);gc.stroke();
      gc.beginPath();for(let i=0;i<=120;i++){const ti=-3+i/20,[x,y]=xy(ti,errorSquared(u,v,ti,weights));i?gc.lineTo(x,y):gc.moveTo(x,y);}gc.strokeStyle='#087d82';gc.lineWidth=2;gc.stroke();
      const [x,y]=xy(t,errorSquared(u,v,t,weights));gc.beginPath();gc.arc(x,y,5,0,2*Math.PI);gc.fillStyle='#c05a3a';gc.fill();
      const best=measure(u,v,weights).coefficient;
      if(best!==null&&best>=-3&&best<=3){const [bx,by]=xy(best,errorSquared(u,v,best,weights));gc.beginPath();gc.arc(bx,by,4,0,2*Math.PI);gc.fillStyle='#a57718';gc.fill();}
      gc.fillStyle='#344e51';gc.font='12px sans-serif';gc.fillText('误差平方 F(t)（纵轴自动缩放）',pad,15);gc.fillText('−3',pad-8,h-12);gc.fillText('0',w/2-4,h-12);gc.fillText('3 → t',w-pad-10,h-12);
    }
    function render() {
      const values={ux:u[0],uy:u[1],vx:v[0],vy:v[1],wx:weights[0],wy:weights[1],t};
      lab.querySelectorAll('[data-inner-input]').forEach(s=>{s.value=values[s.dataset.innerInput];lab.querySelector(`[data-inner-value="${s.dataset.innerInput}"]`).textContent=fmt(values[s.dataset.innerInput]);});
      const m=measure(u,v,weights),sym=weighted?'⟨u,v⟩w':'u·v';
      const calc=[0,1].map(i=>`${weighted?fmt(weights[i])+'×':''}${factor(u[i])}×${factor(v[i])}`).join(' + ');
      summary.textContent=`u=${pair(u)}，v=${pair(v)}；${sym}=${calc}=${fmt(m.dot)}。长度：‖u‖=${fmt(Math.sqrt(m.uu))}，‖v‖=${fmt(Math.sqrt(m.vv))}；夹角=${m.angle===null?'未定义（含零向量）':fmt(m.angle)+'°'}。${m.projection?`系数 α=${fmt(m.coefficient)}；p=${pair(m.projection)}；r=u−p=${pair(m.residual)}；⟨r,v⟩=${fmt(inner(m.residual,v,weights))}。`:'v=0，无法确定投影直线；公式分母为 0。若目标集合仅为 {0}，最近点就是 0。'}${zoom===2?'当前图像放大 2 倍；超出视窗的端点请缩小查看，数值不变。':''}`;
      lab.querySelector('[data-trial-summary]').textContent=`候选 q=t v，t=${fmt(t)}；误差平方 F(t)=‖u−t v‖²=${fmt(errorSquared(u,v,t,weights))}。${m.coefficient===null?'v=0 时，所有 t 都给 q=0，误差不随 t 改变。':`最佳系数 α=${fmt(m.coefficient)}，最小误差平方=${fmt(inner(m.residual,m.residual,weights))}。`}`;
      lab.querySelector('[data-best-t]').disabled=m.coefficient===null||m.coefficient< -3||m.coefficient>3;
      if(m.coefficient!==null&&(m.coefficient< -3||m.coefficient>3))lab.querySelector('[data-trial-summary]').textContent+='最佳系数超出候选滑块 [−3,3]，上图 p 与最佳读数仍为真实值。';
      if(weighted){const b=lab.querySelector('[data-scaled-view]');b.setAttribute('aria-pressed',String(scaled));b.textContent=scaled?'回到原坐标图':'切换到缩放后的坐标';}
      draw();
    }
    lab.querySelectorAll('[data-inner-input]').forEach(s=>s.addEventListener('input',()=>{
      const key=s.dataset.innerInput,n=Number(s.value);
      if(key==='t')t=n;else if(key[0]==='u')u[key==='ux'?0:1]=n;else if(key[0]==='v')v[key==='vx'?0:1]=n;else weights[key==='wx'?0:1]=n;
      render();
    }));
    const examples=[[[2,1],[1,1]],[[2,1],[1,2]],[[2,1],[-1,2]],[[2,1],[-2,-1]],[[0,0],[1,1]],[[2,1],[0,0]]];
    lab.querySelectorAll('[data-inner-preset]').forEach(b=>b.addEventListener('click',()=>{[u,v]=examples[Number(b.dataset.innerPreset)].map(p=>p.slice());t=0;render();}));
    lab.querySelector('[data-best-t]').addEventListener('click',()=>{const best=measure(u,v,weights).coefficient;if(best!==null&&best>=-3&&best<=3){t=best;render();}});
    if(weighted){lab.querySelector('[data-equal-weights]').addEventListener('click',()=>{weights=[1,1];render();});lab.querySelector('[data-scaled-view]').addEventListener('click',()=>{scaled=!scaled;render();});}
    lab.querySelector('[data-inner-zoom]').addEventListener('click',()=>{zoom=zoom===1?2:1;const b=lab.querySelector('[data-inner-zoom]');b.setAttribute('aria-pressed',String(zoom===2));b.textContent=zoom===2?'恢复完整视野':'放大图像 ×2';render();});
    canvas.addEventListener('pointerdown',e=>{const r=canvas.getBoundingClientRect(),mouse=[e.clientX-r.left,e.clientY-r.top],distance=[u,v].map(p=>{const q=point(p);return Math.hypot(q[0]-mouse[0],q[1]-mouse[1]);});const i=distance[0]<=distance[1]?0:1;if(distance[i]<26){dragged=i;canvas.setPointerCapture(e.pointerId);}});
    canvas.addEventListener('pointermove',e=>{if(dragged===null)return;const r=canvas.getBoundingClientRect(),p=[(e.clientX-r.left-width/2)/unit,(height/2-e.clientY+r.top)/unit].map((n,i)=>Math.max(-3,Math.min(3,Math.round(n/(scaled?Math.sqrt(weights[i]):1)*2)/2)));if(dragged===0)u=p;else v=p;render();});
    ['pointerup','pointercancel','lostpointercapture'].forEach(event=>canvas.addEventListener(event,()=>{dragged=null;}));
    new ResizeObserver(draw).observe(canvas);new ResizeObserver(drawCurve).observe(graph);render();
  });
})();
