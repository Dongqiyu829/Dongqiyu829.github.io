/* A depth-by-depth accounting diagram, not an animation of execution order. */
(() => {
  function levelsFor(values) {
    const levels = [];
    function visit(a, depth, address) {
      (levels[depth] ||= []).push({values: a.slice(), address, work: a.length > 1 ? a.length : 0});
      if (a.length <= 1) return;
      const middle = Math.floor(a.length / 2);
      visit(a.slice(0, middle), depth + 1, address + 'L');
      visit(a.slice(middle), depth + 1, address + 'R');
    }
    visit(values, 0, '根');
    return levels;
  }
  if (typeof module !== 'undefined') module.exports = {levelsFor};
  if (typeof document === 'undefined') return;
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-recursion-tree]').forEach(lab => {
      const inputs = {8: [7,2,5,1,6,3,8,4], 5: [7,2,5,1,6], 16: Array.from({length:16}, (_,i)=>16-i), 1: [7], 0: []};
      const rows = lab.querySelector('[data-tree-rows]');
      const next = lab.querySelector('[data-tree-next]');
      const status = lab.querySelector('[data-tree-state]');
      let n = 8, depth = 0, levels;
      function render() {
        rows.replaceChildren();
        let total = 0;
        levels.slice(0, depth + 1).forEach((nodes, d) => {
          const row = document.createElement('li');row.className = 'tree-level';row.dataset.depth = d;
          const work = nodes.reduce((sum,node)=>sum+node.work,0);total += work;
          row.dataset.work = work;
          const title = document.createElement('h4');title.textContent = '深度 '+d+' · '+nodes.length+' 个调用 · 本层写入 '+work+' 次';row.append(title);
          const list = document.createElement('ul');list.className = 'tree-nodes';
          nodes.forEach(node => {
            const item = document.createElement('li');item.className = node.work ? 'tree-node' : 'tree-node tree-leaf';
            const name = document.createElement('strong');name.textContent = node.address+' ['+node.values.join(', ')+']';
            const description = document.createElement('span');description.textContent = '规模 '+node.values.length+'；'+(node.work ? '本次 merge 写入 '+node.work+' 次' : '边界直接返回；merge 写入 0 次');
            item.append(name,description);list.append(item);
          });
          row.append(list);rows.append(row);
        });
        const done = depth === levels.length - 1;
        lab.dataset.done = String(done);lab.dataset.total = total;lab.dataset.depth = depth;
        next.disabled = done;
        status.textContent = 'n='+n+'；已展示 '+(depth+1)+' 层；这些层的 merge 写入合计 '+total+' 次。'+(done ? (n>1?'已到全部叶子；叶子仍有常数控制开销，但不做 merge。':'空数组或单元素直接返回，不发生合并。') : '先预测下一层的调用数与写入数，再展开。');
      }
      function reset(size) {
        n=size;depth=0;levels=levelsFor(inputs[n]);
        lab.querySelectorAll('[data-tree-size]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.treeSize)===n)));
        render();
      }
      next.addEventListener('click',()=>{if(depth<levels.length-1){depth++;render();}});
      lab.querySelector('[data-tree-reset]').addEventListener('click',()=>reset(n));
      lab.querySelectorAll('[data-tree-size]').forEach(button=>button.addEventListener('click',()=>reset(Number(button.dataset.treeSize))));
      reset(8);
    });
  });
})();
