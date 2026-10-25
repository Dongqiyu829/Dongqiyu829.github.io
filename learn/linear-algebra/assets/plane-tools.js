(function(){
  'use strict';
  const colors={input:'#086c72',output:'#c35c3a',basis:'#b7861b',secondary:'#7652a1'};
  // Shared coordinate plane for eigenvector, coordinate-change and counterexample labs.
  function plane(canvas,extent=6,axisLabels=['x','y']){
    const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return null;
    const ratio=Math.min(devicePixelRatio||1,2),ctx=canvas.getContext('2d');canvas.width=Math.round(r.width*ratio);canvas.height=Math.round(r.height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);
    const w=r.width,h=r.height,unit=Math.min(w,h)/(2*extent+2),origin=[w/2,h/2],point=([x,y])=>[origin[0]+x*unit,origin[1]-y*unit];ctx.clearRect(0,0,w,h);
    function line(a,b,color='#ddd9ce',width=1,dash=[]){const p=point(a),q=point(b);ctx.beginPath();ctx.setLineDash(dash);ctx.moveTo(...p);ctx.lineTo(...q);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();ctx.setLineDash([]);}
    const tick=extent>10?2:1;for(let k=-extent;k<=extent;k+=tick){line([-extent,k],[extent,k]);line([k,-extent],[k,extent]);}
    line([-extent,0],[extent,0],'#819798');line([0,-extent],[0,extent],'#819798');ctx.fillStyle='#405c60';ctx.font='12px sans-serif';ctx.fillText('0',origin[0]-12,origin[1]+15);ctx.fillText(String(tick),origin[0]+tick*unit-3,origin[1]+15);ctx.fillText(axisLabels[0],w-25,origin[1]-8);ctx.fillText(axisLabels[1],origin[0]+8,18);
    function arrow(v,color,label='',{width=3,dash=[],offset=-14}={}){const p=point([0,0]),q=point(v);line([0,0],v,color,width,dash);const a=Math.atan2(q[1]-p[1],q[0]-p[0]);ctx.fillStyle=color;ctx.beginPath();ctx.arc(...q,4,0,2*Math.PI);ctx.fill();if(Math.hypot(q[0]-p[0],q[1]-p[1])>2){ctx.beginPath();ctx.moveTo(...q);ctx.lineTo(q[0]-10*Math.cos(a-.45),q[1]-10*Math.sin(a-.45));ctx.lineTo(q[0]-10*Math.cos(a+.45),q[1]-10*Math.sin(a+.45));ctx.closePath();ctx.fill();}ctx.font='bold 13px sans-serif';ctx.fillText(label,Math.max(4,Math.min(w-100,q[0]+8)),Math.max(18,Math.min(h-16,q[1]+offset)));}
    return {ctx,point,line,arrow,origin,unit,extent};
  }
  function drag(canvas,getPoint,setPoint,getView,hooks={}){let active=false;canvas.addEventListener('pointerdown',e=>{const r=canvas.getBoundingClientRect(),view=getView();if(!view)return;const p=view.point(getPoint());if(Math.hypot(e.clientX-r.left-p[0],e.clientY-r.top-p[1])<28){active=true;hooks.start?.(view.extent);canvas.setPointerCapture(e.pointerId);}});canvas.addEventListener('pointermove',e=>{if(!active)return;const r=canvas.getBoundingClientRect(),v=getView(),snap=n=>Math.max(-3,Math.min(3,Math.round(n*4)/4));setPoint([snap((e.clientX-r.left-v.origin[0])/v.unit),snap((v.origin[1]-e.clientY+r.top)/v.unit)]);});['pointerup','pointercancel','lostpointercapture'].forEach(name=>canvas.addEventListener(name,()=>{if(active){active=false;hooks.end?.();}}));}
  window.LAPlane={plane,drag,colors};
})();
