(function () {
  "use strict";
  const determinant = ([a,b,c,d]) => a*d-b*c;
  const vertices = ([a,b,c,d]) => [[0,0],[a,c],[a+b,c+d],[b,d]];
  const swapColumns = ([a,b,c,d]) => [b,a,d,c];
  if (typeof module !== "undefined") module.exports = {determinant,vertices,swapColumns};
  if (typeof document === "undefined") return;
  const fmt = n => String(Number(n.toFixed(2)));
  const factor = n => n < 0 ? `(${fmt(n)})` : fmt(n);
  document.querySelectorAll('[data-determinant-lab]').forEach(lab => {
    let M = [2,1,1,2], dragged = null,gate;
    const canvas = lab.querySelector('canvas'), ctx = canvas.getContext('2d');
    const sliders = [...lab.querySelectorAll('input[type="range"]')];
    const presets = [...lab.querySelectorAll('[data-det-preset]')];
    let w = 500, h = 390, unit = 25;
    const project = ([x,y]) => [w/2+x*unit,h/2-y*unit];
    function line(points,color,width=1,close=false,fill=null) {
      ctx.beginPath(); points.map(project).forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
      if(close) ctx.closePath(); if(fill) {ctx.fillStyle=fill;ctx.fill();}
      ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
    }
    function draw() {
      const bounds = canvas.getBoundingClientRect(); w=bounds.width;h=bounds.height;
      const ratio=window.devicePixelRatio||1;
      canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);
      unit=Math.min(w,h)/14;ctx.clearRect(0,0,w,h);
      for(let k=-7;k<=7;k++) {line([[k,-7],[k,7]],k===0?'#84999b':'#e0e8e7');line([[-7,k],[7,k]],k===0?'#84999b':'#e0e8e7');}
      line([[0,0],[1,0],[1,1],[0,1]],'#627273',2,true);
      const polygon=vertices(M);
      if(!gate?.hidden())line(polygon,'#ac7620',2,true,'rgba(224,172,57,.23)');
      // Small boundary arrows show the ordered walk, not a rigid rotation of the shape.
      if(!gate?.hidden()&&determinant(M)!==0)polygon.forEach((p,i)=>{
        const q=polygon[(i+1)%4],a=project(p),b=project(q);
        const x=(a[0]+b[0])/2,y=(a[1]+b[1])/2,angle=Math.atan2(b[1]-a[1],b[0]-a[0]);
        ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-7*Math.cos(angle-.5),y-7*Math.sin(angle-.5));ctx.lineTo(x-7*Math.cos(angle+.5),y-7*Math.sin(angle+.5));ctx.closePath();ctx.fillStyle='#ac7620';ctx.fill();
      });
      [[M[0],M[2]],[M[1],M[3]]].forEach((p,i) => {
        const color=i?'#bc4e32':'#007b80';line([[0,0],p],color,3);
        const [x,y]=project(p),angle=Math.atan2(-p[1],p[0]);
        if(p[0]||p[1]) {ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-11*Math.cos(angle-.45),y-11*Math.sin(angle-.45));ctx.lineTo(x-11*Math.cos(angle+.45),y-11*Math.sin(angle+.45));ctx.closePath();ctx.fillStyle=color;ctx.fill();}
        ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
        ctx.font='bold 14px sans-serif';ctx.fillText(`${i?'v':'u'} (${fmt(p[0])}, ${fmt(p[1])})`,Math.max(4,Math.min(w-105,x+10)),y-13);
      });
      ctx.fillStyle='#4b6061';ctx.font='13px sans-serif';ctx.fillText('固定刻度：每格 1；灰色小方框面积 1',12,h-14);
    }
    function render() {
      sliders.forEach((s,i) => {s.value=M[i];lab.querySelector(`[data-det-value="${i}"]`).textContent=fmt(M[i]);});
      lab.querySelector('[data-det-matrix]').innerHTML=`M = <span class="matrix">${M.map(n=>`<span>${fmt(n)}</span>`).join('')}</span>`;
      const det=determinant(M);
      lab.querySelector('[data-det-readout]').textContent=`det(M) = ${factor(M[0])} × ${factor(M[3])} − ${factor(M[1])} × ${factor(M[2])} = ${fmt(det)}；普通面积 = ${fmt(Math.abs(det))}。${det>0?'方向保持（逆时针）；可逆。':det<0?'方向翻转（顺时针）；可逆。':M.every(n=>n===0)?'缩成一个点；秩 0，不可逆。':'压成一条线；秩 1，不可逆。'}`;
      presets.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.detPreset===M.join(','))));
      lab.querySelector('[data-det-readout]').hidden=gate?.hidden()||false;gate?.sync();
      draw();
    }
    function changedRender(){gate?.changed();render();}
    sliders.forEach((s,i)=>s.addEventListener('input',()=>{M[i]=Number(s.value);changedRender();}));
    presets.forEach(b=>b.addEventListener('click',()=>{M=b.dataset.detPreset.split(',').map(Number);changedRender();}));
    lab.querySelector('[data-det-swap]').addEventListener('click',()=>{M=swapColumns(M);changedRender();});
    canvas.addEventListener('pointerdown',e=>{
      const r=canvas.getBoundingClientRect(),p=[e.clientX-r.left,e.clientY-r.top];
      const distances=[[M[0],M[2]],[M[1],M[3]]].map(v=>{const q=project(v);return Math.hypot(p[0]-q[0],p[1]-q[1]);});
      // When handles overlap, sliders remain an unambiguous alternative for either column.
      const i=distances[0]<=distances[1]?0:1;
      if(distances[i]<26) {dragged=i;canvas.setPointerCapture(e.pointerId);}
    });
    canvas.addEventListener('pointermove',e=>{
      if(dragged===null)return;const r=canvas.getBoundingClientRect();
      const snap=n=>Math.max(-3,Math.min(3,Math.round(n*2)/2));
      M[dragged]=snap((e.clientX-r.left-w/2)/unit);M[dragged+2]=snap((h/2-e.clientY+r.top)/unit);changedRender();
    });
    ['pointerup','pointercancel','lostpointercapture'].forEach(event=>canvas.addEventListener(event,()=>{dragged=null;}));
    gate=window.LAStudy.challenge(lab,{question:()=>`当前 M 两行为 (${M[0]},${M[1]})、(${M[2]},${M[3]})。先用两列的方向或 ad−bc 预测行列式的符号；正负判断的是有向面积，不是普通面积会变负。`,choices:[['positive','正：保持方向'],['zero','零：压扁'],['negative','负：翻转方向']],assess:choice=>{const det=determinant(M),expected=det>0?'positive':det<0?'negative':'zero';return {correct:choice===expected,explanation:`${factor(M[0])}×${factor(M[3])}−${factor(M[1])}×${factor(M[2])}=${fmt(det)}。普通面积为 ${fmt(Math.abs(det))}。${det===0?'两列相关或全零，不能围出非零面积，所以不可逆。':det<0?'符号翻转但面积未消失，矩阵仍可逆。':'方向保持且面积非零，矩阵可逆。'}`};},render});
    new ResizeObserver(draw).observe(canvas);render();
  });
})();
