document.addEventListener("DOMContentLoaded", () => {
  const progressKey = "intro-linear-algebra-progress-v1";
  const loadProgress = () => {
    try { return JSON.parse(localStorage.getItem(progressKey) || "[]"); }
    catch { return []; }
  };
  const saveProgress = (items) => localStorage.setItem(progressKey, JSON.stringify(items));

  function renderProgress() {
    const completed = loadProgress();
    document.querySelectorAll("[data-course-progress]").forEach((node) => {
      node.textContent = `${completed.length} / ${node.dataset.total || 4} 节已完成（本设备）`;
    });
    document.querySelectorAll("[data-lesson-id]").forEach((card) => {
      const done = completed.includes(card.dataset.lessonId);
      card.classList.toggle("completed", done);
      const status = card.querySelector("[data-lesson-status]");
      if (status) status.textContent = done ? "已完成" : "可直接开始";
    });
    document.querySelectorAll("button[data-complete-lesson]").forEach((button) => {
      const done = completed.includes(button.dataset.completeLesson);
      button.textContent = done ? "取消完成标记" : "标记本课已完成";
      button.setAttribute("aria-pressed", String(done));
      const status = button.parentElement.querySelector("[data-completion-status]");
      if (status) status.textContent = done ? "已保存在当前浏览器；可以随时取消。" : "可选：只记录本设备，不影响其他课程。";
    });
  }

  document.querySelectorAll("[data-quiz]").forEach((quiz) => {
    const feedback = quiz.querySelector("[data-feedback-output]");
    quiz.querySelectorAll("button[data-answer]").forEach((button) => {
      button.addEventListener("click", () => {
        quiz.querySelectorAll("button[data-answer]").forEach((peer) => peer.setAttribute("aria-pressed", "false"));
        button.setAttribute("aria-pressed", "true");
        const correct = button.dataset.answer === "correct";
        feedback.textContent = button.dataset.message || (correct ? "正确。" : "再想一步。");
        feedback.className = `feedback ${correct ? "correct" : "incorrect"}`;
      });
    });
  });

  document.querySelectorAll("button[data-reveal-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.querySelector(button.dataset.revealTarget);
      if (!target) return;
      const visible = target.classList.toggle("visible");
      button.setAttribute("aria-expanded", String(visible));
      button.textContent = visible ? "收起解析" : "查看解析";
    });
  });

  document.querySelectorAll("button[data-complete-lesson]").forEach((button) => {
    button.addEventListener("click", () => {
      const completed = loadProgress();
      const id = button.dataset.completeLesson;
      saveProgress(completed.includes(id) ? completed.filter((item) => item !== id) : [...completed, id]);
      renderProgress();
    });
  });
  renderProgress();
});
