document.addEventListener("DOMContentLoaded", () => {
  const progressKey = "comp3711h-learning-progress-v1";
  let manifest = null;
  try {
    const value = JSON.parse(document.querySelector("[data-course-manifest]")?.textContent || "null");
    if (value && Array.isArray(value.lessons) && Number.isInteger(value.planning?.topicCount)) manifest = value;
  } catch { /* Static learning content remains available if metadata is damaged. */ }
  const published = new Set((manifest?.lessons || []).filter(item => item.published === true).map(item => item.id));
  let completed = [];
  let persistent = true;
  function readProgress() {
    try {
      const value = JSON.parse(localStorage.getItem(progressKey) || "[]");
      if (!Array.isArray(value)) throw new Error("invalid progress");
      completed = [...new Set(value.filter(item => typeof item === "string"))];
    } catch {
      persistent = false;
    }
  }
  function renderProgress() {
    const count = completed.filter(id => published.has(id)).length;
    document.querySelectorAll("[data-published-count]").forEach(node => {
      node.textContent = manifest ? String(published.size) : "暂不可用";
    });
    document.querySelectorAll("[data-planned-count]").forEach(node => {
      node.textContent = manifest ? String(manifest.planning.topicCount) : "暂不可用";
    });
    document.querySelectorAll("[data-course-progress]").forEach(node => {
      node.textContent = manifest ? count + " / " + published.size : "统计暂不可用";
    });
    document.querySelectorAll("[data-progress-notice]").forEach(node => {
      node.textContent = persistent
        ? "完成标记只保存在本浏览器，不代表掌握程度，也不会同步到教师对话。"
        : "本地存储不可用或原进度格式异常：本页临时记录，刷新后可能丢失；原有数据不会被覆盖。";
    });
    document.querySelectorAll("[data-lesson-id]").forEach(card => {
      const done = completed.includes(card.dataset.lessonId);
      card.classList.toggle("completed", done);
      const label = card.querySelector("[data-lesson-status]");
      if (label) label.textContent = done ? "已标记完成" : "可开始";
    });
    document.querySelectorAll("button[data-complete-lesson]").forEach(button => {
      const done = completed.includes(button.dataset.completeLesson);
      button.textContent = done ? "取消完成标记" : "标记本课已完成";
      button.setAttribute("aria-pressed", String(done));
      const label = document.querySelector("[data-completion-status]");
      if (label) label.textContent = (done ? "已标记完成。" : "自愿标记，不影响访问。") +
        (persistent ? "仅保存在本浏览器，不代表已掌握。" : "本页临时记录；本地存储不可用或格式异常。");
    });
  }
  readProgress();
  document.querySelectorAll("[data-quiz]").forEach(quiz => {
    const feedback = quiz.querySelector("[data-feedback-output]");
    quiz.querySelectorAll("button[data-answer]").forEach(button => button.addEventListener("click", () => {
      quiz.querySelectorAll("button[data-answer]").forEach(peer => peer.setAttribute("aria-pressed", String(peer === button)));
      if (feedback) {
        feedback.textContent = button.dataset.message;
        feedback.className = "feedback " + (button.dataset.answer === "correct" ? "correct" : "incorrect");
      }
    }));
  });
  document.querySelectorAll("button[data-reveal-target]").forEach(button => button.addEventListener("click", () => {
    const target = document.querySelector(button.dataset.revealTarget);
    if (!target) return;
    const visible = target.classList.toggle("visible");
    button.setAttribute("aria-expanded", String(visible));
    button.textContent = visible ? "收起参考" : "查看参考";
  }));
  document.querySelectorAll("button[data-complete-lesson]").forEach(button => button.addEventListener("click", () => {
    const id = button.dataset.completeLesson;
    completed = completed.includes(id) ? completed.filter(item => item !== id) : [...completed, id];
    if (persistent) {
      try { localStorage.setItem(progressKey, JSON.stringify(completed)); }
      catch { persistent = false; }
    }
    renderProgress();
  }));
  window.addEventListener("storage", event => {
    if ((event.key === progressKey || event.key === null) && persistent) { readProgress(); renderProgress(); }
  });
  renderProgress();
});


