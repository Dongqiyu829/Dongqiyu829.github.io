(function(){
  'use strict';
  const integral=([a,b],[c,d])=>a*c+(a*d+b*c)/2+b*d/3;
  if(typeof module!=='undefined')module.exports={integral};
  if(typeof document==='undefined')return;
  const fmt=n=>String(Number(n.toFixed(3)));
  document.querySelectorAll('[data-function-lab]').forEach(lab=>{
    let coefficients=[1,0,-1,2];
    const canvas=lab.querySelector('canvas'),ctx=canvas.getContext('2d'),controls=lab.querySelector('[data-function-controls]');
    controls.innerHTML=['a','b','c','d'].map((name,i)=>`<label class="control">${name}<output data-function-value="${i}">${coefficients[i]}</output><input data-function-input="${i}" aria-label="函数系数 ${name}" type="range" min="-2" max="2" step="0.5" value="${coefficients[i]}"></label>`).join('')+'<button type="button" data-function-preset="1,0,-1,2">正负抵消</button><button type="button" data-function-preset="1,0,1,0">两个常数 1</button><button type="button" data-function-preset="0,1,0,1">两个 s</button><button type="button" data-function-preset="0,0,-1,2">零函数 f</button><p class="lab-readout" data-function-readout aria-live="polite"></p>';
    function draw(){
      const r=canvas.getBoundingClientRect();if(!r.width)return;
      const ratio=window.devicePixelRatio||1;canvas.width=Math.round(r.width*ratio);canvas.height=Math.round(r.height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);
      const w=r.width,h=r.height,pad=35,[a,b,c,d]=coefficients;
      const f=s=>a+b*s,g=s=>c+d*s,product=s=>f(s)*g(s);
      const max=Math.max(1,...Array.from({length:101},(_,i)=>Math.max(Math.abs(f(i/100)),Math.abs(g(i/100)),Math.abs(product(i/100)))))*1.15;
      const point=(s,y)=>[pad+s*(w-2*pad),h/2-y/max*(h/2-pad)];
      ctx.clearRect(0,0,w,h);
      for(let i=0;i<160;i++){const s=i/160,next=(i+1)/160,value=product((s+next)/2),points=[[s,0],[s,product(s)],[next,product(next)],[next,0]];ctx.beginPath();points.map(p=>point(...p)).forEach(([x,y],j)=>j?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=value>=0?'rgba(8,125,130,.22)':'rgba(192,90,58,.28)';ctx.fill();}
      ctx.strokeStyle='#91a2a2';ctx.beginPath();ctx.moveTo(pad,20);ctx.lineTo(pad,h-20);ctx.moveTo(pad,h/2);ctx.lineTo(w-pad,h/2);ctx.stroke();
      [[f,'#087d82'],[g,'#a57718'],[product,'#765094']].forEach(([fn,color])=>{ctx.beginPath();for(let i=0;i<=160;i++){const [x,y]=point(i/160,fn(i/160));i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.lineWidth=2;ctx.strokeStyle=color;ctx.stroke();});
      ctx.fillStyle='#344e51';ctx.font='12px sans-serif';ctx.fillText('0',pad-18,h/2+14);ctx.fillText('1 → s',w-pad-24,h/2+18);ctx.fillText('f 青色 · g 金色 · fg 紫色；纵轴自动缩放',12,h-10);
    }
    function render(){
      controls.querySelectorAll('input').forEach((s,i)=>{s.value=coefficients[i];controls.querySelector(`[data-function-value="${i}"]`).textContent=fmt(coefficients[i]);});
      const [a,b,c,d]=coefficients,fg=integral([a,b],[c,d]),ff=integral([a,b],[a,b]),gg=integral([c,d],[c,d]);
      controls.querySelector('[data-function-readout]').textContent=`f(s)=${fmt(a)}+(${fmt(b)})s；g(s)=${fmt(c)}+(${fmt(d)})s。⟨f,g⟩=${fmt(fg)}；⟨f,f⟩=${fmt(ff)}；⟨g,g⟩=${fmt(gg)}。公式：ac+(ad+bc)/2+bd/3。${Math.abs(fg)<1e-10?'内积为 0，函数正交；不表示某一函数一定为零。':''}`;draw();
    }
    controls.querySelectorAll('input').forEach((s,i)=>s.addEventListener('input',()=>{coefficients[i]=Number(s.value);render();}));
    controls.querySelectorAll('[data-function-preset]').forEach(b=>b.addEventListener('click',()=>{coefficients=b.dataset.functionPreset.split(',').map(Number);render();}));
    new ResizeObserver(draw).observe(canvas);render();
  });
})();
