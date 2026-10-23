document.addEventListener("DOMContentLoaded", () => {
  const lab = document.querySelector("[data-complexity-lab]");
  if (!lab) return;

  const buttons = Array.from(lab.querySelectorAll("button[data-size]"));
  const geometricCount = lab.querySelector("[data-geometric-count]");
  const triangularCount = lab.querySelector("[data-triangular-count]");
  const geometricBar = lab.querySelector("[data-geometric-bar]");
  const triangularBar = lab.querySelector("[data-triangular-bar]");
  const caption = lab.querySelector("[data-lab-caption]");

  function render(n) {
    if (![8, 16, 32, 64].includes(n)) return;

    // Count work() rather than wall-clock time; n is a power of 2.
    let geometric = 0;
    for (let i = 1; i < n; i *= 2) geometric += i;

    let triangular = 0;
    for (let i = 1; i <= n; i++) triangular += i;

    geometricCount.textContent = geometric.toLocaleString("zh-CN");
    triangularCount.textContent = triangular.toLocaleString("zh-CN");
    geometricBar.style.width = (100 * geometric / triangular).toFixed(2) + "%";
    triangularBar.style.width = "100%";
    caption.textContent = "n=" + n + "：倍增版 " + geometric +
      " 次（n−1）；逐行版 " + triangular +
      " 次（n(n+1)/2）。这里只统计 work()，不是完整的运行时间。";
    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String(Number(button.dataset.size) === n));
    });
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => render(Number(button.dataset.size)));
  });
  render(16);
});
