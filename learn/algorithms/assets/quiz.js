document.addEventListener("DOMContentLoaded", () => {
  const progressKey = "comp3711h-learning-progress-v1";
  const loadProgress = () => {
    try {
      return JSON.parse(localStorage.getItem(progressKey) || "[]");
    } catch {
      return [];
    }
  };
  const saveProgress = (items) => localStorage.setItem(progressKey, JSON.stringify(items));
  const renderProgress = () => {
    const completed = loadProgress();
    document.querySelectorAll("[data-course-progress]").forEach((node) => {
      node.textContent = `${completed.length} / 23 已完成`;
    });
    document.querySelectorAll("[data-lesson-id]").forEach((card) => {
      const done = completed.includes(card.dataset.lessonId);
      card.classList.toggle("completed", done);
      const status = card.querySelector("[data-lesson-status]");
      if (status) status.textContent = done ? "已完成" : "可开始";
    });
    document.querySelectorAll("button[data-complete-lesson]").forEach((button) => {
      const done = completed.includes(button.dataset.completeLesson);
      button.textContent = done ? "取消完成标记" : "标记本课已完成";
      button.setAttribute("aria-pressed", String(done));
      const status = document.querySelector("[data-completion-status]");
      if (status) status.textContent = done ? "本设备已记录完成；可随时取消标记。" : "自愿标记进度；无需完成互动即可访问其他课程。";
    });
  };

  document.querySelectorAll("[data-quiz]").forEach((quiz) => {
    const feedback = quiz.querySelector("[data-feedback-output]");
    quiz.querySelectorAll("button[data-answer]").forEach((button) => {
      button.addEventListener("click", () => {
        quiz.querySelectorAll("button[data-answer]").forEach((peer) => {
          peer.setAttribute("aria-pressed", "false");
        });
        button.setAttribute("aria-pressed", "true");
        const isCorrect = button.dataset.answer === "correct";
        feedback.textContent = button.dataset.message;
        feedback.className = `feedback ${isCorrect ? "correct" : "incorrect"}`;
      });
    });
  });

  document.querySelectorAll("button[data-reveal-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.querySelector(button.dataset.revealTarget);
      const visible = target.classList.toggle("visible");
      button.setAttribute("aria-expanded", String(visible));
      button.textContent = visible ? "收起参考" : "查看参考";
    });
  });

  document.querySelectorAll("button[data-complete-lesson]").forEach((button) => {
    button.addEventListener("click", () => {
      const completed = loadProgress();
      const id = button.dataset.completeLesson;
      const next = completed.includes(id)
        ? completed.filter((item) => item !== id)
        : [...completed, id];
      saveProgress(next);
      renderProgress();
    });
  });

  renderProgress();
});

