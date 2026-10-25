const {fs,path,root,startServer,launch,save}=require('./test-utils.cjs');
const assert=require('assert/strict');
let browser,server,latestResult;
(async()=>{
  const local=await startServer();server=local.server;
  const origin=process.env.COURSE_TEST_ORIGIN||local.origin;
  browser=await launch();
  const result={mode:process.env.COURSE_TEST_ORIGIN?'deployed':'local-page-real-service',editors:[],consoleErrors:[],pageErrors:[]};
  latestResult=result;
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  page.on('console',message=>{if(message.type()==='error')result.consoleErrors.push({text:message.text(),location:message.location()});});
  page.on('pageerror',error=>result.pageErrors.push({text:error.message,stack:error.stack}));
  await page.addInitScript(()=>{window.__echoes=[];window.addEventListener('message',e=>{if(e.origin==='https://onecompiler.com')window.__echoes.push({language:e.data?.language,files:e.data?.files?.map(f=>({name:f.name,length:f.content?.length})),keys:Object.keys(e.data||{})});});});
  for(const [lesson,programFile]of[['0001-binary-search-loop-invariant.html','binary-programs.json'],['0003-doubling-work-sum.html','doubling-programs.json']]){
    const programs=JSON.parse(fs.readFileSync(path.join(root,'assets',programFile),'utf8'));
    await page.goto(origin+'/lessons/'+lesson);
    const lab=page.locator('[data-compiler-lab]');
    await lab.locator('iframe').scrollIntoViewIfNeeded();
    for(const language of ['cpp','python']){
      const record={lesson,language,initialCode:false,acknowledged:false,run:false};result.editors.push(record);
      if(language==='python')await lab.locator('[data-lab-language="python"]').click();
      await lab.locator('iframe').scrollIntoViewIfNeeded();
      try {
        await page.waitForFunction(()=>['confirmed','unconfirmed','unavailable'].includes(document.querySelector('[data-compiler-lab]').dataset.editorState),null,{timeout:30000});
        record.state=await lab.getAttribute('data-editor-state');record.acknowledged=record.state==='confirmed';
        record.status=await lab.locator('[data-lab-status]').innerText();
        const frame=page.frames().find(f=>f.url().startsWith('https://onecompiler.com/embed/'+language));
        assert(frame,'Compiler frame not present');
        await frame.getByRole('textbox',{name:'Editor content',exact:true}).waitFor({timeout:20000});
        const needle=language==='cpp'?(lesson.startsWith('0001')?'int lowerBound':'long long countWork'):(lesson.startsWith('0001')?'def lower_bound':'def count_work');
        await frame.waitForFunction(value=>document.body.innerText.replace(/\u00a0/g,' ').includes(value),needle,{timeout:10000});
        const visible=(await frame.locator('body').innerText()).replace(/\u00a0/g,' ');
        record.initialCode=visible.includes(needle);
        assert(record.initialCode,'Expected starter not visible');
        let code=programs[language];
        if(lesson.startsWith('0001'))code=language==='cpp'?code.replace('throw runtime_error("TODO 1: 替换为 lo 的更新");','lo = mid + 1;').replace('throw runtime_error("TODO 2: 替换为 hi 的更新");','hi = mid;'):code.replace('raise NotImplementedError("TODO 1: 替换为 lo 的更新")','lo = mid + 1').replace('raise NotImplementedError("TODO 2: 替换为 hi 的更新")','hi = mid');
        else code=language==='cpp'?code.replace('// TODO: 每执行一次 work，让 count 加 1','++count;'):code.replace('pass  # TODO: 每执行一次 work，让 count 加 1','count += 1');
        await page.evaluate(({code,language})=>document.querySelector('[data-lab-frame]').contentWindow.postMessage({eventType:'populateCode',language,files:[{name:language==='cpp'?'main.cpp':'main.py',content:code}]},'https://onecompiler.com'),{code,language});
        await page.waitForTimeout(600);
        await lab.locator('[data-lab-run]').click();
        await frame.getByText('8/8 passed',{exact:false}).first().waitFor({timeout:30000});
        record.run=true;record.result='8/8 passed';
        await lab.locator('[data-lab-starter]').click();
        await page.waitForFunction(()=>document.querySelector('[data-compiler-lab]').dataset.editorState==='confirmed',null,{timeout:15000});
        record.manualReset=true;
        await lab.locator('[data-lab-reload]').click();
        await page.waitForFunction(()=>document.querySelector('[data-compiler-lab]').dataset.editorState==='confirmed',null,{timeout:20000});
        record.frameReload=true;
        console.log('PASS '+lesson+' '+language+': visible starter, echo='+record.acknowledged+', real run 8/8, reset and reload');
      } catch(error){record.error=error.message;console.error('FAIL '+lesson+' '+language+': '+error.message);await page.screenshot({path:path.join(root,'work/qa',lesson+'-'+language+'-error.png')});}
    }
    await page.reload();await page.locator('[data-lab-frame]').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>document.querySelector('[data-compiler-lab]').dataset.editorState==='confirmed',null,{timeout:25000});
    assert.equal(await page.locator('[data-lab-language="cpp"]').getAttribute('aria-pressed'),'true');
    result.editors.filter(r=>r.lesson===lesson).forEach(r=>{r.refreshDefaultsToCpp=true;});
  }
  result.echoes=await page.evaluate(()=>window.__echoes);
  save('real-editors-results.json',result);
  assert(result.editors.every(r=>r.initialCode&&r.acknowledged&&r.run&&r.manualReset&&r.frameReload&&r.refreshDefaultsToCpp),'One or more real editor checks failed');
  assert.equal(result.pageErrors.filter(e=>!e.stack?.includes('onecompiler.com')).length,0,'App page error');
})().catch(e=>{if(latestResult)latestResult.suiteError=e.message;console.error(e);process.exitCode=1;}).finally(async()=>{if(latestResult)save('real-editors-results.json',latestResult);if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));});
