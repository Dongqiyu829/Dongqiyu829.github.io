document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-work-sum-lab]").forEach(lab => {
    let n = 8, i = 1, total = 0, rounds = 0;
    const rows = lab.querySelector("[data-sum-rows]");
    const next = lab.querySelector("[data-sum-next]");
    const feedback = lab.querySelector("[data-sum-feedback]");
    function render() {
      const done = i > n;
      lab.dataset.n = String(n); lab.dataset.total = String(total);
      lab.dataset.rounds = String(rounds); lab.dataset.done = String(done);
      lab.querySelector("[data-sum-state]").textContent = `n=${n}；已执行 ${rounds} 轮，累计 ${total} 次。` + (done ? "循环结束。" : `下一轮 i=${i}。`);
      next.disabled = done;
    }
    function reset() {
      i = 1; total = 0; rounds = 0; rows.replaceChildren();
      feedback.textContent = n === 0 ? "初始 i=1 已超过 n=0，因此没有任何一轮，work 共 0 次。" : "先预测下一轮的次数。点击一次，只加入一轮的实际工作量。";
      render();
    }
    next.addEventListener("click", () => {
      if (i > n) return;
      const current = i;
      total += current; rounds++;
      const row = document.createElement("li"); row.className = "sum-row";
      const label = document.createElement("span"); label.textContent = `i=${current}`;
      const track = document.createElement("div"); track.className = "sum-track";
      const bar = document.createElement("div"); bar.className = "sum-bar"; bar.style.width = `${100 * current / Math.max(n, 1)}%`;
      track.setAttribute("aria-hidden", "true"); track.append(bar);
      const count = document.createElement("span"); count.textContent = `${current} 次`;
      row.append(label, track, count); rows.append(row);
      i *= 2;
      feedback.textContent = `这一轮做 ${current} 次，累计 ${total} 次。` + (i > n ? `下一轮 i=${i}>${n}，停止。总和是各轮相加，而不是把每轮都当成 ${n} 次。` : `下一轮 i 翻倍成 ${i}。`);
      render();
    });
    lab.querySelectorAll("[data-sum-size]").forEach(button => button.addEventListener("click", () => {
      n = Number(button.dataset.sumSize);
      lab.querySelectorAll("[data-sum-size]").forEach(peer => peer.setAttribute("aria-pressed", String(peer === button)));
      reset();
    }));
    lab.querySelector("[data-sum-reset]").addEventListener("click", reset);
    reset();
  });
});
