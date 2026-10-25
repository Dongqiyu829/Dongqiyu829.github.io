const {fs,path,root,startServer,launch,pages,manifest,save}=require('./test-utils.cjs');
let HtmlValidate;
try { ({HtmlValidate}=require('html-validate')); }
catch { ({HtmlValidate}=require('../work/quality/node_modules/html-validate')); }
const assert=require('assert/strict');
let browser,server;
const result={passed:[],failed:[],consoleErrors:[],pageErrors:[],viewports:[1280,390,320]};
async function test(name,fn){if(process.env.COURSE_TEST_FILTER&&!name.includes(process.env.COURSE_TEST_FILTER))return;try{await fn();result.passed.push(name);console.log('PASS '+name);}catch(error){result.failed.push({name,error:error.stack});console.error('FAIL '+name+': '+error.message);}}
const key='comp3711h-learning-progress-v1';
const publishedCount=manifest.lessons.filter(l=>l.published).length;
const l1='/lessons/0001-binary-search-loop-invariant.html',l2='/lessons/0002-asymptotic-analysis.html',l3='/lessons/0003-doubling-work-sum.html',l4='/lessons/0004-merge-sort-recursion-tree.html';
function mockHTML(echo=true){return '<pre id="code"></pre><script>window.messages=0;window.addEventListener("message",e=>{if(e.data.eventType!=="populateCode")return;window.messages++;document.querySelector("pre").textContent=e.data.files[0].content;document.body.dataset.language=e.data.language;'+(echo?'parent.postMessage(e.data,"*");':'')+'});</script>';}
(async()=>{
  const local=await startServer();server=local.server;const origin=local.origin;
  browser=await launch();
  async function open(options={}){
    const context=await browser.newContext(options.context||{});
    const page=await context.newPage();
    page.on('pageerror',e=>result.pageErrors.push(e.message));
    page.on('console',m=>{if(m.type()==='error'&&!options.expectedNetworkFailure)result.consoleErrors.push(m.text());});
    if(options.mode==='blocked')await page.route('https://onecompiler.com/**',r=>r.abort());
    else await page.route('https://onecompiler.com/**',r=>r.fulfill({contentType:'text/html',body:mockHTML(options.mode!=='noecho')}));
    return {context,page};
  }
  await test('all '+pages.length+' pages at desktop / 390px / 320px; no overflow or duplicate IDs',async()=>{
    const {context,page}=await open();
    for(const width of result.viewports){
      await page.setViewportSize({width,height:width===1280?900:844});
      for(const relative of pages){
        const response=await page.goto(origin+'/'+relative);assert.equal(response.status(),200,relative);
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),relative+' '+width);
        const ids=await page.locator('[id]').evaluateAll(es=>es.map(e=>e.id));assert.equal(new Set(ids).size,ids.length,relative);
        assert.equal(await page.locator('h1').count(),1);
      }
    }
    await page.goto(origin+'/index.html');await page.screenshot({path:path.join(root,'work/qa/home-320.png')});
    await page.setViewportSize({width:1280,height:900});await page.screenshot({path:path.join(root,'work/qa/home-desktop.png')});
    await context.close();
  });
  await test('published metadata, legacy duplicates and unknown IDs preserve records',async()=>{
    const {context,page}=await open();
    await page.addInitScript(k=>localStorage.setItem(k,JSON.stringify(['lesson-0001','lesson-0001','future-id'])),key);
    await page.goto(origin+'/index.html');
    assert.equal(await page.locator('[data-course-progress]').innerText(),'1 / '+publishedCount);
    assert.equal(await page.locator('[data-published-count]').innerText(),String(publishedCount));
    assert((await page.locator('[data-planned-count]').allTextContents()).every(text=>text==='24'));
    assert.deepEqual(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key),['lesson-0001','lesson-0001','future-id']);
    // Remove init script by using a fresh page in the same context for the user toggle.
    await page.locator('[data-lesson-id="lesson-0001"] a').click();
    await page.locator('[data-complete-lesson]').click();
    assert.deepEqual(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key),['future-id']);
    await context.close();
  });
  await test('topic count and published page count are independent metadata',async()=>{
    const {context,page}=await open();
    await page.addInitScript(data=>document.addEventListener('DOMContentLoaded',()=>{
      const node=document.querySelector('[data-course-manifest]');
      data.lessons.push({...data.lessons[0],id:'lesson-extra',path:'lessons/part-two.html'});
      node.textContent=JSON.stringify(data);
    }),manifest);
    await page.goto(origin+'/index.html');assert.equal(await page.locator('[data-course-progress]').innerText(),'0 / '+(publishedCount+1));assert((await page.locator('[data-planned-count]').allTextContents()).every(text=>text==='24'));
    await context.close();
  });
  for(const [name,raw]of[['non-array','{}'],['null','null'],['corrupt','{broken']])await test('malformed legacy '+name+' does not crash or overwrite',async()=>{
    const {context,page}=await open();await page.addInitScript(({key,raw})=>localStorage.setItem(key,raw),{key,raw});
    await page.goto(origin+l2);await page.locator('[data-complete-lesson]').click();
    assert.match(await page.locator('[data-completion-status]').innerText(),/临时记录/);
    assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),raw);
    await page.locator('[data-quiz] [data-answer="correct"]').first().click();assert(await page.locator('.feedback.correct').first().isVisible());await context.close();
  });
  await test('storage denied: completion and quizzes stay interactive',async()=>{
    const {context,page}=await open();await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Denied','SecurityError');}}));
    await page.goto(origin+l2);await page.locator('[data-complete-lesson]').click();assert.match(await page.locator('[data-completion-status]').innerText(),/临时记录/);
    await page.locator('[data-quiz] [data-answer="correct"]').first().click();assert(await page.locator('.feedback.correct').first().isVisible());await context.close();
  });
  await test('quota failure preserves persisted legacy data and allows temporary toggle',async()=>{
    const {context,page}=await open();await page.addInitScript(k=>{
      localStorage.setItem(k,'["lesson-0001"]');Storage.prototype.setItem=()=>{throw new DOMException('Quota','QuotaExceededError');};
    },key);await page.goto(origin+l2);await page.locator('[data-complete-lesson]').click();
    assert.match(await page.locator('[data-completion-status]').innerText(),/临时记录/);assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),'["lesson-0001"]');await context.close();
  });
  await test('all predictions, explorations and independent responses do not auto-complete',async()=>{
    const {context,page}=await open({context:{viewport:{width:390,height:844}}});
    for(const lesson of [l1,l2,l3,l4]){
      await page.goto(origin+lesson);
      for(const quiz of await page.locator('[data-quiz]').all()){
        await quiz.locator('[data-answer="incorrect"]').first().click();assert.match(await quiz.locator('[data-feedback-output]').getAttribute('class'),/incorrect/);
        await quiz.locator('[data-answer="correct"]').click();assert.match(await quiz.locator('[data-feedback-output]').getAttribute('class'),/correct/);
      }
      const response=page.locator('[data-reflection]');assert.equal(await response.count(),1);
      await response.locator('textarea').fill('我的推导：先写条件，再给出理由。');
      await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.__copied=text;}},configurable:true});});
      await response.locator('[data-copy-response]').click();assert.match(await response.locator('[data-reflection-status]').innerText(),/尚未发送/);
      assert.match(await page.evaluate(()=>window.__copied),/我的推导/);
      await page.locator('.self-check input').first().check();
      assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),null);
    }
    await page.goto(origin+l1);
    const demo=page.locator('[data-binary-demo]');
    for(const [kind,answer]of[['duplicate',1],['missing',3],['below',0],['above',5],['empty',0]]){
      await demo.locator('[data-case="'+kind+'"]').click();let limit=10;
      while(await demo.getAttribute('data-done')!=='true'){assert(--limit>0);await demo.locator('[data-demo-next]').click();}
      assert.equal(Number(await demo.getAttribute('data-lo')),answer);
    }
    await page.goto(origin+l3);const sum=page.locator('[data-work-sum-lab]');
    for(const [n,total]of[[8,15],[10,15],[16,31],[0,0]]){await sum.locator('[data-sum-size="'+n+'"]').click();let limit=10;while(await sum.getAttribute('data-done')!=='true'){assert(--limit>0);await sum.locator('[data-sum-next]').click();}assert.equal(Number(await sum.getAttribute('data-total')),total);}
    // Browser serialization expands valid boolean attributes to =""; source files stay strict.
    const validator=new HtmlValidate({extends:['html-validate:recommended'],rules:{'attribute-boolean-style':'off'}});
    const validation=await validator.validateString(await page.content());
    if(!validation.valid)save('rendered-html-errors.json',validation.results.map(r=>r.messages));
    assert(validation.valid,'Rendered demo DOM invalid');
    await context.close();
  });
  await test('mock acknowledgement, rapid language switches, old-source rejection, reset/reload',async()=>{
    const {context,page}=await open();await page.goto(origin+l1);const lab=page.locator('[data-compiler-lab]');await lab.locator('iframe').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>document.querySelector('[data-compiler-lab]').dataset.editorState==='confirmed');
    await page.evaluate(()=>{window.__oldWindow=document.querySelector('[data-lab-frame]').contentWindow;});
    await lab.locator('[data-lab-language="python"]').click();await lab.locator('[data-lab-language="cpp"]').click();
    await page.waitForFunction(()=>document.querySelector('[data-compiler-lab]').dataset.editorState==='confirmed');
    const frame=page.frames().find(f=>f.url().includes('/embed/cpp'));assert.equal(await frame.evaluate(()=>window.messages),1);
    await lab.locator('[data-lab-starter]').click();await page.waitForFunction(()=>document.querySelector('[data-compiler-lab]').dataset.editorState==='confirmed');
    assert.equal(await frame.evaluate(()=>window.messages),2);
    await lab.locator('[data-lab-reload]').click();await page.waitForFunction(()=>document.querySelector('[data-compiler-lab]').dataset.editorState==='confirmed');
    await page.reload();await page.locator('[data-lab-frame]').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('[data-compiler-lab]').dataset.editorState==='confirmed');
    await context.close();
  });
  await test('wrong origin/source/language cannot confirm; no echo times out without hiding fallback',async()=>{
    const {context,page}=await open({mode:'noecho'});await page.goto(origin+l3);const lab=page.locator('[data-compiler-lab]');await lab.locator('iframe').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>document.querySelector('[data-compiler-lab]').dataset.editorState==='waiting');
    await page.evaluate(()=>{
      const frame=document.querySelector('[data-lab-frame]');const code=document.querySelector('[data-program-code="cpp"]').textContent;
      for(const [origin,source,language]of[['https://evil.test',frame.contentWindow,'cpp'],['https://onecompiler.com',window,'cpp'],['https://onecompiler.com',frame.contentWindow,'python']])window.dispatchEvent(new MessageEvent('message',{origin,source,data:{language,files:[{content:code}]}}));
    });
    assert.equal(await lab.getAttribute('data-editor-state'),'waiting');
    await page.waitForFunction(()=>document.querySelector('[data-compiler-lab]').dataset.editorState==='unconfirmed',null,{timeout:12000});
    assert.match(await lab.locator('[data-lab-status]').innerText(),/不能确认/);assert(await lab.locator('[data-lab-fallback-panel]').evaluate(el=>el.open));
    assert.match(await lab.locator('[data-program-code="python"]').textContent(),/tests =/);
    await context.close();
  });
  await test('blocked third-party editor and JSON requests: complete C++/Python remain copyable',async()=>{
    const {context,page}=await open({mode:'blocked',expectedNetworkFailure:true});await page.route('**/*programs.json*',r=>r.abort());
    for(const lesson of [l1,l3,l4]){
      await page.goto(origin+lesson);if(lesson===l4)await page.locator('[data-compiler-lab]').evaluate(el=>el.parentElement.open=true);const lab=page.locator('[data-compiler-lab]');await lab.locator('iframe').scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>['unconfirmed','unavailable'].includes(document.querySelector('[data-compiler-lab]').dataset.editorState),null,{timeout:20000});
      const file=lesson===l1?'binary-programs.json':lesson===l3?'doubling-programs.json':'merge-programs.json';const programs=JSON.parse(fs.readFileSync(path.join(root,'assets',file),'utf8'));
      for(const lang of ['cpp','python'])assert.equal(await lab.locator('[data-program-code="'+lang+'"]').textContent(),programs[lang]);
      await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw new Error('Denied');}},configurable:true}));
      await lab.locator('[data-copy-starter]').click();assert.match(await lab.locator('[data-copy-status]').innerText(),/手动复制/);
    }
    await context.close();
  });
  await test('JavaScript disabled: lesson text, native disclosures and both complete code banks readable',async()=>{
    const {context,page}=await open({context:{javaScriptEnabled:false,viewport:{width:390,height:844}}});
    for(const lesson of [l1,l2,l3,l4]){
      await page.goto(origin+lesson);assert.equal(await page.locator('h1').count(),1);assert(await page.locator('main').innerText());
      if(lesson!==l2){if(lesson===l4)await page.getByText('可选实践 · 在 C++ / Python 中补完 merge 并核对计数',{exact:true}).click();await page.locator('[data-lab-fallback-panel] summary').click();assert(await page.locator('[data-program-code="cpp"]').isVisible());assert(await page.locator('[data-program-code="python"]').isVisible());}
      assert(await page.locator('a[href="../index.html"]').first().isVisible());
    }
    await context.close();
  });
  await test('Split/Merge: original inputs, sorted child returns, own work, edge sizes and navigation',async()=>{
    const {verifyTree}=require('./recursion-tree-test.cjs');
    const {context,page}=await open();
    for(const width of [1280,390,320]){
      await page.setViewportSize({width,height:844});await page.goto(origin+l4);
      await verifyTree(page,{captureDir:path.join(root,'work/qa')});
    }
    const validator=new HtmlValidate({extends:['html-validate:recommended'],rules:{'attribute-boolean-style':'off'}});
    // Playwright screenshots can leave empty style attributes on caret-bearing inputs.
    const rendered=await validator.validateString((await page.content()).replace(/\sstyle=""/g,''));
    if(!rendered.valid)save('split-merge-rendered-errors.json',rendered.results.map(r=>r.messages));
    assert(rendered.valid);
    await page.locator('[data-complete-lesson]').click();assert.equal(await page.locator('[data-complete-lesson]').getAttribute('aria-pressed'),'true');
    await page.locator('a[href="../index.html"]').first().click();
    await page.waitForFunction(count=>document.querySelector('[data-course-progress]').textContent==='1 / '+count,publishedCount);
    await page.locator('[data-lesson-id="lesson-0004"] a').click();await page.locator('.lesson-nav a').first().click();assert(page.url().endsWith(l3));await page.locator('.lesson-nav-next').click();assert(page.url().endsWith(l4));
    await context.close();
  });
  await test('reference cards in print media remain readable without horizontal overflow',async()=>{
    const {context,page}=await open({context:{viewport:{width:800,height:1100}}});await page.emulateMedia({media:'print'});
    for(const relative of pages.filter(p=>p.startsWith('reference/'))){await page.goto(origin+'/'+relative);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),relative);}
    await page.goto(origin+'/reference/doubling-sums.html');await page.screenshot({path:path.join(root,'work/qa/reference-print.png'),fullPage:true});await context.close();
  });
  assert.equal(result.pageErrors.length,0,'Page errors');assert.equal(result.consoleErrors.length,0,'Unexpected console errors');
  save('browser-results.json',result);if(result.failed.length)process.exitCode=1;
})().catch(e=>{result.failed.push({name:'suite',error:e.stack});save('browser-results.json',result);console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));});
