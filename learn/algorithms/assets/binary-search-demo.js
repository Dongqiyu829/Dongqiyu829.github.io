document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-binary-demo]").forEach(demo => {
    const cases = {
      duplicate: { a: [1, 2, 2, 4, 7], x: 2 },
      missing: { a: [1, 2, 2, 4, 7], x: 3 },
      below: { a: [1, 2, 2, 4, 7], x: 0 },
      above: { a: [1, 2, 2, 4, 7], x: 9 },
      empty: { a: [], x: 2 }
    };
    let selected = "duplicate", lo = 0, hi = 5, step = 0;
    const array = demo.querySelector("[data-demo-array]");
    const state = demo.querySelector("[data-demo-state]");
    const explanation = demo.querySelector("[data-demo-explanation]");
    const history = demo.querySelector("[data-demo-history]");
    const next = demo.querySelector("[data-demo-next]");
    function render() {
      const { a, x } = cases[selected];
      const done = lo === hi;
      const mid = done ? null : lo + Math.floor((hi - lo) / 2);
      demo.dataset.lo = String(lo);
      demo.dataset.hi = String(hi);
      demo.dataset.steps = String(step);
      demo.dataset.done = String(done);
      demo.querySelector("[data-demo-target]").textContent = `a = [${a.join(", ")}]，x = ${x}。找第一个 ≥ ${x} 的位置。`;
      array.replaceChildren();
      for (let i = 0; i <= a.length; i++) {
        const cell = document.createElement("li");
        cell.dataset.index = String(i);
        cell.className = "demo-cell";
        if (i === a.length) cell.classList.add("sentinel");
        else if (i < lo) cell.classList.add("known-small");
        else if (i >= hi) cell.classList.add("known-large");
        if (i === mid) cell.classList.add("is-mid");
        if (done && i === lo) cell.classList.add("is-answer");
        const index = document.createElement("span");
        index.textContent = i === a.length ? `n=${i}` : `下标 ${i}`;
        const value = document.createElement("strong");
        value.textContent = i === a.length ? "∅" : String(a[i]);
        const label = document.createElement("small");
        label.textContent = i === a.length ? "末尾位置 · 没有元素" : i < lo ? "已知 < x" : i >= hi ? "已知 ≥ x" : "待判断";
        if (i === mid) label.textContent += " · mid";
        if (done && i === lo) label.textContent += " · 答案";
        cell.append(index, value, label);
        array.append(cell);
      }
      next.disabled = done;
      state.textContent = done
        ? `lo = hi = ${lo}，待判断元素 0 个。返回 ${lo}。`
        : `lo = ${lo}，hi = ${hi}；待判断 ${hi - lo} 个。下一次 mid = ${mid}。`;
    }
    function reset() {
      lo = 0; hi = cases[selected].a.length; step = 0;
      history.replaceChildren();
      explanation.textContent = hi === 0
        ? "空数组：一开始 lo=hi=0，不取 mid、不读取任何元素，直接返回 0。"
        : "还没有比较。先看 mid 的值，预测这一步应该改哪个边界，再点“走一步”。";
      render();
    }
    next.addEventListener("click", () => {
      if (lo >= hi) return;
      const { a, x } = cases[selected];
      const mid = lo + Math.floor((hi - lo) / 2);
      let reason;
      if (a[mid] < x) {
        lo = mid + 1;
        reason = `mid=${mid}，a[${mid}]=${a[mid]} < ${x}。直到下标 ${mid} 都太小，令 lo=${lo}。`;
      } else {
        hi = mid;
        reason = `mid=${mid}，a[${mid}]=${a[mid]} ≥ ${x}。从下标 ${mid} 起都够大，令 hi=${hi}；${mid} 仍可能是答案。`;
      }
      step++;
      const item = document.createElement("li");
      item.textContent = reason;
      history.append(item);
      explanation.textContent = `第 ${step} 步：${reason}` + (lo === hi
        ? lo === a.length ? ` 两个边界相遇，所有元素都小于 ${x}，返回 n=${lo}，不读取 a[n]。`
          : ` 两个边界相遇：${lo} 左边都太小，从 ${lo} 起都够大，所以答案是 ${lo}。`
        : " 继续判断缩小后的区间。");
      render();
    });
    demo.querySelectorAll("[data-case]").forEach(button => button.addEventListener("click", () => {
      selected = button.dataset.case;
      demo.querySelectorAll("[data-case]").forEach(peer => peer.setAttribute("aria-pressed", String(peer === button)));
      reset();
    }));
    demo.querySelector("[data-demo-reset]").addEventListener("click", reset);
    reset();
  });
});
