document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-reflection]").forEach(box => {
    const input = box.querySelector("textarea");
    const status = box.querySelector("[data-reflection-status]");
    box.querySelector("[data-copy-response]")?.addEventListener("click", async () => {
      if (!input.value.trim()) { status.textContent = "先写下你的推导或卡住的地方，再复制。这里不会自动批改。"; input.focus(); return; }
      const text = document.title + "\n" + box.dataset.exerciseId + "\n" + input.value.trim();
      try {
        await navigator.clipboard.writeText(text);
        status.textContent = "已复制。请自行粘贴到教师对话；尚未发送，也未自动判断对错。";
      } catch {
        input.focus(); input.select();
        status.textContent = "无法自动复制，已选中回答；请使用浏览器的复制功能。回答未发送。";
      }
    });
  });
});
