(function () {
  "use strict";
  const add = (u,v) => [u[0]+v[0],u[1]+v[1]];
  const times = (c,u) => [c*u[0],c*u[1]];
  const near = (a,b) => Math.abs(a-b)<1e-9;
  const label = (n) => String(Object.is(n,-0)?0:n);
  const exact = (n) => {
    for (let d=1;d<=48;d++) if (near(n*d,Math.round(n*d))) return d===1?label(Math.round(n)): `${Math.round(n*d)}/${d}`;
    return `≈${n.toFixed(3)}`;
  };
  const pair = (v) => `(${exact(v[0])}, ${exact(v[1])})`;
  function lineSystem(m1,h1,m2,h2) {
    if (m1===m2) return {type:h1===h2?"infinite":"no-solution",point:null};
    const x=(h2-h1)/(m1-m2);
    return {type:"unique",point:[x,m1*x+h1]};
  }
  const sets = {
    line: {name:"过原点的直线 y=2x",min:-2,max:2,extent:9,recipe:"u=(s,2s)，v=(t,2t)",zero:true,subspace:true,proof:"直线是子空间：零向量在里面；(s,2s)+(t,2t)=(s+t,2(s+t))；c(s,2s)=(cs,2cs)。这些式子对任意实数 s、t、c 都成立，才是一般性理由。"},
    quadrant: {name:"第一象限（包括边界）",min:0,max:3,extent:7,recipe:"u=(s,1)，v=(1,t)，s、t≥0",zero:true,subspace:false,proof:"第一象限不是子空间：它含零向量、对加法封闭，但 (1,1) 乘 −1 得 (−1,−1)，跑到了集合外。只需要这一个反例，就足以否定数乘封闭。"},
    shifted: {name:"平移直线 x+y=1",min:-2,max:2,extent:7,recipe:"u=(s,1−s)，v=(t,1−t)",zero:false,subspace:false,proof:"平移直线不是子空间：原点不满足 x+y=1。并且 (1,0)+(0,1)=(1,1)，两分量之和是 2，已经不在这条直线上。"},
    cross: {name:"两条坐标轴的并集",min:-2,max:2,extent:5,recipe:"u=(s,0)，v=(0,t)",zero:true,subspace:false,proof:"两条坐标轴的并集不是子空间：它包含零向量，对任意数乘也封闭；但 (1,0)+(0,1)=(1,1) 不在任何一条坐标轴上，所以不对加法封闭。两条轴放在一起，不会自动补成整个平面。"}
  };
  function setMember(kind,[x,y]) {
    if (kind==="line") return near(y,2*x);
    if (kind==="quadrant") return x>=-1e-9 && y>=-1e-9;
    if (kind==="shifted") return near(x+y,1);
    if (kind==="cross") return near(x,0)||near(y,0);
    throw new Error("Unknown set");
  }
  function setInputs(kind,s,t) {
    if (kind==="line") return [[s,2*s],[t,2*t]];
    if (kind==="quadrant") return [[s,1],[1,t]];
    if (kind==="shifted") return [[s,1-s],[t,1-t]];
    return [[s,0],[0,t]];
  }
  function closureExample(kind,s,t,c,operation) {
    const [u,v]=setInputs(kind,s,t);
    const result=operation==="sum"?add(u,v):times(c,u);
    return {u,v,result,inside:setMember(kind,result)};
  }
  if (typeof module!=="undefined") module.exports={lineSystem,setMember,setInputs,closureExample,exact};
  if (typeof document==="undefined") return;

  function plot(canvas,extent) {
    const rect=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);
    const ctx=canvas.getContext("2d");ctx.setTransform(dpr,0,0,dpr,0,0);
    const width=rect.width,height=rect.height,origin={x:width/2,y:height/2+8};
    const unit=(Math.min(width,height)-80)/(2*extent);
    const point=([x,y])=>({x:origin.x+x*unit,y:origin.y-y*unit});
    ctx.clearRect(0,0,width,height);
    const step=extent<=9?1:extent<=20?5:extent<=60?10:20;
    const labelStep=extent<=6?1:extent<=12?2:step;
    ctx.font="12px Segoe UI, sans-serif";
    for (let k=-Math.floor(extent/step)*step;k<=extent;k+=step) {
      ctx.strokeStyle="#ddd9ce";ctx.lineWidth=1;
      [[[-extent,k],[extent,k]],[[k,-extent],[k,extent]]].forEach(([a,b])=>{const p=point(a),q=point(b);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();});
      if (k!==0&&near(k/labelStep,Math.round(k/labelStep))) {ctx.fillStyle="#667174";const p=point([k,0]),q=point([0,k]);ctx.fillText(String(k),p.x-4,p.y+17);if(Math.abs(k)>=2)ctx.fillText(String(k),q.x+5,q.y-3);}
    }
    ctx.strokeStyle="#7a8588";ctx.lineWidth=1.5;
    [[[-extent,0],[extent,0]],[[0,-extent],[0,extent]]].forEach(([a,b])=>{const p=point(a),q=point(b);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();});
    ctx.fillStyle="#465457";ctx.fillText("0",origin.x-12,origin.y+17);ctx.fillText("x",point([extent,0]).x+8,origin.y-6);ctx.fillText("y",origin.x-15,point([0,extent]).y-12);
    return {ctx,width,height,origin,point,unit,extent};
  }
  function segment(view,a,b,color,width=3) {
    const p=view.point(a),q=view.point(b),ctx=view.ctx;
    ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();
  }
  function arrow(view,from,to,color,width=3) {
    const p=view.point(from),q=view.point(to),ctx=view.ctx;
    if (Math.hypot(p.x-q.x,p.y-q.y)<1) {ctx.fillStyle=color;ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fill();return;}
    segment(view,from,to,color,width);const angle=Math.atan2(q.y-p.y,q.x-p.x);
    ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(q.x-10*Math.cos(angle-Math.PI/6),q.y-10*Math.sin(angle-Math.PI/6));ctx.lineTo(q.x-10*Math.cos(angle+Math.PI/6),q.y-10*Math.sin(angle+Math.PI/6));ctx.closePath();ctx.fill();
  }
  const equation=(m,h)=>`${m===0?"":-m===1?"x + ":-m===-1?"−x + ":`${label(-m)}x + `}y = ${label(h)}`;

  document.addEventListener("DOMContentLoaded",()=>{
    document.querySelectorAll("[data-system-lab]").forEach((lab)=>{
      const canvas=lab.querySelector("canvas"),fields=Object.fromEntries([...lab.querySelectorAll("[data-line-value]")].map(el=>[el.dataset.lineValue,el]));
      const get=name=>Number(fields[name].value);
      let fit=false,view,dragged=null,lockedExtent=null;
      function render() {
        const m1=get("m1"),h1=get("h1"),m2=get("m2"),h2=get("h2"),solution=lineSystem(m1,h1,m2,h2);
        const extent=lockedExtent??(fit&&solution.point?Math.max(6,...solution.point.map(n=>Math.abs(n)+1)):6);
        view=plot(canvas,extent);const {ctx,point,width,height}=view;
        ctx.save();ctx.beginPath();ctx.rect(0,32,width,height-32);ctx.clip();
        [[m1,h1,"#086c72"],[m2,h2,"#c35c3a"]].forEach(([m,h,color],i)=>{
          if (i===1&&solution.type==="infinite") ctx.setLineDash([9,7]);
          segment(view,[-extent,-m*extent+h],[extent,m*extent+h],color,3.5);ctx.setLineDash([]);
          const p=point([0,h]);ctx.fillStyle="#fff";ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,i===0?9:5,0,Math.PI*2);ctx.fill();ctx.stroke();
          ctx.fillStyle=color;ctx.font="bold 14px Segoe UI, sans-serif";ctx.fillText(i===0?"L₁":"L₂",p.x+14,p.y+(i===0?-9:18));
        });
        if (solution.point) {const p=point(solution.point);ctx.fillStyle="#b7861b";ctx.beginPath();ctx.arc(p.x,p.y,6,0,Math.PI*2);ctx.fill();if(Math.abs(solution.point[0])<=extent&&Math.abs(solution.point[1])<=extent){ctx.fillStyle="#17242a";ctx.fillText(pair(solution.point),Math.min(width-100,p.x+9),Math.max(46,p.y-10));}}
        ctx.restore();ctx.fillStyle="#465457";ctx.font="bold 13px Segoe UI, sans-serif";ctx.fillText("L₁ 青色 · L₂ 珊瑚色 · 金点是公共点",12,22);
        lab.querySelector("[data-equation-one]").textContent=equation(m1,h1);lab.querySelector("[data-equation-two]").textContent=equation(m2,h2);
        lab.querySelectorAll("[data-line-number]").forEach(el=>{el.textContent=label(get(el.dataset.lineNumber));});
        const outside=solution.point&&solution.point.some(n=>Math.abs(n)>extent);
        const status=lab.querySelector("[data-system-status]");status.dataset.outcome=solution.type;
        status.textContent=solution.type==="unique"?`唯一解：公共点 ${pair(solution.point)}。${outside?"交点在当前视野外，不代表无解；点“显示交点”查看。":"它同时满足两条方程。"}`:solution.type==="infinite"?"无穷多解：两条直线完全重合，线上每一点都同时满足两式。":"无解：两条直线斜率相同、位置不同，没有公共点。";
        const a=m2-m1,b=h1-h2;
        lab.querySelector("[data-elimination]").textContent=solution.type==="unique"?`第一式减第二式：${label(a)}x = ${label(b)}，所以 x = ${exact(solution.point[0])}，代回得到 y = ${exact(solution.point[1])}。`:solution.type==="infinite"?"第一式减第二式：0 = 0。它没有增加限制；保留的一条直线上仍有无穷多个解。":`第一式减第二式：0 = ${label(b)}。右端不是 0，产生矛盾，所以无解。`;
        lab.querySelector("[data-fit-intersection]").textContent=fit?"恢复标准视野":"显示交点";
        lab.querySelector("[data-fit-intersection]").disabled=solution.type!=="unique";
      }
      const clearPreset=()=>lab.querySelectorAll("[data-system-preset]").forEach(el=>el.setAttribute("aria-pressed","false"));
      Object.values(fields).forEach(el=>el.addEventListener("input",()=>{clearPreset();render();}));
      lab.querySelectorAll("[data-system-preset]").forEach(button=>button.addEventListener("click",()=>{
        const values={unique:[-2,5,-0.5,2],parallel:[-1,2,-1,3],same:[-1,2,-1,2]}[button.dataset.systemPreset];
        ["m1","h1","m2","h2"].forEach((name,i)=>{fields[name].value=values[i];});fit=false;
        lab.querySelectorAll("[data-system-preset]").forEach(el=>el.setAttribute("aria-pressed",String(el===button)));render();
      }));
      lab.querySelector("[data-fit-intersection]").addEventListener("click",()=>{fit=!fit;render();});
      canvas.addEventListener("pointerdown",event=>{
        const rect=canvas.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;
        const distances=["h1","h2"].map(name=>{const p=view.point([0,get(name)]);return Math.hypot(x-p.x,y-p.y);});
        if (Math.min(...distances)>22) return;
        dragged=distances[0]<=distances[1]?"h1":"h2";lockedExtent=view.extent;canvas.setPointerCapture(event.pointerId);
      });
      canvas.addEventListener("pointermove",event=>{
        if (!dragged) return;const rect=canvas.getBoundingClientRect();
        fields[dragged].value=Math.max(-6,Math.min(6,Math.round((view.origin.y-(event.clientY-rect.top))/view.unit*2)/2));clearPreset();render();
      });
      const end=()=>{dragged=null;lockedExtent=null;render();};canvas.addEventListener("pointerup",end);canvas.addEventListener("pointercancel",end);
      new ResizeObserver(render).observe(canvas);render();
    });

    document.querySelectorAll("[data-closure-lab]").forEach(lab=>{
      const canvas=lab.querySelector("canvas");
      const fields=Object.fromEntries([...lab.querySelectorAll("[data-set-value]")].map(el=>[el.dataset.setValue,el]));
      const get=name=>Number(fields[name].value);
      let kind="line",operation="sum";
      function render() {
        const spec=sets[kind],demo=closureExample(kind,get("s"),get("t"),get("c"),operation),view=plot(canvas,spec.extent),{ctx,point,width,height,origin}=view;
        ctx.save();ctx.beginPath();ctx.rect(0,32,width,height-32);ctx.clip();
        if (kind==="quadrant") {ctx.fillStyle="rgba(8,108,114,.12)";ctx.fillRect(origin.x,32,width-origin.x,origin.y-32);}
        if (kind==="line") segment(view,[-spec.extent,-2*spec.extent],[spec.extent,2*spec.extent],"rgba(8,108,114,.4)",9);
        if (kind==="shifted") segment(view,[-spec.extent,1+spec.extent],[spec.extent,1-spec.extent],"rgba(8,108,114,.4)",9);
        if (kind==="cross") {segment(view,[-spec.extent,0],[spec.extent,0],"rgba(8,108,114,.4)",9);segment(view,[0,-spec.extent],[0,spec.extent],"rgba(8,108,114,.4)",9);}
        arrow(view,[0,0],demo.u,"#086c72",5);
        if (operation==="sum") {arrow(view,[0,0],demo.v,"#b7861b",3);ctx.setLineDash([5,5]);arrow(view,demo.u,demo.result,"#b7861b",2);ctx.setLineDash([]);}
        arrow(view,[0,0],demo.result,"#c35c3a",2.5);
        ctx.font="bold 14px Segoe UI, sans-serif";const p=point(demo.u),q=point(demo.v),r=point(demo.result);
        ctx.fillStyle="#086c72";ctx.fillText("u",p.x+8,p.y+18);
        if(operation==="sum"){ctx.fillStyle="#89620d";ctx.fillText("v",q.x+8,q.y-10);}
        ctx.fillStyle="#c35c3a";ctx.fillText(operation==="sum"?"u+v":"c·u",demo.result[0]<0?r.x-34:r.x+8,demo.result[1]<0?r.y+19:r.y-10);
        const zero=point([0,0]);ctx.strokeStyle=spec.zero?"#256b46":"#933b32";ctx.lineWidth=2;ctx.beginPath();ctx.arc(zero.x,zero.y,7,0,Math.PI*2);ctx.stroke();
        if(!spec.zero){ctx.beginPath();ctx.moveTo(zero.x-5,zero.y-5);ctx.lineTo(zero.x+5,zero.y+5);ctx.moveTo(zero.x-5,zero.y+5);ctx.lineTo(zero.x+5,zero.y-5);ctx.stroke();}
        ctx.restore();ctx.fillStyle="#465457";ctx.font="bold 13px Segoe UI, sans-serif";ctx.fillText("青色区域/粗线是集合 · 珊瑚色是运算结果",12,22);
        lab.querySelector("[data-set-recipe]").textContent=`当前集合：${spec.name}。成员的选法：${spec.recipe}。`;
        lab.querySelectorAll("[data-set-number]").forEach(el=>{el.textContent=label(get(el.dataset.setNumber));});
        lab.querySelector("[data-zero-check]").textContent=spec.zero?"零向量检查：原点在集合中。":"零向量检查：原点不在集合中，已经足以否定它是子空间。";
        const status=lab.querySelector("[data-closure-status]");status.dataset.outcome=demo.inside?"inside":"outside";
        status.textContent=`输入 u=${pair(demo.u)}${operation==="sum"?`、v=${pair(demo.v)}`:""} 都选自集合。${operation==="sum"?"u+v":`${label(get("c"))}·u`}=${pair(demo.result)}，${demo.inside?"这次仍在集合中。一次通过不能代替对所有情况的证明。":"结果跑出了集合！这就是一个反例，足以否定相应运算的封闭性。"}`;
        lab.querySelector("[data-set-verdict]").textContent=spec.proof;
        lab.querySelector("[data-counterexample]").textContent=kind==="line"?"试一组相消的向量":"一键查看反例";
        lab.querySelectorAll("[data-set-kind]").forEach(el=>el.setAttribute("aria-pressed",String(el.dataset.setKind===kind)));
        lab.querySelectorAll("[data-closure-op]").forEach(el=>el.setAttribute("aria-pressed",String(el.dataset.closureOp===operation)));
        fields.c.disabled=operation==="sum";fields.t.disabled=operation!=="sum";
      }
      lab.querySelectorAll("[data-set-kind]").forEach(button=>button.addEventListener("click",()=>{
        kind=button.dataset.setKind;operation="sum";
        [fields.s,fields.t].forEach(el=>{el.min=sets[kind].min;el.max=sets[kind].max;el.value=1;});
        if(kind==="shifted")fields.t.value=0;
        fields.c.value=1;render();
      }));
      lab.querySelectorAll("[data-closure-op]").forEach(button=>button.addEventListener("click",()=>{operation=button.dataset.closureOp;render();}));
      Object.values(fields).forEach(el=>el.addEventListener("input",render));
      lab.querySelector("[data-counterexample]").addEventListener("click",()=>{
        fields.s.value=1;fields.t.value=kind==="line"?-1:kind==="shifted"?0:1;fields.c.value=-1;operation=kind==="quadrant"?"scale":"sum";render();
      });
      new ResizeObserver(render).observe(canvas);render();
    });
  });
})();
