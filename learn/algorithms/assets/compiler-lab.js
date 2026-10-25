/* Shared OneCompiler integration. Code echoes confirm loading, never test success. */
(() => {
  const ownURL = new URL(document.currentScript.src);
  const origin = "https://onecompiler.com";
  const normalize = value => value.replace(/\r\n/g, "\n").trim();
  function mount(lab) {
    if (lab.dataset.compilerMounted) return;
    lab.dataset.compilerMounted = "true";
    let frame = lab.querySelector("[data-lab-frame], [data-compiler-frame]");
    const status = lab.querySelector("[data-lab-status], [data-editor-status]");
    const starter = lab.querySelector("[data-lab-starter], [data-load-starter]");
    const runButton = lab.querySelector("[data-lab-run]");
    const fallback = lab.querySelector("[data-lab-fallback-panel]");
    const buttons = [...lab.querySelectorAll("[data-lab-language], [data-language]")];
    let language = "cpp", programs = {}, generation = 0, loaded = false, sent = false;
    let sendTimer, deadline, observer;
    lab.querySelectorAll("[data-program-code]").forEach(pre => { programs[pre.dataset.programCode] = pre.textContent; });
    function show(state, text) {
      lab.dataset.editorState = state;
      status.textContent = text;
      if (runButton) runButton.disabled = state !== "confirmed";
      if (state !== "loading") frame.parentElement.classList.remove("is-loading");
      if (state === "unconfirmed" || state === "unavailable") {
        if (fallback) fallback.open = true;
      }
    }
    function timeout(ms, text) {
      window.clearTimeout(deadline);
      const current = generation;
      deadline = window.setTimeout(() => {
        if (current === generation && lab.dataset.editorState !== "confirmed") show("unconfirmed", text);
      }, ms);
    }
    function send() {
      if (!programs[language]) return;
      window.clearTimeout(sendTimer);
      if (!loaded) {
        show("loading", "编辑器还未响应。可重新加载，或直接复制下方完整代码。");
        timeout(15000, "未确认编辑器响应，可能是网络或服务问题。下方完整代码可直接复制；不影响阅读和继续学习。");
        return;
      }
      sent = true;
      frame.contentWindow?.postMessage({ eventType: "populateCode", language,
        files: [{ name: language === "cpp" ? "main.cpp" : "main.py", content: programs[language] }] }, origin);
      show("waiting", "已请求填入起始代码，正在等待编辑器回传确认；这不代表测试已通过。");
      timeout(8000, "尚未收到起始代码的匹配回传，不能确认填入成功。请检查编辑器，或重填／复制完整代码。");
    }
    function schedule() {
      if (!loaded || sent || !programs[language]) return;
      const current = generation;
      window.clearTimeout(sendTimer);
      sendTimer = window.setTimeout(() => { if (current === generation && !sent) send(); }, 1000);
    }
    function watch() {
      frame.addEventListener("load", event => {
        if (event.target !== frame) return;
        loaded = true;
        schedule();
      });
      frame.addEventListener("error", event => {
        if (event.target !== frame) return;
        window.clearTimeout(deadline);
        show("unavailable", "编辑器加载失败。可重新加载，或复制下方完整起始代码到自己的环境。");
      });
      if ("IntersectionObserver" in window) {
        observer = new IntersectionObserver(entries => {
          if (entries.some(entry => entry.target === frame && entry.isIntersecting)) {
            timeout(15000, "编辑器未能在等待时间内确认响应。可重载，或使用下方完整代码。");
            observer.disconnect();
          }
        });
        observer.observe(frame);
      } else {
        timeout(15000, "未确认编辑器响应。可重载，或复制完整代码。");
      }
    }
    function change(next) {
      window.clearTimeout(sendTimer); window.clearTimeout(deadline); observer?.disconnect();
      generation++; language = next; loaded = false; sent = false;
      buttons.forEach(button => button.setAttribute("aria-pressed", String((button.dataset.labLanguage || button.dataset.language) === next)));
      const legacyCode = lab.querySelector("[data-fallback-code], [data-lab-fallback]");
      if (legacyCode && programs[next]) legacyCode.textContent = programs[next];
      const standalone = lab.querySelector("[data-lab-open]");
      if (standalone) standalone.href = origin + "/" + next;
      // A new frame gives a new event.source; messages from the old language cannot confirm this one.
      const replacement = frame.cloneNode(false);
      replacement.src = origin + "/embed/" + language + "?listenToEvents=true&codeChangeEvent=true&hideLanguageSelection=true&fontSize=16";
      replacement.title = (language === "cpp" ? "C++" : "Python") + " 在线代码编辑器";
      frame.replaceWith(replacement); frame = replacement;
      frame.parentElement.classList.add("is-loading");
      show("loading", "正在载入 " + (language === "cpp" ? "C++" : "Python") + "。完整起始代码始终在下方可复制。");
      watch();
    }
    window.addEventListener("message", event => {
      if (event.origin !== origin || event.source !== frame.contentWindow) return;
      const data = event.data;
      if (!data || data.language !== language || !Array.isArray(data.files)) return;
      const file = data.files.find(item => typeof item?.content === "string");
      if (!file) return;
      loaded = true;
      if (sent && programs[language] && normalize(file.content) === normalize(programs[language])) {
        window.clearTimeout(deadline); window.clearTimeout(sendTimer);
        show("confirmed", "已通过编辑器回传确认起始代码载入。补完 TODO 后按 Run；运行结果以控制台为准。");
      } else if (!sent) {
        send();
      }
      // User edits after confirmation do not trigger automatic reinjection or grading.
    });
    buttons.forEach(button => button.addEventListener("click", () => {
      const next = button.dataset.labLanguage || button.dataset.language;
      if (next !== language) change(next);
    }));
    starter?.addEventListener("click", send);
    runButton?.addEventListener("click", () => {
      if (!loaded || lab.dataset.editorState !== "confirmed") return;
      frame.contentWindow?.postMessage({ eventType: "triggerRun" }, origin);
      status.textContent = "已请求运行当前编辑区代码。请查看编辑器控制台；这里只确认发出请求，不判断测试结果。";
      frame.scrollIntoView({ block: "center", behavior: "auto" });
    });
    lab.querySelector("[data-lab-reload]")?.addEventListener("click", () => change(language));
    lab.querySelector("[data-copy-starter]")?.addEventListener("click", async () => {
      const pre = lab.querySelector('[data-program-code="' + language + '"]');
      try {
        await navigator.clipboard.writeText(programs[language]);
        lab.querySelector("[data-copy-status]").textContent = "已复制当前语言的完整起始代码（含测试），未发送给教师。";
      } catch {
        if (fallback) fallback.open = true;
        if (pre) {
          const range = document.createRange(); range.selectNodeContents(pre);
          const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); pre.focus();
        }
        lab.querySelector("[data-copy-status]").textContent = "自动复制不可用，请在已展开的完整代码中手动复制。";
      }
    });
    const url = new URL(frame.src);
    if (url.searchParams.get("codeChangeEvent") !== "true") {
      url.searchParams.set("codeChangeEvent", "true"); frame.src = url.href;
    }
    watch();
    if (programs.cpp && programs.python) {
      if (starter) starter.disabled = false;
    } else {
      // Compatibility for pre-release cached Lesson 01 markup; current pages have static code banks.
      const source = lab.dataset.programsSource || new URL("binary-programs.json" + ownURL.search, ownURL).href;
      fetch(source).then(response => { if (!response.ok) throw new Error(); return response.json(); }).then(data => {
        programs = data;
        const pre = lab.querySelector("[data-fallback-code], [data-lab-fallback]");
        if (pre) pre.textContent = programs[language];
        if (starter) starter.disabled = false;
        schedule();
      }).catch(() => show("unavailable", "起始代码请求失败，请刷新最新课程页，或使用本课参考卡。"));
    }
  }
  const init = () => document.querySelectorAll("[data-compiler-lab], [data-code-challenge]").forEach(mount);
  window.AlgorithmCompilerLab = { init };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
