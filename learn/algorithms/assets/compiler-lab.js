/* Reusable external C++ / Python lab; per-lesson programs live in JSON assets. */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-compiler-lab]").forEach(lab => {
    const frame = lab.querySelector("[data-lab-frame]");
    const status = lab.querySelector("[data-lab-status]");
    const fallback = lab.querySelector("[data-lab-fallback]");
    const starter = lab.querySelector("[data-lab-starter]");
    let programs = null, language = "cpp", frameLoaded = false, generation = 0, pending;
    function send() {
      if (!programs || !frameLoaded) return;
      window.clearTimeout(pending);
      frame.contentWindow?.postMessage({eventType:"populateCode", language, files:[{name:language === "cpp" ? "main.cpp" : "main.py", content:programs[language]}]}, "https://onecompiler.com");
      frame.parentElement.classList.remove("is-loading"); starter.disabled = false;
      status.textContent = (language === "cpp" ? "C++" : "Python") + " 起始代码已发送。补完 TODO，再按 Run；若仍显示默认代码，可点重新填入。";
    }
    function schedule() {
      if (!programs || !frameLoaded) return;
      window.clearTimeout(pending);
      const current = generation;
      pending = window.setTimeout(() => { if (current === generation) send(); }, 1000);
    }
    frame.addEventListener("load", () => { frameLoaded = true; schedule(); });
    lab.querySelectorAll("[data-lab-language]").forEach(button => button.addEventListener("click", () => {
      const next = button.dataset.labLanguage;
      if (next === language) return;
      language = next; generation++; frameLoaded = false; window.clearTimeout(pending);
      starter.disabled = true; frame.parentElement.classList.add("is-loading");
      lab.querySelectorAll("[data-lab-language]").forEach(peer => peer.setAttribute("aria-pressed", String(peer === button)));
      if (programs) fallback.textContent = programs[language];
      status.textContent = "正在载入 " + (language === "cpp" ? "C++" : "Python") + " 编辑器…";
      frame.title = (language === "cpp" ? "C++" : "Python") + " 在线计数实验";
      frame.src = "https://onecompiler.com/embed/" + language + "?listenToEvents=true&hideLanguageSelection=true&fontSize=16";
    }));
    starter.addEventListener("click", send);
    fetch(lab.dataset.programsSource).then(response => {
      if (!response.ok) throw new Error("programs unavailable");
      return response.json();
    }).then(data => {
      if (typeof data.cpp !== "string" || typeof data.python !== "string") throw new Error("invalid programs");
      programs = data; fallback.textContent = programs[language]; schedule();
    }).catch(() => {
      frame.parentElement.classList.remove("is-loading");
      status.textContent = "起始代码暂未载入。可以刷新页面，或打开本课参考卡复制代码。";
    });
  });
});
