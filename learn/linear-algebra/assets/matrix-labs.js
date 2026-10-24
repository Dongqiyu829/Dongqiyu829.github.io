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
  const core = { add, scale, transpose, multiply, apply, rank, nullVector };
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
      let operation = "AB";
      function render() {
        const B = fields.map((field) => Number(field.value));
        if (fields.some((field) => field.value.trim() === "" || !Number.isInteger(Number(field.value)) || Number(field.value) < -3 || Number(field.value) > 3)) {
          result.textContent = "请在四格都输入 −3 到 3 的整数。";
          explain.textContent = "修改数字后会立刻重算；空格不会被悄悄当作 0。";
          return;
        }
        let values, label, note;
        switch (operation) {
          case "sum": values = add(A, B); label = "A + B = "; note = "只有同样大小的矩阵才能相加；四个位置分别相加。"; break;
          case "double": values = scale(B, 2); label = "2B = "; note = "数乘让 B 的每一格都乘 2，不只乘某一行。"; break;
          case "transpose": values = transpose(B); label = "Bᵀ = "; note = "转置把行变成列：左上与右下不动，右上与左下交换。"; break;
          case "BA": values = multiply(B, A); label = "BA = "; note = `先 A 后 B。左上格 = ${B[0]}×2 + ${B[1]}×1 = ${fmt(values[0])}。右边的 A 先作用。`; break;
          case "identity": values = multiply([1, 0, 0, 1], B); label = "IB = "; note = "I 是单位矩阵；乘它不改变 B，就像数字乘 1。"; break;
          case "trace": result.textContent = `tr(B) = ${fmt(B[0])} + ${fmt(B[3])} = ${fmt(B[0] + B[3])}`; explain.textContent = "迹只对方阵定义：主对角线从左上到右下。本课只学怎样计算它，不谈特征值。"; return;
          default: values = multiply(A, B); label = "AB = "; note = `先 B 后 A。左上格 = 2×${B[0]} + 1×${B[2]} = ${fmt(values[0])}。每一列也是 A 作用于 B 对应的列。`;
        }
        result.replaceChildren(document.createTextNode(label), matrixNode(values));
        explain.textContent = note;
      }
      board.querySelectorAll("[data-op]").forEach((button) => button.addEventListener("click", () => {
        operation = button.dataset.op;
        board.querySelectorAll("[data-op]").forEach((peer) => peer.setAttribute("aria-pressed", String(peer === button)));
        render();
      }));
      fields.forEach((field) => field.addEventListener("input", render));
      render();
    });

    document.querySelectorAll("[data-column-lab]").forEach((lab) => {
      const canvas = lab.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      const mode = lab.dataset.columnLab;
      const get = (name, fallback = 0) => Number(lab.querySelector(`[data-matrix-value="${name}"]`)?.value ?? fallback);
      function draw() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = canvas.getBoundingClientRect().width;
        const height = canvas.getBoundingClientRect().height;
        if (!width || !height) return;
        canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const origin = { x: width / 2, y: height / 2 };
        const unit = Math.min(width, height) / 12;
        const point = ([x, y]) => ({ x: origin.x + x * unit, y: origin.y - y * unit });
        const M = [get("a", 2), get("b", 1), get("c", 1), get("d", 2)];
        const input = [get("x", 1), get("y", 1)];
        ctx.clearRect(0, 0, width, height);
        for (let n = -5; n <= 5; n++) {
          ctx.strokeStyle = "#dedbd1"; ctx.lineWidth = 1;
          [[[-5,n],[5,n]],[[n,-5],[n,5]]].forEach(([start,end]) => {
            const p = point(start), q = point(end);
            ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke();
          });
          ctx.strokeStyle = "rgba(8,108,114,.30)";
          [[[-5,n],[5,n]],[[n,-5],[n,5]]].forEach(([start,end]) => {
            const p = point(apply(M,start)), q = point(apply(M,end));
            ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke();
          });
        }
        ctx.strokeStyle = "#7a8588"; ctx.lineWidth = 1.5;
        [[[-5,0],[5,0]],[[0,-5],[0,5]]].forEach(([start,end]) => {
          const p = point(start), q = point(end);
          ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke();
        });
        drawArrow(ctx,point,[M[0],M[2]],"#b7861b",2.5);
        drawArrow(ctx,point,[M[1],M[3]],"#6862a8",2.5);
        ctx.font = "bold 13px Segoe UI, sans-serif";
        const first = point([M[0],M[2]]), second = point([M[1],M[3]]);
        ctx.fillStyle = "#80600f"; ctx.fillText("第1列", first.x + 7, first.y - 7);
        ctx.fillStyle = "#514b8a"; ctx.fillText("第2列", second.x + 7, second.y + 15);
        if (mode === "transform") {
          drawArrow(ctx,point,input,"#086c72",3);
          drawArrow(ctx,point,apply(M,input),"#c35c3a",3.5);
          lab.querySelector("[data-readout]").textContent = `第 1 列 T(e₁)=${pair([M[0],M[2]])}；第 2 列 T(e₂)=${pair([M[1],M[3]])}；T${pair(input)}=${pair(apply(M,input))}。`;
        } else {
          const r = rank(M), kernel = nullVector(M);
          if (kernel) drawArrow(ctx,point,kernel,"#086c72",3);
          lab.querySelector("[data-readout]").textContent = r === 2 ? "秩 2：输出能覆盖整个平面；零输出只有零输入。" : r === 1 ? `秩 1：所有输出沿一条线；非零输入 ${pair(kernel)} 被送到 (0, 0)。` : "秩 0：整个平面都被压成 (0, 0)；每个输入都在零空间。";
        }
        lab.querySelectorAll("[data-number]").forEach((node) => { node.textContent = fmt(get(node.dataset.number)); });
      }
      lab.querySelectorAll("[data-matrix-value]").forEach((input) => input.addEventListener("input", () => {
        lab.querySelectorAll("[data-preset]").forEach((peer) => peer.setAttribute("aria-pressed", "false"));
        draw();
      }));
      let draggedColumn = null;
      canvas.addEventListener("pointerdown", (event) => {
        const rect = canvas.getBoundingClientRect();
        const unit = Math.min(rect.width, rect.height) / 12;
        const endpoints = [[get("a"),get("c")],[get("b"),get("d")]].map(([x,y]) => ({x:rect.width/2+x*unit,y:rect.height/2-y*unit}));
        const distances = endpoints.map((p) => Math.hypot(event.clientX-rect.left-p.x,event.clientY-rect.top-p.y));
        draggedColumn = Math.min(...distances) <= 28 ? (distances[0] <= distances[1] ? 0 : 1) : null;
        if (draggedColumn !== null) canvas.setPointerCapture(event.pointerId);
      });
      canvas.addEventListener("pointermove", (event) => {
        if (draggedColumn === null) return;
        const rect = canvas.getBoundingClientRect();
        const unit = Math.min(rect.width, rect.height) / 12;
        const x = Math.max(-3, Math.min(3, Math.round((event.clientX-rect.left-rect.width/2)/unit)));
        const y = Math.max(-3, Math.min(3, Math.round((rect.height/2-(event.clientY-rect.top))/unit)));
        const names = draggedColumn === 0 ? ["a","c"] : ["b","d"];
        lab.querySelector(`[data-matrix-value="${names[0]}"]`).value = x;
        lab.querySelector(`[data-matrix-value="${names[1]}"]`).value = y;
        lab.querySelectorAll("[data-preset]").forEach((peer) => peer.setAttribute("aria-pressed", "false"));
        draw();
      });
      canvas.addEventListener("pointerup", () => { draggedColumn = null; });
      canvas.addEventListener("pointercancel", () => { draggedColumn = null; });
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
