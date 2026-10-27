/* Exact integer work models; leaf cost 1, n restricted to powers of two. */
(() => {
 function layerWork(n,power,branches=2){const rows=[];for(let d=0,m=n,count=1;;d++,m/=2,count*=branches){const leaf=m===1;rows.push({depth:d,nodes:count,size:m,own:leaf?1:m**power,work:count*(leaf?1:m**power),leaf});if(leaf)return rows;}}
 if(typeof module!=='undefined')module.exports={layerWork};
 if(typeof document==='undefined')return;
 document.addEventListener('DOMContentLoaded',()=>document.querySelectorAll('[data-level-work]').forEach(lab=>{
  let n=8,power=1,depth=0;
  const rows=lab.querySelector('[data-level-rows]'),next=lab.querySelector('[data-level-next]');
  function render(){const model=layerWork(n,power);rows.replaceChildren();let total=0;
   model.slice(0,depth+1).forEach(r=>{const li=document.createElement('li');li.dataset.depth=r.depth;li.dataset.work=r.work;li.textContent='深度 '+r.depth+'：'+r.nodes+' 个节点 × '+(r.leaf?'边界成本 1':('每个规模 '+r.size+'，自身工作 '+r.own))+' = '+r.work+(r.leaf?'（叶子层）':'');rows.append(li);total+=r.work;});
   lab.dataset.total=total;lab.dataset.done=String(depth===model.length-1);lab.dataset.power=power;lab.dataset.size=n;next.disabled=depth===model.length-1;
   lab.querySelector('[data-level-status]').textContent='已展示 '+(depth+1)+' 层，累计 '+total+' 单位工作。'+(next.disabled?'已经包含叶子；试着解释哪些层决定总和。':'先预测下一层，再展开。');
   lab.querySelectorAll('[data-level-power]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.levelPower)===power)));
   lab.querySelectorAll('[data-level-size]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.levelSize)===n)));
  }
  lab.querySelectorAll('[data-level-power]').forEach(b=>b.addEventListener('click',()=>{power=Number(b.dataset.levelPower);depth=0;render();}));
  lab.querySelectorAll('[data-level-size]').forEach(b=>b.addEventListener('click',()=>{n=Number(b.dataset.levelSize);depth=0;render();}));
  next.addEventListener('click',()=>{depth++;render();});lab.querySelector('[data-level-reset]').addEventListener('click',()=>{depth=0;render();});render();
 }));
})();
