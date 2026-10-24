document.addEventListener("DOMContentLoaded", () => {
  const colors = { grid: "#d9d6cc", axis: "#7a8588", input: "#086c72", output: "#c35c3a", basis: "#b7861b", ghost: "rgba(8,108,114,.18)" };
  const arrow = (ctx, from, to, color, width = 3) => {
    if (Math.hypot(to.x-from.x,to.y-from.y) < 1) {
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(from.x,from.y,3,0,Math.PI*2); ctx.fill();
      return;
    }
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width;
    ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - 11 * Math.cos(angle - Math.PI / 6), to.y - 11 * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(to.x - 11 * Math.cos(angle + Math.PI / 6), to.y - 11 * Math.sin(angle + Math.PI / 6));
    ctx.closePath(); ctx.fill();
  };
  const val = (lab, name, fallback = 0) => Number(lab.querySelector(`[data-value="${name}"]`)?.value ?? fallback);
  const label = (n) => Number.isInteger(n) ? String(n) : n.toFixed(1);

  document.querySelectorAll("[data-vector-lab]").forEach((lab) => {
    const canvas = lab.querySelector("canvas");
    const readout = lab.querySelector("[data-readout]");
    const ctx = canvas.getContext("2d");
    const mode = lab.dataset.vectorLab;

    function draw() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(320, Math.floor(rect.width * dpr));
      canvas.height = Math.floor(Math.max(330, rect.height) * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const w = canvas.width / dpr, h = canvas.height / dpr;
      const extent = 7;
      const scale = Math.min(w, h) / (extent * 2);
      const origin = { x: w / 2, y: h / 2 };
      const point = ([x, y]) => ({ x: origin.x + x * scale, y: origin.y - y * scale });
      ctx.clearRect(0, 0, w, h);

      const transformGrid = mode === "transform";
      if (transformGrid) {
        for (let k = -extent; k <= extent; k++) {
          const a = [2 * -extent + k, -extent + 2 * k], b = [2 * extent + k, extent + 2 * k];
          const c = [2 * k - extent, k - 2 * extent], d = [2 * k + extent, k + 2 * extent];
          ctx.strokeStyle = colors.ghost; ctx.lineWidth = 1;
          ctx.beginPath(); let p = point(a); ctx.moveTo(p.x,p.y); p=point(b); ctx.lineTo(p.x,p.y); ctx.stroke();
          ctx.beginPath(); p=point(c); ctx.moveTo(p.x,p.y); p=point(d); ctx.lineTo(p.x,p.y); ctx.stroke();
        }
      } else {
        ctx.strokeStyle = colors.grid; ctx.lineWidth = 1;
        for (let k = -extent; k <= extent; k++) {
          let p = point([k,-extent]), q = point([k,extent]); ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke();
          p = point([-extent,k]); q = point([extent,k]); ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke();
        }
      }
      ctx.strokeStyle = colors.axis; ctx.lineWidth = 1.5;
      let p = point([-extent,0]), q = point([extent,0]); ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke();
      p = point([0,-extent]); q = point([0,extent]); ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke();

      const x = val(lab,"x",1), y = val(lab,"y",1);
      if (mode === "sum") {
        const u = [x,y], v = [val(lab,"vx",1), val(lab,"vy",2)], s = [u[0]+v[0],u[1]+v[1]];
        arrow(ctx, point([0,0]), point(u), colors.input);
        arrow(ctx, point(u), point(s), colors.basis, 2.5);
        arrow(ctx, point([0,0]), point(s), colors.output);
        readout.textContent = `u=(${label(u[0])}, ${label(u[1])}), v=(${label(v[0])}, ${label(v[1])}) → u+v=(${label(s[0])}, ${label(s[1])})`;
      } else if (mode === "transform") {
        const out = [2*x+y, x+2*y];
        arrow(ctx, point([0,0]), point([x,y]), colors.input);
        arrow(ctx, point([0,0]), point(out), colors.output);
        readout.textContent = `x=(${label(x)}, ${label(y)}) → Ax=(${label(out[0])}, ${label(out[1])})`;
      } else if (mode === "composition") {
        const k = val(lab,"k",1);
        const afterA = [2*x+y, x+2*y];
        const afterB = [x+k*y, y];
        const aThenB = [afterA[0]+k*afterA[1], afterA[1]];
        const bThenA = [2*afterB[0]+afterB[1], afterB[0]+2*afterB[1]];
        ctx.setLineDash([5,5]);
        ctx.lineWidth = 2;
        [[afterA,aThenB,colors.basis],[afterB,bThenA,colors.output]].forEach(([from,to,color]) => {
          const p = point(from), q = point(to);
          ctx.strokeStyle = color;
          ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke();
        });
        ctx.setLineDash([]);
        arrow(ctx, point([0,0]), point([x,y]), colors.input, 2.5);
        arrow(ctx, point([0,0]), point(aThenB), colors.basis, 3);
        arrow(ctx, point([0,0]), point(bThenA), colors.output, 3);
        readout.textContent = `先 A 后 B：(${label(aThenB[0])}, ${label(aThenB[1])})；先 B 后 A：(${label(bThenA[0])}, ${label(bThenA[1])})。${aThenB[0] === bThenA[0] && aThenB[1] === bThenA[1] ? "这次重合。" : "这次不重合。"}`;
      } else if (mode === "span") {
        const a = val(lab,"a",1), b = val(lab,"b",1);
        const e1 = [1,1], e2 = [1,-1], s = [a+b,a-b];
        arrow(ctx, point([0,0]), point([a,a]), colors.input, 2.5);
        arrow(ctx, point([a,a]), point(s), colors.basis, 2.5);
        arrow(ctx, point([0,0]), point(s), colors.output);
        readout.textContent = `${label(a)}(1,1)+${label(b)}(1,−1)=(${label(s[0])}, ${label(s[1])})`;
      }
      lab.querySelectorAll("[data-number]").forEach((node) => { node.textContent = label(val(lab,node.dataset.number)); });
    }
    lab.querySelectorAll("input").forEach((input) => input.addEventListener("input", draw));
    new ResizeObserver(draw).observe(canvas);
    draw();
  });
});
