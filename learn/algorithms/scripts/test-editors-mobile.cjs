const {fs,path,root,startServer,launch,save}=require('./test-utils.cjs');
const assert=require('assert/strict');
const {complete}=require('./merge-test-utils.cjs');
const {complete:completeMaster}=require('./master-test-utils.cjs');
let browser,server,page;
(async()=>{
  const local=await startServer();server=local.server;const origin=process.env.COURSE_TEST_ORIGIN||local.origin;
  browser=await launch();
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  page=await context.newPage();const results=[];
  const cases=[['0001-binary-search-loop-invariant.html','binary-programs.json'],['0003-doubling-work-sum.html','doubling-programs.json'],['0004-merge-sort-recursion-tree.html','merge-programs.json'],['0005-master-theorem.html','master-programs.json']];
  for(const [lesson,file]of cases.filter(([name])=>!process.env.COURSE_EDITOR_LESSON||name.startsWith(process.env.COURSE_EDITOR_LESSON))){
    await page.goto(origin+'/lessons/'+lesson);if(/^(0004|0005)/.test(lesson))await page.locator('[data-compiler-lab]').evaluate(el=>el.parentElement.open=true);const lab=page.locator('[data-compiler-lab]');
    for(const language of ['cpp','python']){
      if(language==='python')await lab.locator('[data-lab-language="python"]').tap();
      await lab.locator('[data-lab-frame]').scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>document.querySelector('[data-compiler-lab]').dataset.editorState==='confirmed',null,{timeout:25000});
      const box=await lab.locator('iframe').boundingBox();assert(box.x>=0&&box.x+box.width<=391);assert(box.height>=500);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      const frame=page.frames().find(f=>f.url().startsWith('https://onecompiler.com/embed/'+language));
      assert(await frame.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Third party frame root overflows');
      await page.screenshot({path:path.join(root,'work/qa/mobile-'+lesson.slice(0,4)+'-'+language+'-before.png')});
      console.log('Mobile editor fields '+JSON.stringify(await frame.locator('textarea,[contenteditable]').evaluateAll(es=>es.map(e=>({tag:e.tagName,label:e.getAttribute('aria-label'),role:e.getAttribute('role'),visible:!!(e.offsetWidth&&e.offsetHeight),className:e.className})))));
      const editor=frame.locator('textarea.ace_text-input, textarea.inputarea').first();await editor.waitFor();await editor.tap();
      await page.keyboard.insertText(' ');await editor.press('ControlOrMeta+Z');
      await page.screenshot({path:path.join(root,'work/qa/mobile-'+lesson.slice(0,4)+'-'+language+'.png')});
      const programs=JSON.parse(fs.readFileSync(path.join(root,'assets',file),'utf8'));let code=programs[language];
      if(lesson.startsWith('0001'))code=language==='cpp'?code.replace('throw runtime_error("TODO 1: 替换为 lo 的更新");','lo=mid+1;').replace('throw runtime_error("TODO 2: 替换为 hi 的更新");','hi=mid;'):code.replace('raise NotImplementedError("TODO 1: 替换为 lo 的更新")','lo=mid+1').replace('raise NotImplementedError("TODO 2: 替换为 hi 的更新")','hi=mid');
      else if(lesson.startsWith('0004'))code=complete(language,code);
        else if(lesson.startsWith('0005'))code=completeMaster(language,code);
      else code=language==='cpp'?code.replace('// TODO: 每执行一次 work，让 count 加 1','++count;'):code.replace('pass  # TODO: 每执行一次 work，让 count 加 1','count += 1');
      await page.evaluate(({language,code})=>document.querySelector('[data-lab-frame]').contentWindow.postMessage({eventType:'populateCode',language,files:[{name:language==='cpp'?'main.cpp':'main.py',content:code}]},'https://onecompiler.com'),{language,code});
      await page.waitForTimeout(600);await lab.locator('[data-lab-run]').tap();
      await frame.getByText('8/8 passed',{exact:false}).first().waitFor({timeout:30000});
      results.push({lesson,language,width:390,touchFocus:true,noRootOverflow:true,result:'8/8 passed'});console.log('PASS mobile '+lesson+' '+language+' focus/controls/8 tests');
      assert.equal(await lab.locator('[data-lab-open]').getAttribute('href'),'https://onecompiler.com/'+language);
    }
  }
  save('mobile-editors-results.json',{physicalDevice:false,softwareKeyboardTested:false,results});await context.close();
})().catch(async e=>{if(page)await page.screenshot({path:path.join(root,'work/qa/mobile-editor-error.png')});console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));});
