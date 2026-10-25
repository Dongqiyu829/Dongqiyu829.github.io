(function(){
  'use strict';
  function parseNumber(raw){const s=String(raw).trim(),p=s.split('/');if(!s)return NaN;if(p.length===1)return Number(s);if(p.length===2&&p.every(n=>n.trim()!==''&&Number.isFinite(Number(n)))&&Number(p[1])!==0)return Number(p[0])/Number(p[1]);return NaN;}
  function transition(state,event){
    if(event.type==='mode')return {mode:event.mode,revealed:false,selected:null};
    if(event.type==='change'||event.type==='retry')return {...state,revealed:false,selected:null};
    if(event.type==='select')return {...state,selected:event.value};
    if(event.type==='reveal')return {...state,revealed:true};
    return state;
  }
  const hidden=s=>s.mode==='challenge'&&!s.revealed;
  if(typeof module!=='undefined')module.exports={parseNumber,transition,hidden};
  if(typeof document==='undefined')return;
  function challenge(lab,config){
    let state={mode:'explore',revealed:false,selected:null},asked='';
    const box=document.createElement('div');box.className='study-mode';
    box.innerHTML='<div role="group" aria-label="学习方式"><button type="button" data-study-mode="explore" aria-pressed="true">自由探索</button><button type="button" data-study-mode="challenge" aria-pressed="false">可选挑战模式</button></div><div data-study-panel hidden><p data-study-question></p><p>先判断，再提交；答错也会显示解释，随时可返回自由探索。</p><div data-study-choices role="group" aria-label="我的预测"></div>'+(config.numeric?'<label class="control">'+config.numeric+'<input type="text" inputmode="decimal" aria-label="挑战预测数值" data-study-number></label>':'')+'<button type="button" data-study-submit disabled>'+(config.submitLabel||'提交预测，显示结果')+'</button><button type="button" data-study-retry>重新预测</button><p class="feedback" data-study-feedback aria-live="polite"></p></div>';
    lab.querySelector('.lab-head').append(box);
    const choices=box.querySelector('[data-study-choices]'),feedback=box.querySelector('[data-study-feedback]');
    config.choices.forEach(([value,label])=>{const button=document.createElement('button');button.type='button';button.dataset.studyChoice=value;button.textContent=label;button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>{state=transition(state,{type:'select',value});sync();});choices.append(button);});
    function sync(){box.querySelector('[data-study-panel]').hidden=state.mode!=='challenge';box.querySelectorAll('[data-study-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.studyMode===state.mode)));box.querySelectorAll('[data-study-choice]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.studyChoice===state.selected));b.disabled=state.revealed;});box.querySelector('[data-study-question]').textContent=state.revealed?asked:config.question();box.querySelector('[data-study-submit]').disabled=state.selected===null||state.revealed;const field=box.querySelector('[data-study-number]');if(field)field.disabled=state.revealed;}
    function clear(){asked='';feedback.textContent='';feedback.className='feedback';const field=box.querySelector('[data-study-number]');if(field)field.value='';}
    box.querySelectorAll('[data-study-mode]').forEach(b=>b.addEventListener('click',()=>{state=transition(state,{type:'mode',mode:b.dataset.studyMode});clear();sync();config.render();}));
    box.querySelector('[data-study-retry]').addEventListener('click',()=>{state=transition(state,{type:'retry'});clear();sync();config.render();});
    box.querySelector('[data-study-submit]').addEventListener('click',()=>{
      const raw=box.querySelector('[data-study-number]')?.value||'',result=config.assess(state.selected,raw);
      if(result.incomplete){feedback.className='feedback incorrect';feedback.textContent=result.explanation;return;}
      asked=config.question();state=transition(state,{type:'reveal'});config.commit?.(result);
      feedback.className='feedback '+(result.correct?'correct':'incorrect');feedback.textContent=(result.correct?'预测正确。':'预测需要修正。')+result.explanation;
      sync();config.render();
    });
    sync();
    return {hidden:()=>hidden(state),active:()=>state.mode==='challenge',changed(){state=transition(state,{type:'change'});clear();sync();},sync};
  }
  function basisControls(controls){
    const first=document.createElement('div'),basic=document.createElement('details'),full=document.createElement('details');
    first.innerHTML='<h4>① 先选三个典型方向组</h4>';basic.innerHTML='<summary>② 常用控制：目标与零向量</summary>';full.innerHTML='<summary>③ 完整探索：输入分量和自由用量</summary>';
    controls.querySelectorAll('[data-basis-preset]').forEach((b,i)=>(i<3?first:basic).append(b));first.append(controls.querySelector('[data-basis-reset]'));
    basic.append(controls.querySelector('.number-fields'));controls.querySelectorAll('[data-target-preset]').forEach(b=>basic.append(b));
    controls.querySelectorAll(':scope > label').forEach(el=>full.append(el));controls.replaceChildren(first,basic,full);
  }
  window.LAStudy={parseNumber,challenge,basisControls};
})();
