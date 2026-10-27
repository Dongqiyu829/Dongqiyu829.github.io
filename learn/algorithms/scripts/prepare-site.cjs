// Mechanical preparation only: no bundler or runtime dependency.
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'assets/course-manifest.json'), 'utf8'));
const check = process.argv.includes('--check');
const pages = ['index.html', ...['lessons', 'reference', 'research'].filter(dir=>fs.existsSync(path.join(root,dir))).flatMap(dir => fs.readdirSync(path.join(root, dir)).filter(name => name.endsWith('.html')).map(name => dir + '/' + name))];
const escaped = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const metadata = '<!-- course-data:start -->\n<script type="application/json" data-course-manifest>' + JSON.stringify(manifest).replace(/</g, '\\u003c') + '</script>\n<!-- course-data:end -->';
const published = manifest.lessons.filter(item => item.published).length;
const stats = '<!-- course-stats:start -->\n<section class="course-stats" aria-label="课程与个人进度">\n' +
  '  <div><span>已发布课程</span><strong data-published-count>' + published + '</strong><small>可自由访问的课时页面</small></div>\n' +
  '  <div><span>个人完成</span><strong data-course-progress>启用 JavaScript 读取</strong><small>只统计已发布课程</small></div>\n' +
  '  <div><span>总规划</span><strong><span data-planned-count>' + manifest.planning.topicCount + '</span> 个主题</strong><small>一个主题可拆成多节课</small></div>\n' +
  '</section>\n<p class="editor-note" data-progress-notice>完成标记只保存在本浏览器；JavaScript 不可用时不读取个人记录。</p>\n<!-- course-stats:end -->';
let changed = 0;
for (const relative of pages) {
  const file = path.join(root, relative);
  const original = fs.readFileSync(file, 'utf8');
  let html = original.replace(/<!doctype html>/i, '<!DOCTYPE html>');
  if (html.includes('<!-- course-data:start -->')) html = html.replace(/<!-- course-data:start -->[\s\S]*?<!-- course-data:end -->/, metadata);
  else html = html.replace('</head>', metadata + '\n</head>');
  if (html.includes('<!-- course-stats:start -->')) html = html.replace(/<!-- course-stats:start -->[\s\S]*?<!-- course-stats:end -->/, stats);
  html = html.replace(/(<span data-planned-count>)[^<]*(<\/span>)/g, (_match, open, close) => open + manifest.planning.topicCount + close);
  const source = html.match(/data-programs-source="([^"]+)"/);
  if (source && html.includes('<!-- compiler-fallback:start -->')) {
    const programs = JSON.parse(fs.readFileSync(path.resolve(path.dirname(file), source[1].split('?')[0]), 'utf8'));
    const fallback = '<!-- compiler-fallback:start -->\n<details data-lab-fallback-panel class="compiler-fallback"><summary>编辑器不可用？复制完整起始代码（含全部测试）</summary>\n' +
      '<h3>C++</h3><pre tabindex="0" data-program-code="cpp">' + escaped(programs.cpp) + '</pre>\n' +
      '<h3>Python</h3><pre tabindex="0" data-program-code="python">' + escaped(programs.python) + '</pre>\n</details>\n<!-- compiler-fallback:end -->';
    html = html.replace(/<!-- compiler-fallback:start -->[\s\S]*?<!-- compiler-fallback:end -->/, fallback);
  }
  html = html.replace(/((?:src|href|data-programs-source)=")([^"]+)(")/g, (whole, before, url, after) => {
    if (/^(?:https?:|data:|\/\/)/.test(url) || !/\.(?:css|js|json)(?:[?#]|$)/.test(url)) return whole;
    const [base, fragment] = url.split('#');
    const clean = base.split('?')[0];
    return before + clean + '?v=' + manifest.release + (fragment ? '#' + fragment : '') + after;
  });
  if (html !== original) {
    changed++;
    if (check) console.error('Needs prepare: ' + relative);
    else fs.writeFileSync(file, html);
  }
}
console.log((check ? 'CHECK' : 'PREPARED') + ' ' + pages.length + ' HTML pages; release ' + manifest.release + '; ' + changed + ' changed');
if (check && changed) process.exitCode = 1;
