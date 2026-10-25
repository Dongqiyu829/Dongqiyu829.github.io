/* Two teaching phases grouped by depth, not actual program execution order. */
(() => {
  function mergeValues(left, right) {
    const out=[]; let i=0,j=0;
    while(i<left.length && j<right.length) out.push(left[i]<=right[j]?left[i++]:right[j++]);
    while(i<left.length) out.push(left[i++]);
    while(j<right.length) out.push(right[j++]);
    return out;
  }
  function levelsFor(values) {
    const levels=[];
    function visit(a,depth,address) {
      const node={values:a.slice(),address,work:a.length>1?a.length:0,children:[],returned:[]};
      (levels[depth] ||= []).push(node);
      if(a.length<=1) node.returned=a.slice();
      else {
        const middle=Math.floor(a.length/2);
        node.children=[visit(a.slice(0,middle),depth+1,address+'L'),visit(a.slice(middle),depth+1,address+'R')];
        node.returned=mergeValues(node.children[0].returned,node.children[1].returned);
      }
      return node;
    }
    visit(values,0,'根'); return levels;
  }
  if(typeof module!=='undefined') module.exports={levelsFor,mergeValues};
  if(typeof document==='undefined') return;
  document.addEventListener('DOMContentLoaded',()=>{
    document.querySelectorAll('[data-recursion-tree]').forEach(lab=>{
      const inputs={8:[7,2,5,1,6,3,8,4],5:[7,2,5,1,6],6:[7,2,5,1,6,3],16:Array.from({length:16},(_,i)=>16-i),1:[7],0:[]};
      const rows=lab.querySelector('[data-tree-rows]'),next=lab.querySelector('[data-tree-next]'),status=lab.querySelector('[data-tree-state]');
      let n=8,phase='split',splitDepth=0,mergeDepth=0,levels;
      const arrayText=a=>'['+a.join(', ')+']';
      function line(item,label,value,kind) {
        const span=document.createElement('span');span.dataset.treeField=kind;span.textContent=label+value;item.append(span);
      }
      function render() {
        rows.replaceChildren();let total=0;
        const visible=phase==='split'?levels.slice(0,splitDepth+1):levels;
        visible.forEach((nodes,d)=>{
          const ready=phase==='merge' && d>=mergeDepth;
          const row=document.createElement('li');row.className='tree-level';row.dataset.depth=d;
          const work=nodes.reduce((sum,node)=>sum+node.work,0);if(ready)total+=work;
          row.dataset.work=work;row.dataset.returned=String(ready);
          const title=document.createElement('h4');
          title.textContent='深度 '+d+' · '+nodes.length+' 个调用 · '+(phase==='split'?'本层合并需写入 '+work+' 次（尚未合并）':ready?'本层已返回；merge 写入 '+work+' 次':'等待子结果；本层需写入 '+work+' 次');
          row.append(title);
          const list=document.createElement('ul');list.className='tree-nodes';
          nodes.forEach(node=>{
            const item=document.createElement('li');
            item.className='tree-node'+(node.work?'':' tree-leaf')+(ready?' tree-returned':'');
            item.dataset.address=node.address;item.dataset.returned=String(ready);
            const name=document.createElement('strong');name.textContent=node.address+' · 规模 '+node.values.length;item.append(name);
            line(item,'原始子数组：',arrayText(node.values),'original');
            if(phase==='split') line(item,'',node.work?'向下拆成 '+node.children[0].values.length+' 与 '+node.children[1].values.length+'；等两侧返回后才 merge':'递归边界：长度 ≤ 1，原样返回，不做 merge','split');
            else if(ready) {
              if(node.work) {
                line(item,'左侧有序返回：',arrayText(node.children[0].returned),'left');
                line(item,'右侧有序返回：',arrayText(node.children[1].returned),'right');
                line(item,'本节点自身 merge：','写入 '+node.work+' 次（不包含子调用）','work');
              } else line(item,'边界返回：','不做 merge，写入 0 次；仍有常数调用开销','work');
              line(item,'↑ 有序结果返回父调用：',arrayText(node.returned),'result');
            } else line(item,'','等待子调用返回；此时不展示本节点的有序结果','waiting');
            list.append(item);
          });
          row.append(list);rows.append(row);
        });
        const done=phase==='split'?splitDepth===levels.length-1:mergeDepth===0;
        lab.dataset.phase=phase;lab.dataset.done=String(done);lab.dataset.total=total;
        lab.dataset.depth=phase==='split'?splitDepth:mergeDepth;
        next.disabled=done;next.textContent=phase==='split'?'↓ 再拆一层':'↑ 返回上一层';
        lab.querySelectorAll('[data-tree-phase]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.treePhase===phase)));
        status.textContent=phase==='split'?'Split · n='+n+'；已展示到深度 '+splitDepth+'。'+(done?'已找到全部边界；接着选 Merge 看有序结果向上返回。':'先预测下一层子问题，再拆开。')+' 本阶段只展示拆分，不把预计工作记成已完成合并。':'Merge · n='+n+'；已返回深度 '+mergeDepth+' 及以下的节点；这些节点自身的 merge 累计写入 '+total+' 次。'+(done?'根调用已返回 '+arrayText(levels[0][0].returned)+'。':'先预测上一层的有序输出，再继续。');
        const current=lab.querySelector('[data-tree-current]');
        const nodes=levels[phase==='split'?splitDepth:mergeDepth];
        current.textContent=(phase==='split'?'当前拆分示例：':'当前返回示例：')+nodes.slice(0,2).map(node=>node.address+'：'+(phase==='split'?arrayText(node.values)+(node.work?' → '+node.children.map(c=>arrayText(c.values)).join(' 与 '):' → 边界，原样返回'):node.work?node.children.map(c=>arrayText(c.returned)).join(' + ')+' → '+arrayText(node.returned)+'（自身写入 '+node.work+' 次）':arrayText(node.values)+' → '+arrayText(node.returned)+'（边界，0 次 merge 写入）')).join('；')+(nodes.length>2?'；其余节点见下方。':'。');
      }
      function reset(size) {
        n=size;phase='split';splitDepth=0;levels=levelsFor(inputs[n]);mergeDepth=levels.length-1;
        lab.querySelectorAll('[data-tree-size]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.treeSize)===n)));
        render();
      }
      next.addEventListener('click',()=>{
        if(phase==='split'&&splitDepth<levels.length-1)splitDepth++;
        else if(phase==='merge'&&mergeDepth>0)mergeDepth--;
        render();
      });
      lab.querySelector('[data-tree-reset]').addEventListener('click',()=>reset(n));
      lab.querySelectorAll('[data-tree-size]').forEach(button=>button.addEventListener('click',()=>reset(Number(button.dataset.treeSize))));
      lab.querySelectorAll('[data-tree-phase]').forEach(button=>button.addEventListener('click',()=>{
        if(phase===button.dataset.treePhase)return;
        phase=button.dataset.treePhase;splitDepth=0;mergeDepth=levels.length-1;render();
      }));
      reset(8);
    });
  });
})();
