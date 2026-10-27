/* Teaching trace for small sorted halves; the coding lab implements full divide-and-conquer. */
(() => {
 function mergeTrace(left,right){let i=0,j=0,count=0;const out=[];
  const states=[{i,j,count,out:[],added:0,message:'先预测：取哪个队首？能一次计入几对？'}];
  while(i<left.length||j<right.length){let added=0,message;
   if(j===right.length||(i<left.length&&left[i]<=right[j])){
    const value=left[i++];out.push(value);message='取左侧 '+value+'：'+(j===right.length?'右侧已用尽，无新增跨区间逆序对。':'它不大于右侧队首，也不大于右侧其余元素；新增 0。相等同样不算逆序。');
   }else{
    const value=right[j++];added=left.length-i;count+=added;out.push(value);
    message=added?'取右侧 '+value+'：它小于左队首 '+left[i]+'；左侧剩下的 '+added+' 个都更大，一次加 '+added+'。':'左侧已用尽，复制右侧 '+value+'，新增 0。';
   }
   states.push({i,j,count,out:out.slice(),added,message});
  }
  return states;
 }
 if(typeof module!=='undefined')module.exports={mergeTrace};
 if(typeof document==='undefined')return;
 document.addEventListener('DOMContentLoaded',()=>document.querySelectorAll('[data-inversion-merge]').forEach(lab=>{
  const cases={example:{left:[2,4],right:[1,3,5]},duplicates:{left:[1,2,2],right:[2,2]},negative:{left:[-2,0],right:[-3,-2,1]},reverse:{left:[4,5],right:[1,2,3]},empty:{left:[],right:[1]},equal:{left:[2,2],right:[2]}};
  let key='example',step=0,states;
  const next=lab.querySelector('[data-inv-next]');
  const array=a=>'['+a.join(', ')+']';
  function render(){const data=cases[key],s=states[step];lab.dataset.count=s.count;lab.dataset.step=step;lab.dataset.done=String(step===states.length-1);
   lab.querySelector('[data-inv-left]').textContent='L 剩余：'+array(data.left.slice(s.i))+'；i='+s.i;
   lab.querySelector('[data-inv-right]').textContent='R 剩余：'+array(data.right.slice(s.j))+'；j='+s.j;
   lab.querySelector('[data-inv-output]').textContent='本次合并输出：'+array(s.out);
   lab.querySelector('[data-inv-state]').textContent=s.message+' 本步 +'+s.added+'，跨区间累计 '+s.count+'。';next.disabled=step===states.length-1;
   lab.querySelectorAll('[data-inv-case]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.invCase===key)));
  }
  function reset(name){key=name;step=0;states=mergeTrace(cases[key].left,cases[key].right);render();}
  next.addEventListener('click',()=>{if(step<states.length-1){step++;render();}});lab.querySelector('[data-inv-reset]').addEventListener('click',()=>reset(key));
  lab.querySelectorAll('[data-inv-case]').forEach(b=>b.addEventListener('click',()=>reset(b.dataset.invCase)));reset('example');
 }));
})();
