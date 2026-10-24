(function () {
  "use strict";
  const A = [2, 1, 1, 2];
  const add = (a, b) => a.map((n, i) => n + b[i]);
  const scale = (a, k) => a.map((n) => k * n);
  const transpose = ([a, b, c, d]) => [a, c, b, d];
  const multiply = ([a, b, c, d], [e, f, g, h]) => [a * e + b * g, a * f + b * h, c * e + d * g, c * f + d * h];
  const apply = ([a, b, c, d], [x, y]) => [a * x + b * y, c * x + d * y];
  const rank = ([a, b, c, d]) => a * d - b * c !== 0 ? 2 : (a || b || c || d ? 1 : 0);
  const nullVector = ([a, b, c, d]) => {
    if (rank([a, b, c, d]) !== 1) return null;
    return a || b ? [b, -a] : [d, -c];
  };
  const fmt = (n) => Number.isInteger(n) ? String(n) : n.toFixed(1);
  const pair = ([x, y]) => `(${fmt(x)}, ${fmt(y)})`;
  const collisionExample = (M, t) => {
    const start = [1, 0], direction = nullVector(M) || [0, 1];
    const moved = add(start, scale(direction, t));
    return { start, moved, direction, startOutput: apply(M, start), movedOutput: apply(M, moved) };
  };
  const factor = (n) => n < 0 ? `(${fmt(n)})` : fmt(n);
  function operationTrace(A, B, operation, target = 0) {
    const row = Math.floor(target / 2), col = target % 2;
    const position = `第 ${row + 1} 行第 ${col + 1} 列`;
    const source = (side, index) => ({ side, index });
    const detail = { operation, target, position, left: A, right: B, leftName: "A", rightName: "B", operator: "+", label: "A+B", scalar: false };
    if (["AB", "BA", "identity"].includes(operation)) {
      detail.left = operation === "BA" ? B : operation === "identity" ? [1,0,0,1] : A;
      detail.right = operation === "BA" ? A : B;
      detail.leftName = operation === "BA" ? "B" : operation === "identity" ? "I" : "A";
      detail.rightName = operation === "BA" ? "A" : "B";
      detail.label = operation === "identity" ? "IB" : operation;
      detail.operator = "×";
      detail.values = multiply(detail.left, detail.right);
      detail.parts = [0, 1].map((k) => {
        const l = row*2+k, r = k*2+col, value = detail.left[l]*detail.right[r];
        return { text: `${factor(detail.left[l])} × ${factor(detail.right[r])} = ${fmt(value)}`, value, sources: [source("left",l),source("right",r)] };
      });
      detail.calculation = [0,1].map((k) => `${factor(detail.left[row*2+k])}×${factor(detail.right[k*2+col])}`).join(" + ") + ` = ${fmt(detail.values[target])}`;
      detail.note = `求 ${detail.label} 的${position}：取 ${detail.leftName} 的第 ${row+1} 行、${detail.rightName} 的第 ${col+1} 列，对应相乘，再将两项相加。${detail.calculation}。`;
      detail.meaning = operation === "identity" ? "I 的 1 保留 B 对应元素，0 消去另一项，所以 IB=B。" : `对列向量先用右边的 ${detail.rightName}，再用左边的 ${detail.leftName}。`;
    } else if (operation === "double") {
      detail.left = null; detail.scalar = true; detail.leftName = "系数 2"; detail.operator = "×"; detail.label = "2B";
      detail.values = scale(B,2);
      detail.parts = [{ text: `2 × ${factor(B[target])} = ${fmt(detail.values[target])}`, value: detail.values[target], sources: [source("scalar",0),source("right",target)] }];
      detail.calculation = detail.parts[0].text;
      detail.note = `求 2B 的${position}：把 B 同位置的 ${fmt(B[target])} 乘 2。${detail.calculation}。`;
      detail.meaning = "同样的乘 2 要用于四个位置。";
    } else if (operation === "transpose") {
      const index = col*2+row;
      detail.left = B; detail.right = null; detail.leftName = "原矩阵 B"; detail.label = "Bᵀ"; detail.operator = "";
      detail.values = transpose(B);
      detail.parts = [{ text: `${fmt(B[index])}：原第 ${col+1} 行第 ${row+1} 列`, value: B[index], sources: [source("left",index)] }];
      detail.calculation = "行、列编号互换，数值保持不变";
      detail.note = `Bᵀ 的${position}来自 B 的第 ${col+1} 行第 ${row+1} 列，值为 ${fmt(B[index])}。转置是搬位置，不是对数字取倒数。`;
      detail.meaning = "点四个结果位置，看每个元素从哪里搬过来。";
    } else if (operation === "trace") {
      detail.left = B; detail.right = null; detail.leftName = "B 的主对角线"; detail.label = "tr(B)"; detail.operator = "";
      detail.values = null; detail.value = B[0]+B[3];
      detail.parts = [0,3].map((index) => ({text: fmt(B[index]), value: B[index], sources:[source("left",index)]}));
      detail.calculation = `${factor(B[0])} + ${factor(B[3])} = ${fmt(detail.value)}`;
      detail.note = `只取左上和右下两个主对角线元素：${detail.calculation}。迹是一个数，不是一个矩阵。`;
      detail.meaning = "本课只学习迹的计算；特征值的联系放到 Lesson 10。";
    } else {
      detail.values = add(A,B);
      detail.parts = [{text: fmt(A[target]),value:A[target],sources:[source("left",target)]},{text:fmt(B[target]),value:B[target],sources:[source("right",target)]}];
      detail.calculation = `${factor(A[target])} + ${factor(B[target])} = ${fmt(detail.values[target])}`;
      detail.note = `求 A+B 的${position}：分别取 A、B 同位置的元素相加。${detail.calculation}。`;
      detail.meaning = "加法要求两个矩阵的行数、列数分别相同。";
    }
    return detail;
  }
  const core = { add, scale, transpose, multiply, apply, rank, nullVector, collisionExample, operationTrace };
  if (typeof module !== "undefined") module.exports = core;
  if (typeof document === "undefined") return;

  function matrixNode(values) {
    const node = document.createElement("span");
    node.className = "matrix";
    values.forEach((value) => {
      const cell = document.createElement("span");
      cell.textContent = fmt(value);
      node.append(cell);
    });
    return node;
  }

  let diagramId = 0;
  function drawOperationGuide(guide, detail) {
    if (!guide) return;
    const colors = ["#086c72", "#bd4b2b"];
    const id = `element-map-${++diagramId}`;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 520 450"); svg.setAttribute("role","img");
    svg.setAttribute("aria-labelledby",`${id}-title ${id}-desc`);
    svg.classList.add("element-map");
    const ns = "http://www.w3.org/2000/svg";
    const node = (tag, attrs = {}, text) => {
      const el = document.createElementNS(ns,tag);
      Object.entries(attrs).forEach(([key,value]) => el.setAttribute(key,String(value)));
      if (text !== undefined) el.textContent = text;
      return el;
    };
    svg.append(node("title",{id:`${id}-title`},`${detail.label} 的元素计算箭头图`),node("desc",{id:`${id}-desc`},detail.note));
    const defs=node("defs");
    colors.concat("#956514").forEach((color,k) => { const marker=node("marker",{id:`${id}-arrow-${k}`,viewBox:"0 0 10 10",refX:9,refY:5,markerWidth:7,markerHeight:7,orient:"auto-start-reverse"});marker.append(node("path",{d:"M0 0L10 5L0 10Z",fill:color}));defs.append(marker); });
    svg.append(defs);
    const single = !detail.right;
    const centers = {left:single?260:130,right:390,scalar:130};
    const cell = (side,index) => ({x:centers[side]+(index%2?28:-28),y:Math.floor(index/2)?139:85});
    const selected = new Map();
    detail.parts.forEach((part,k) => part.sources.forEach((s) => selected.set(`${s.side}-${s.index}`,k)));
    const drawMatrix = (values,cx,top,side,label,result=false) => {
      svg.append(node("text",{x:cx,y:top-(result?34:50),"text-anchor":"middle",class:"map-label"},label));
      svg.append(node("path",{d:`M${cx-56} ${top-24}h-8v104h8 M${cx+56} ${top-24}h8v104h-8`,stroke:"#233337","stroke-width":2.5,fill:"none"}));
      values.forEach((value,index) => {
        const x=cx+(index%2?28:-28),y=top+Math.floor(index/2)*54;
        const k=selected.get(`${side}-${index}`),active=result?index===detail.target:k!==undefined;
        const color=result?"#956514":colors[k??0];
        svg.append(node("rect",{x:x-24,y:y-22,width:48,height:44,rx:7,fill:active?(result?"#fff0c8":k===0?"#dcefee":"#fae6dc"):"#f4f1e8",stroke:active?color:"#e1ded4","stroke-width":active?2.5:1,...(result?{"data-svg-target":index}:{})}));
        svg.append(node("text",{x,y:y+9,"text-anchor":"middle",class:"map-value",fill:"#17242a",...(result?{"data-svg-target":index}:{})},fmt(value)));
      });
    };
    // Arrows connect each highlighted source cell to its own product/summand.
    detail.parts.forEach((part,k) => {
      const tx=detail.parts.length===1?260:(k===0?145:375);
      part.sources.forEach((s) => {
        const p=s.side==="scalar"?{x:130,y:112}:cell(s.side,s.index);
        const direction=s.index%2?1:-1;
        const path=s.side==="scalar"?`M${p.x} ${p.y+33} C${p.x} 178 ${tx} 175 ${tx} 198`:`M${p.x+direction*25} ${p.y} C${p.x+direction*75} ${p.y} ${p.x+direction*75} 178 ${tx} 198`;
        svg.append(node("path",{d:path,fill:"none",stroke:colors[k],"stroke-width":2.5,"marker-end":`url(#${id}-arrow-${k})`}));
      });
      svg.append(node("rect",{x:tx-(detail.parts.length===1?180:100),y:202,width:detail.parts.length===1?360:200,height:45,rx:9,fill:k===0?"#dcefee":"#fae6dc",stroke:colors[k]}));
      svg.append(node("text",{x:tx,y:231,"text-anchor":"middle",class:detail.operation==="transpose"?"map-label":"map-term",fill:colors[k]},part.text));
      svg.append(node("path",{d:`M${tx} 249 Q${tx} 265 260 270`,fill:"none",stroke:colors[k],"stroke-width":2.5,"marker-end":`url(#${id}-arrow-${k})`}));
    });
    if (detail.left) drawMatrix(detail.left,centers.left,85,"left",detail.leftName);
    else { svg.append(node("circle",{cx:130,cy:110,r:32,fill:"#dcefee",stroke:colors[0],"stroke-width":2}));svg.append(node("text",{x:130,y:120,"text-anchor":"middle",class:"map-value"},"2"),node("text",{x:130,y:36,"text-anchor":"middle",class:"map-label"},"数乘系数")); }
    if (detail.right) { drawMatrix(detail.right,390,85,"right",detail.rightName);svg.append(node("text",{x:260,y:117,"text-anchor":"middle",class:"map-value"},detail.operator)); }
    const equation=detail.parts.length>1?`${detail.parts.map((part)=>factor(part.value)).join(" + ")} = ${fmt(detail.values?detail.values[detail.target]:detail.value)}`:detail.operation==="transpose"?"交换行、列编号":detail.calculation;
    svg.append(node("text",{x:260,y:289,"text-anchor":"middle",class:"map-equation"},equation));
    if (detail.values) {
      const tx=260+(detail.target%2?28:-28),ty=354+Math.floor(detail.target/2)*54;
      const side=detail.target%2?1:-1;
      svg.append(node("path",{d:`M260 298 C${260+side*120} 307 ${260+side*120} ${ty} ${tx+side*27} ${ty}`,fill:"none",stroke:"#956514","stroke-width":2.5,"marker-end":`url(#${id}-arrow-2)`}));
      drawMatrix(detail.values,260,354,"result",`${detail.label} 的结果`,true);
    } else {
      svg.append(node("path",{d:"M260 300V333",stroke:"#956514","stroke-width":2.5,"marker-end":`url(#${id}-arrow-2)`}));
      svg.append(node("rect",{x:190,y:343,width:140,height:65,rx:10,fill:"#fff0c8",stroke:"#956514"}));
      svg.append(node("text",{x:260,y:386,"text-anchor":"middle",class:"map-value"},fmt(detail.value)));
    }
    guide.querySelector("[data-arrow-picture]").replaceChildren(svg);
    svg.addEventListener("click",(event)=>{const cell=event.target.closest("[data-svg-target]");if(cell)guide.querySelector(`[data-output-cell="${cell.dataset.svgTarget}"]`)?.click();});
    guide.querySelector("[data-arrow-note]").textContent=detail.note;
    guide.querySelectorAll("[data-output-cell]").forEach((button) => {button.disabled=!detail.values;button.setAttribute("aria-pressed",String(Boolean(detail.values)&&Number(button.dataset.outputCell)===detail.target));});
  }

  function drawArrow(ctx, point, vector, color, width = 3) {
    const from = point([0, 0]), to = point(vector);
    if (Math.hypot(to.x - from.x, to.y - from.y) < 2) return;
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width;
    ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - 10 * Math.cos(angle - Math.PI / 6), to.y - 10 * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(to.x - 10 * Math.cos(angle + Math.PI / 6), to.y - 10 * Math.sin(angle + Math.PI / 6));
    ctx.closePath(); ctx.fill();
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-matrix-board]").forEach((board) => {
      const fields = [...board.querySelectorAll("[data-bcell]")];
      const result = board.querySelector("[data-board-result]");
      const explain = board.querySelector("[data-board-explain]");
      const guide = board.querySelector("[data-operation-guide]");
      let operation = "sum", target = 0;
      function render() {
        const B = fields.map((field) => Number(field.value));
        if (fields.some((field) => field.value.trim() === "" || !Number.isInteger(Number(field.value)) || Number(field.value) < -3 || Number(field.value) > 3)) {
          result.textContent = "请在四格都输入 −3 到 3 的整数。";
          explain.textContent = "修改数字后会立刻重算；空格不会被悄悄当作 0。";
          if (guide) guide.hidden = true;
          return;
        }
        const detail=operationTrace(A,B,operation,target);
        if (detail.values) result.replaceChildren(document.createTextNode(`${detail.label} = `), matrixNode(detail.values));
        else result.textContent=`tr(B) = ${detail.calculation}`;
        explain.textContent=detail.meaning;
        if (guide) { guide.hidden=false;drawOperationGuide(guide,detail); }
      }
      board.querySelectorAll("[data-op]").forEach((button) => button.addEventListener("click", () => {
        operation = button.dataset.op;
        board.querySelectorAll("[data-op]").forEach((peer) => peer.setAttribute("aria-pressed", String(peer === button)));
        render();
      }));
      fields.forEach((field) => field.addEventListener("input", render));
      board.querySelectorAll("[data-output-cell]").forEach((button)=>button.addEventListener("click",()=>{target=Number(button.dataset.outputCell);render();}));
      board.querySelector("[data-reset-board]")?.addEventListener("click", () => {
        fields.forEach((field, i) => { field.value = [1, 1, 0, 1][i]; });
        render();
      });
      render();
    });

    document.querySelectorAll("[data-matrix-demo]").forEach((demo)=>{
      let operation="AB",target=1;
      const render=()=>drawOperationGuide(demo,operationTrace(A,[1,1,0,1],operation,target));
      demo.querySelectorAll("[data-demo-op]").forEach((button)=>button.addEventListener("click",()=>{
        operation=button.dataset.demoOp;
        demo.querySelectorAll("[data-demo-op]").forEach((peer)=>peer.setAttribute("aria-pressed",String(peer===button)));
        render();
      }));
      demo.querySelectorAll("[data-output-cell]").forEach((button)=>button.addEventListener("click",()=>{target=Number(button.dataset.outputCell);render();}));
      render();
    });

    document.querySelectorAll("[data-column-lab]").forEach((lab) => {
      const canvas = lab.querySelector("[data-output-plane]") || lab.querySelector("canvas");
      const inputCanvas = lab.querySelector("[data-input-plane]");
      const ctx = canvas.getContext("2d");
      const mode = lab.dataset.columnLab;
      const get = (name, fallback = 0) => Number(lab.querySelector(`[data-matrix-value="${name}"]`)?.value ?? fallback);
      let dragView, activeView = null, draggedColumn = null;
      function draw() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = canvas.getBoundingClientRect().width;
        const height = canvas.getBoundingClientRect().height;
        if (!width || !height) return;
        canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const M = [get("a", 2), get("b", 1), get("c", 1), get("d", 2)];
        const input = [get("x", 1), get("y", 1)];
        const collision = collisionExample(M, get("t", 1));
        const output = apply(M, input);
        // Fit the full allowed input range, so moving the input does not move
        // the camera and make an unchanged output appear to change position.
        const coordinates = mode === "rank" ? [-2,2].flatMap((t) => {const demo=collisionExample(M,t);return [...demo.moved,...demo.startOutput,...demo.movedOutput];}) : [-2,2].flatMap((x) => [-2,2].flatMap((y) => apply(M,[x,y])));
        const extent = activeView?.extent ?? Math.max(4, ...M.map(Math.abs), ...coordinates.map(Math.abs)) + 1;
        const origin = { x: width / 2, y: height / 2 + 8 };
        const unit = (Math.min(width, height) - 68) / (2 * extent);
        const point = ([x, y]) => ({ x: origin.x + x * unit, y: origin.y - y * unit });
        dragView = { origin, unit, extent };
        lab.querySelector("[data-current-matrix]")?.replaceChildren(document.createTextNode("M = "),matrixNode(M));
        ctx.clearRect(0, 0, width, height);
        for (let n = -Math.ceil(extent); n <= Math.ceil(extent); n++) {
          ctx.strokeStyle = "#dedbd1"; ctx.lineWidth = 1;
          [[[-extent,n],[extent,n]],[[n,-extent],[n,extent]]].forEach(([start,end]) => {
            const p = point(start), q = point(end);
            ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke();
          });
          ctx.strokeStyle = "rgba(8,108,114,.30)";
          if (Math.abs(n) > 4) continue;
          [[[-5,n],[5,n]],[[n,-5],[n,5]]].forEach(([start,end]) => {
            const p = point(apply(M,start)), q = point(apply(M,end));
            ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke();
          });
        }
        ctx.strokeStyle = "#7a8588"; ctx.lineWidth = 1.5;
        [[[-extent,0],[extent,0]],[[0,-extent],[0,extent]]].forEach(([start,end]) => {
          const p = point(start), q = point(end);
          ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke();
        });
        drawArrow(ctx,point,[M[0],M[2]],"#b7861b",2.5);
        drawArrow(ctx,point,[M[1],M[3]],"#6862a8",2.5);
        ctx.clearRect(0,0,width,34);
        ctx.font = "bold 13px Segoe UI, sans-serif";
        const first = point([M[0],M[2]]), second = point([M[1],M[3]]);
        const sameColumns = M[0] === M[1] && M[2] === M[3];
        ctx.fillStyle = "#80600f"; ctx.fillText(sameColumns ? "第1、2列" : "第1列", sameColumns ? Math.max(8,first.x-75) : first.x+9, first.y+20);
        if (!sameColumns) { ctx.fillStyle = "#514b8a"; ctx.fillText("第2列", Math.max(8,second.x - 65), second.y - 12); }
        ctx.fillStyle = "#465457";
        ctx.fillText(mode === "rank" ? "输出平面：所有箭头经过 M 之后" : "原网格与变换后网格（叠放比较）", 12, 23);
        ctx.fillText("0", origin.x - 12, origin.y + 15);
        ctx.fillText("1", origin.x + unit - 3, origin.y + 15);
        if (mode === "transform") {
          drawArrow(ctx,point,input,"#086c72",3);
          drawArrow(ctx,point,apply(M,input),"#c35c3a",3.5);
          lab.querySelector("[data-readout]").textContent = `第 1 列 T(e₁)=${pair([M[0],M[2]])}；第 2 列 T(e₂)=${pair([M[1],M[3]])}；T${pair(input)}=${pair(output)}。移动输入时刻度固定；换矩阵时自动调整视野，0→1 始终是一个单位。`;
        } else {
          const r = rank(M);
          const note = r === 2 ? "秩 2：输出覆盖平面；零空间只有零向量。t≠0 时，两输入的输出不同。" : r === 1 ? `秩 1：输出沿一条线；n=${pair(collision.direction)} 是零空间中的非零方向。沿 n 移动，输出不动。` : "秩 0：输出只有原点；整个输入平面都是零空间，不只图中那一条线。";
          drawArrow(ctx, point, collision.startOutput, "#086c72", 5);
          drawArrow(ctx, point, collision.movedOutput, "#c35c3a", 2.5);
          const fixedTarget = point(collision.startOutput);
          const sameOutputs = collision.startOutput.every((value,i) => value === collision.movedOutput[i]);
          if (!sameOutputs) { ctx.fillStyle="#086c72";ctx.fillText("Mu",fixedTarget.x+9,fixedTarget.y-12); }
          const target = point(collision.movedOutput);
          ctx.fillStyle = "#c35c3a"; ctx.beginPath(); ctx.arc(target.x,target.y,4,0,Math.PI*2); ctx.fill();
          ctx.fillText(sameOutputs ? "Mu=Mv" : "Mv", target.x + 9, target.y - 12);
          lab.querySelector("[data-readout]").textContent = `${note} 输入 u=${pair(collision.start)}、v=${pair(collision.moved)}；Mu=${pair(collision.startOutput)}，Mv=${pair(collision.movedOutput)}。`;
          if (inputCanvas) {
            const inputCtx = inputCanvas.getContext("2d");
            inputCanvas.width = Math.round(width*dpr); inputCanvas.height = Math.round(height*dpr);
            inputCtx.setTransform(dpr,0,0,dpr,0,0);
            inputCtx.clearRect(0,0,width,height);
            if (r === 0) { inputCtx.fillStyle="rgba(8,108,114,.09)";inputCtx.fillRect(0,34,width,height-34); }
            inputCtx.strokeStyle = "#dedbd1"; inputCtx.lineWidth = 1;
            for (let n=-Math.ceil(extent); n<=Math.ceil(extent); n++) {
              [[[-extent,n],[extent,n]],[[n,-extent],[n,extent]]].forEach(([a,b]) => {
                const p=point(a),q=point(b); inputCtx.beginPath(); inputCtx.moveTo(p.x,p.y); inputCtx.lineTo(q.x,q.y); inputCtx.stroke();
              });
            }
            inputCtx.strokeStyle="#7a8588";
            [[[-extent,0],[extent,0]],[[0,-extent],[0,extent]]].forEach(([a,b]) => {const p=point(a),q=point(b);inputCtx.beginPath();inputCtx.moveTo(p.x,p.y);inputCtx.lineTo(q.x,q.y);inputCtx.stroke();});
            if (r < 2) {
              if (r === 1) {
                const a=point(scale(collision.direction,-extent)),b=point(scale(collision.direction,extent));
                inputCtx.setLineDash([5,5]);inputCtx.strokeStyle="#086c72";inputCtx.lineWidth=2;
                inputCtx.beginPath();inputCtx.moveTo(a.x,a.y);inputCtx.lineTo(b.x,b.y);inputCtx.stroke();
              }
              const p=point(add(collision.start,scale(collision.direction,-extent))),q=point(add(collision.start,scale(collision.direction,extent)));
              inputCtx.setLineDash([5,5]); inputCtx.strokeStyle="#6862a8";inputCtx.beginPath();inputCtx.moveTo(p.x,p.y);inputCtx.lineTo(q.x,q.y);inputCtx.stroke();inputCtx.setLineDash([]);
            }
            drawArrow(inputCtx,point,collision.start,"#086c72",5);
            drawArrow(inputCtx,point,collision.moved,"#c35c3a",2.5);
            inputCtx.clearRect(0,0,width,34);
            inputCtx.font="bold 13px Segoe UI, sans-serif";inputCtx.fillStyle="#465457";
            inputCtx.fillText("输入平面：u 固定，v 随 t 移动",12,23);
            inputCtx.fillText("0",origin.x-12,origin.y+15);inputCtx.fillText("1",origin.x+unit-3,origin.y+15);
            const u=point(collision.start),v=point(collision.moved);
            inputCtx.fillStyle="#086c72";inputCtx.fillText("u",u.x+7,u.y+17);
            inputCtx.fillStyle="#c35c3a";inputCtx.fillText("v",v.x+7,v.y-8);
          }
        }
        lab.querySelectorAll("[data-number]").forEach((node) => { node.textContent = fmt(get(node.dataset.number)); });
      }
      lab.querySelectorAll("[data-matrix-value]").forEach((input) => input.addEventListener("input", () => {
        if (["a","b","c","d"].includes(input.dataset.matrixValue)) lab.querySelectorAll("[data-preset]").forEach((peer) => peer.setAttribute("aria-pressed", "false"));
        draw();
      }));
      canvas.addEventListener("pointerdown", (event) => {
        const rect = canvas.getBoundingClientRect();
        const { origin, unit } = dragView;
        const endpoints = [[get("a"),get("c")],[get("b"),get("d")]].map(([x,y]) => ({x:origin.x+x*unit,y:origin.y-y*unit}));
        const distances = endpoints.map((p) => Math.hypot(event.clientX-rect.left-p.x,event.clientY-rect.top-p.y));
        draggedColumn = Math.min(...distances) <= 28 ? (distances[0] <= distances[1] ? 0 : 1) : null;
        if (draggedColumn !== null) { activeView = dragView; canvas.setPointerCapture(event.pointerId); }
      });
      canvas.addEventListener("pointermove", (event) => {
        if (draggedColumn === null) return;
        const rect = canvas.getBoundingClientRect();
        const { origin, unit } = activeView;
        const x = Math.max(-3, Math.min(3, Math.round((event.clientX-rect.left-origin.x)/unit)));
        const y = Math.max(-3, Math.min(3, Math.round((origin.y-(event.clientY-rect.top))/unit)));
        const names = draggedColumn === 0 ? ["a","c"] : ["b","d"];
        lab.querySelector(`[data-matrix-value="${names[0]}"]`).value = x;
        lab.querySelector(`[data-matrix-value="${names[1]}"]`).value = y;
        lab.querySelectorAll("[data-preset]").forEach((peer) => peer.setAttribute("aria-pressed", "false"));
        draw();
      });
      const finishDrag = () => { draggedColumn = null; activeView = null; draw(); };
      canvas.addEventListener("pointerup", finishDrag);
      canvas.addEventListener("pointercancel", finishDrag);
      lab.querySelectorAll("[data-preset]").forEach((button) => button.addEventListener("click", () => {
        const values = button.dataset.preset.split(",").map(Number);
        ["a","b","c","d"].forEach((name, i) => { lab.querySelector(`[data-matrix-value="${name}"]`).value = values[i]; });
        lab.querySelectorAll("[data-preset]").forEach((peer) => peer.setAttribute("aria-pressed", String(peer === button)));
        draw();
      }));
      new ResizeObserver(draw).observe(canvas);
      draw();
    });

    document.querySelectorAll("[data-row-stepper]").forEach((stepper) => {
      const steps = [
        { title: "原方程组", rows: [[2,1,5],[1,2,4]], note: "两行分别是 2x+y=5 与 x+2y=4。竖线左边是系数，右边是目标。" },
        { title: "交换两行：R₁ ↔ R₂", rows: [[1,2,4],[2,1,5]], note: "只是改变书写顺序；同时满足两条方程的 (x,y) 不会变。" },
        { title: "第二行减第一行的 2 倍：R₂ ← R₂−2R₁", rows: [[1,2,4],[0,-3,-3]], note: "第二行变成 −3y=−3，所以 y=1。整行都要操作，包括竖线右边。" },
        { title: "第二行除以 −3：R₂ ← R₂/(−3)", rows: [[1,2,4],[0,1,1]], note: "非零倍数缩放整行不会改变解；现在第二行直接读出 y=1。" },
        { title: "第一行减第二行的 2 倍：R₁ ← R₁−2R₂", rows: [[1,0,2],[0,1,1]], note: "最后读出 x=2、y=1。左边变成单位矩阵，右边就是唯一解。" }
      ];
      let index = 0;
      const rows = stepper.querySelector("[data-step-matrix]");
      function show() {
        const step = steps[index];
        stepper.querySelector("[data-step-index]").textContent = `第 ${index + 1} / ${steps.length} 步`;
        stepper.querySelector("[data-step-title]").textContent = step.title;
        stepper.querySelector("[data-step-note]").textContent = step.note;
        rows.replaceChildren();
        step.rows.flat().forEach((value) => {
          const cell = document.createElement("span"); cell.textContent = String(value); rows.append(cell);
        });
        stepper.querySelector("[data-prev]").disabled = index === 0;
        stepper.querySelector("[data-next]").disabled = index === steps.length - 1;
      }
      stepper.querySelector("[data-prev]").addEventListener("click", () => { index--; show(); });
      stepper.querySelector("[data-next]").addEventListener("click", () => { index++; show(); });
      show();
    });
  });
})();
