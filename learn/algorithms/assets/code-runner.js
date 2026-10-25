/* Compatibility entry for cached Lesson 01 pages. New pages load compiler-lab.js directly. */
(() => {
  if (window.AlgorithmCompilerLab) { window.AlgorithmCompilerLab.init(); return; }
  const current = new URL(document.currentScript.src);
  const script = document.createElement("script");
  const target = new URL("compiler-lab.js", current);
  target.search = current.search;
  script.src = target.href;
  document.head.append(script);
})();


