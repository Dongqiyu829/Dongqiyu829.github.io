document.addEventListener("DOMContentLoaded", () => {
  const progressKey = "intro-linear-algebra-progress-v1";
  const loadProgress = () => {
    try { const data=JSON.parse(localStorage.getItem(progressKey) || "[]");return Array.isArray(data)?data.filter(id=>typeof id==='string'):[]; }
    catch { return []; }
  };
  const saveProgress = (items) => {try {localStorage.setItem(progressKey, JSON.stringify(items));return true;}catch{return false;}};
  const number=raw=>window.LAStudy?window.LAStudy.parseNumber(raw):window.LABeginner?window.LABeginner.parseNumber(raw):Number(raw);

  function renderProgress() {
    const completed = loadProgress();
    document.querySelectorAll("[data-course-progress]").forEach((node) => {
      const known=[...document.querySelectorAll('[data-lesson-id]')].map(card=>card.dataset.lessonId);
      node.textContent = `${known.length?completed.filter(id=>known.includes(id)).length:completed.length} / ${node.dataset.total || 4} 节已完成（本设备）`;
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

  document.querySelectorAll("[data-number-check]").forEach((exercise) => {
    const fields = [...exercise.querySelectorAll("input[data-expected]")];
    const output = exercise.querySelector("[data-check-output]");
    exercise.querySelector("[data-check-values]").addEventListener("click", () => {
      const incomplete = fields.some((field) => !field.value.trim() || !Number.isFinite(number(field.value)));
      if (incomplete) {
        output.className = "feedback incorrect";
        output.textContent = "先填完每一格再核对；空白和 0 不同。请用有限数字；文字框还可填 1/2 这样的分数，分母不能为 0。";
        return;
      }
      const wrong = fields.filter((field) => Math.abs(number(field.value)-Number(field.dataset.expected)) > 1e-8);
      fields.forEach((field) => field.setAttribute("aria-invalid", String(wrong.includes(field))));
      output.className = `feedback ${wrong.length ? "incorrect" : "correct"}`;
      output.textContent = wrong.length ? `已有 ${fields.length-wrong.length} / ${fields.length} 格正确。再检查${wrong.map((field) => field.getAttribute("aria-label")).join("、")}。${exercise.dataset.hint}` : exercise.dataset.success;
    });
    fields.forEach((field) => field.addEventListener("input", () => {
      fields.forEach((peer) => peer.removeAttribute("aria-invalid"));
      output.textContent = ""; output.className = "feedback";
    }));
  });

  document.querySelectorAll("button[data-complete-lesson]").forEach((button) => {
    button.addEventListener("click", () => {
      const completed = loadProgress();
      const id = button.dataset.completeLesson;
      const saved=saveProgress(completed.includes(id) ? completed.filter((item) => item !== id) : [...completed, id]);
      renderProgress();
      if(!saved){const status=button.parentElement.querySelector('[data-completion-status]');if(status)status.textContent='当前浏览器不允许保存进度，但所有课程和自测仍可自由使用。';}
    });
  });
  renderProgress();
});
