document.addEventListener("DOMContentLoaded", () => {
  const challenge = document.querySelector("[data-code-challenge]");
  if (!challenge) return;

  const editor = challenge.querySelector("[data-code-editor]");
  const runButton = challenge.querySelector("[data-run-tests]");
  const resetButton = challenge.querySelector("[data-reset-code]");
  const results = challenge.querySelector("[data-test-results]");
  const storageKey = "comp3711h-code-upper-bound-v1";
  const starterCode = editor.value;

  const tests = [
    { name: "重复目标", input: [[1, 2, 2, 4, 7], 2], expected: 3 },
    { name: "空数组", input: [[], 3], expected: 0 },
    { name: "目标更小", input: [[1, 2, 2], 0], expected: 0 },
    { name: "目标更大", input: [[1, 2, 2], 9], expected: 3 },
    { name: "重复负数", input: [[-2, -2, 0, 5], -2], expected: 2 }
  ];

  const savedCode = localStorage.getItem(storageKey);
  if (savedCode) editor.value = savedCode;
  editor.addEventListener("input", () => localStorage.setItem(storageKey, editor.value));

  const addTextBlock = (className, text) => {
    const node = document.createElement("div");
    node.className = className;
    node.textContent = text;
    results.appendChild(node);
  };

  const renderResults = (payload) => {
    results.replaceChildren();
    if (payload.error) {
      addTextBlock("test-summary fail", `代码未通过：${payload.error}`);
      return;
    }
    const passed = payload.cases.filter((item) => item.pass).length;
    addTextBlock(
      `test-summary ${passed === payload.cases.length ? "pass" : "fail"}`,
      passed === payload.cases.length
        ? `✓ ${passed} / ${payload.cases.length} 全部通过`
        : `${passed} / ${payload.cases.length} 通过；查看下面的反例`
    );
    payload.cases.forEach((item) => {
      const actual = typeof item.actual === "undefined" ? "undefined" : JSON.stringify(item.actual);
      addTextBlock(
        `test-case ${item.pass ? "pass" : "fail"}`,
        `${item.pass ? "PASS" : "FAIL"} · ${item.name}\n输入 ${JSON.stringify(item.input)} · 期望 ${JSON.stringify(item.expected)} · 得到 ${actual}`
      );
    });
  };

  runButton.addEventListener("click", () => {
    results.replaceChildren();
    addTextBlock("test-summary", "正在运行 5 个边界测试…");

    const workerSource = `
      self.onmessage = (event) => {
        const { code, functionName, tests } = event.data;
        try {
          const fn = new Function(code + "\\nreturn " + functionName + ";")();
          if (typeof fn !== "function") throw new Error("没有找到函数 " + functionName);
          const cases = tests.map((test) => {
            try {
              const args = JSON.parse(JSON.stringify(test.input));
              const actual = fn(...args);
              return { ...test, actual, pass: JSON.stringify(actual) === JSON.stringify(test.expected) };
            } catch (error) {
              return { ...test, actual: "运行错误: " + error.message, pass: false };
            }
          });
          self.postMessage({ cases });
        } catch (error) {
          self.postMessage({ error: error.message });
        }
      };
    `;
    const workerUrl = URL.createObjectURL(new Blob([workerSource], { type: "text/javascript" }));
    const worker = new Worker(workerUrl);
    const timeout = window.setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      renderResults({ error: "运行超时；检查循环区间是否严格缩小。" });
    }, 1500);

    worker.onmessage = (event) => {
      window.clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      renderResults(event.data);
    };
    worker.onerror = (event) => {
      window.clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      renderResults({ error: event.message || "无法启动测试。" });
    };
    worker.postMessage({ code: editor.value, functionName: "upperBound", tests });
  });

  resetButton.addEventListener("click", () => {
    editor.value = starterCode;
    localStorage.removeItem(storageKey);
    results.replaceChildren();
    editor.focus();
  });
});

