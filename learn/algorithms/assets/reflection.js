document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-reflection]").forEach(box => {
    const input = box.querySelector("textarea");
    const status = box.querySelector("[data-reflection-status]");
    const draftKey = 'comp3711h-draft-v1:' + location.pathname + ':' + box.dataset.exerciseId;
    const controls = document.createElement('div');controls.className='draft-controls';
    controls.setAttribute('role','group');controls.setAttribute('aria-label','本机草稿操作');
    const notice=document.createElement('p');notice.className='editor-note';
    notice.textContent='草稿仅在你点击保存时写入同一浏览器、本站域名的本地存储，按页面和题目区分；不上传、不跨设备同步，清除浏览器数据会丢失。载入会替换当前输入，请先复制保留。';
    const draftStatus=document.createElement('p');draftStatus.className='editor-note';draftStatus.dataset.draftStatus='';draftStatus.setAttribute('role','status');
    draftStatus.textContent='默认不保存、不自动载入；草稿与课程完成记录分开。';
    const failure=()=>{draftStatus.textContent='本机存储不可用或已满；当前输入和复制功能仍可使用，请手动复制保留。';};
    for(const [action,label] of [['save','保存本机草稿'],['load','载入草稿（替换输入）'],['delete','删除本机草稿']]){
      const button=document.createElement('button');button.type='button';button.dataset.draftAction=action;button.textContent=label;
      button.addEventListener('click',()=>{
        try {
          if(action==='save'){
            if(!input.value.trim()){draftStatus.textContent='先写下回答再保存；若要删除旧草稿，请点删除。';return;}
            localStorage.setItem(draftKey,JSON.stringify({version:1,text:input.value,savedAt:new Date().toISOString()}));
            draftStatus.textContent='已保存本机草稿；未上传，也未标记课程完成。';
          }else if(action==='load'){
            const raw=localStorage.getItem(draftKey);if(!raw){draftStatus.textContent='这道题没有本机草稿；当前输入未改变。';return;}
            let draft;try{draft=JSON.parse(raw);}catch{draftStatus.textContent='草稿格式异常，未载入、未改写；可手动删除。';return;}
            if(draft?.version!==1||typeof draft.text!=='string'){draftStatus.textContent='草稿格式不兼容，未载入、未改写；可手动删除。';return;}
            input.value=draft.text;draftStatus.textContent='已载入本机草稿，替换了当前输入；未发送、未批改。';
          }else{localStorage.removeItem(draftKey);draftStatus.textContent='已删除本机草稿；当前输入保留，课程完成记录未改动。';}
        }catch{failure();}
      });controls.append(button);
    }
    box.append(notice,controls,draftStatus);
    box.querySelector("[data-copy-response]")?.addEventListener("click", async () => {
      if (!input.value.trim()) { status.textContent = "先写下你的推导或卡住的地方，再复制。这里不会自动批改。"; input.focus(); return; }
      const text = document.title + "\n" + box.dataset.exerciseId + "\n" + input.value.trim();
      try {
        await navigator.clipboard.writeText(text);
        status.textContent = "已复制。请自行粘贴到教师对话；尚未发送，也未自动判断对错。";
      } catch {
        input.focus(); input.select();
        status.textContent = "无法自动复制，已选中回答；请使用浏览器的复制功能。回答未发送。";
      }
    });
  });
});
