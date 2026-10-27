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
const l1='/lessons/0001-binary-search-loop-invariant.html',l2='/lessons/0002-asymptotic-analysis.html',l3='/lessons/0003-doubling-work-sum.html',l4='/lessons/0004-merge-sort-recursion-tree.html',l5='/lessons/0005-master-theorem.html',l6='/lessons/0006-counting-inversions.html';
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
    for(const lesson of [l1,l2,l3,l4,l5,l6]){
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
    for(const lesson of [l1,l3,l4,l5,l6]){
      await page.goto(origin+lesson);if(lesson===l4||lesson===l5||lesson===l6)await page.locator('[data-compiler-lab]').evaluate(el=>el.parentElement.open=true);const lab=page.locator('[data-compiler-lab]');await lab.locator('iframe').scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>['unconfirmed','unavailable'].includes(document.querySelector('[data-compiler-lab]').dataset.editorState),null,{timeout:20000});
      const file=lesson===l1?'binary-programs.json':lesson===l3?'doubling-programs.json':lesson===l4?'merge-programs.json':lesson===l5?'master-programs.json':'inversion-programs.json';const programs=JSON.parse(fs.readFileSync(path.join(root,'assets',file),'utf8'));
      for(const lang of ['cpp','python'])assert.equal(await lab.locator('[data-program-code="'+lang+'"]').textContent(),programs[lang]);
      await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw new Error('Denied');}},configurable:true}));
      await lab.locator('[data-copy-starter]').click();assert.match(await lab.locator('[data-copy-status]').innerText(),/手动复制/);
    }
    await context.close();
  });
  await test('JavaScript disabled: lesson text, native disclosures and both complete code banks readable',async()=>{
    const {context,page}=await open({context:{javaScriptEnabled:false,viewport:{width:390,height:844}}});
    for(const lesson of [l1,l2,l3,l4,l5,l6]){
      await page.goto(origin+lesson);assert.equal(await page.locator('h1').count(),1);assert(await page.locator('main').innerText());
      if(lesson!==l2){if(lesson===l4)await page.getByText('可选实践 · 在 C++ / Python 中补完 merge 并核对计数',{exact:true}).click();if(lesson===l5)await page.getByText('可选编码 · 按递归结构数工作，别只计算闭式',{exact:true}).click();if(lesson===l6)await page.getByText('可选实践 · C++ / Python 中完成一次批量计数',{exact:true}).click();await page.locator('[data-lab-fallback-panel] summary').click();assert(await page.locator('[data-program-code="cpp"]').isVisible());assert(await page.locator('[data-program-code="python"]').isVisible());}
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
  await test('Lesson 05 level models at three widths; leaves, reset and active controls',async()=>{
    const {context,page}=await open();
    for(const width of [1280,390,320]){
      await page.setViewportSize({width,height:844});await page.goto(origin+l5);const lab=page.locator('[data-level-work]');
      for(const n of [1,8,16])for(const power of [0,1,2]){
        await lab.locator('[data-level-size="'+n+'"]').click();await lab.locator('[data-level-power="'+power+'"]').click();
        const k=Math.log2(n);let sum=0;
        for(let d=0;d<=k;d++){if(d)await lab.locator('[data-level-next]').click();const work=d===k?n:2**d*(n/2**d)**power;sum+=work;assert.equal(Number(await lab.locator('[data-depth="'+d+'"]').getAttribute('data-work')),work);assert.equal(Number(await lab.getAttribute('data-total')),sum);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
        assert(await lab.locator('[data-level-next]').isDisabled());assert.equal(await lab.locator('[data-level-power="'+power+'"]').getAttribute('aria-pressed'),'true');await lab.locator('[data-level-reset]').click();assert.equal(await lab.locator('[data-depth]').count(),1);
      }
      await page.screenshot({path:path.join(root,'work/qa/lesson05-'+width+'.png')});
    }
    await context.close();
  });
  await test('Research dates and status readable, independent responses never alter course records',async()=>{
    const {context,page}=await open({context:{viewport:{width:390,height:844}}});const before='["lesson-0001","future-id"]';
    await page.goto(origin+'/research/index.html');await page.evaluate(({key,before})=>localStorage.setItem(key,before),{key,before});
    for(const file of ['index.html','0001-eth-claim.html']){
      await page.goto(origin+'/research/'+file);assert.equal(await page.locator('[data-research-status="independent-review"]').count(),1);assert.equal(await page.locator('[data-complete-lesson]').count(),0);assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),before);
    }
    await page.locator('textarea').fill('N=n²，所以 2 的根号 N 次方等于 2ⁿ。');
    await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.__researchCopy=text;}},configurable:true}));await page.locator('[data-copy-response]').click();assert.match(await page.locator('[data-reflection-status]').innerText(),/尚未发送/);assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),before);
    await page.goto(origin+'/index.html');assert.equal(await page.locator('[data-course-progress]').innerText(),'1 / '+publishedCount);await context.close();
  });
  await test('inversion merge: exact step additions, ties, negatives, empty, reset and navigation',async()=>{
    const {context,page}=await open();
    for(const width of [1280,390,320]){await page.setViewportSize({width,height:844});await page.goto(origin+l6);const lab=page.locator('[data-inversion-merge]');
      for(const [name,adds]of[['example',[2,0,1,0,0]],['duplicates',[0,0,0,0,0]],['negative',[2,0,1,0,0]],['reverse',[2,2,2,0,0]],['empty',[0]],['equal',[0,0,0]]]){
        await lab.locator('[data-inv-case="'+name+'"]').click();assert.equal(await lab.getAttribute('data-count'),'0');let count=0;
        for(const add of adds){await lab.locator('[data-inv-next]').click();count+=add;assert.equal(Number(await lab.getAttribute('data-count')),count);assert((await lab.locator('[data-inv-state]').innerText()).includes('本步 +'+add));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
        assert(await lab.locator('[data-inv-next]').isDisabled());assert.equal(await lab.getAttribute('data-done'),'true');await lab.locator('[data-inv-reset]').click();assert.equal(await lab.getAttribute('data-step'),'0');
      }
      await page.screenshot({path:path.join(root,'work/qa/inversions-'+width+'.png')});
    }
    const validator=new HtmlValidate({extends:['html-validate:recommended'],rules:{'attribute-boolean-style':'off'}});assert((await validator.validateString((await page.content()).replace(/\sstyle=""/g,''))).valid);
    await page.locator('[data-complete-lesson]').click();await page.locator('a[href="../index.html"]').first().click();await page.waitForFunction(n=>document.querySelector('[data-course-progress]').textContent==='1 / '+n,publishedCount);
    await page.locator('[data-lesson-id="lesson-0005"] a').click();await page.locator('.lesson-nav-next').click();assert(page.url().endsWith(l6));await page.locator('.lesson-nav-next').click();assert(page.url().endsWith('/reference/course-route.html'));await context.close();
  });
  await test('drafts opt-in save/load/delete, page isolation, no auto-load or completion mutation',async()=>{
    const {context,page}=await open();await page.goto(origin+l6);const box=page.locator('[data-reflection]');const before='["lesson-0001","future-id"]';await page.evaluate(({key,before})=>localStorage.setItem(key,before),{key,before});
    await box.locator('textarea').fill('我的草稿：相等时不能计入。');assert.deepEqual(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('comp3711h-draft-v1:'))),[]);
    await box.locator('[data-draft-action="save"]').click();assert.match(await box.locator('[data-draft-status]').innerText(),/已保存本机/);
    const draftKey=await page.evaluate(()=>Object.keys(localStorage).find(k=>k.startsWith('comp3711h-draft-v1:')));assert(draftKey);await page.reload();assert.equal(await page.locator('textarea').inputValue(),'');
    await page.locator('[data-draft-action="load"]').click();assert.equal(await page.locator('textarea').inputValue(),'我的草稿：相等时不能计入。');assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),before);
    await page.goto(origin+l5);await page.locator('[data-draft-action="load"]').click();assert.equal(await page.locator('textarea').inputValue(),'');assert.match(await page.locator('[data-draft-status]').innerText(),/没有本机草稿/);
    await page.goto(origin+l6);await page.locator('[data-draft-action="load"]').click();await page.locator('[data-draft-action="delete"]').click();assert.equal(await page.evaluate(k=>localStorage.getItem(k),draftKey),null);assert.equal(await page.locator('textarea').inputValue(),'我的草稿：相等时不能计入。');assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),before);
    await page.evaluate(k=>localStorage.setItem(k,'{broken'),draftKey);await page.locator('[data-draft-action="load"]').click();assert.match(await page.locator('[data-draft-status]').innerText(),/格式异常/);assert.equal(await page.evaluate(k=>localStorage.getItem(k),draftKey),'{broken');await context.close();
  });
  for(const mode of ['denied','quota'])await test('draft storage '+mode+' degrades without losing current answer or copy',async()=>{
    const {context,page}=await open();await page.addInitScript(mode=>{if(mode==='denied')Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Denied','SecurityError');}});else Storage.prototype.setItem=()=>{throw new DOMException('Quota','QuotaExceededError');};},mode);await page.goto(origin+l6);
    await page.locator('textarea').fill('存储失败仍能保留当前输入');await page.locator('[data-draft-action="save"]').click();assert.match(await page.locator('[data-draft-status]').innerText(),/不可用或已满/);assert.equal(await page.locator('textarea').inputValue(),'存储失败仍能保留当前输入');
    await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.__copy=text;}},configurable:true}));await page.locator('[data-copy-response]').click();assert.match(await page.evaluate(()=>window.__copy),/存储失败/);await context.close();
  });
  await test('reference cards in print media remain readable without horizontal overflow',async()=>{
    const {context,page}=await open({context:{viewport:{width:800,height:1100}}});await page.emulateMedia({media:'print'});
    for(const relative of pages.filter(p=>p.startsWith('reference/'))){await page.goto(origin+'/'+relative);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),relative);}
    await page.goto(origin+'/reference/doubling-sums.html');await page.screenshot({path:path.join(root,'work/qa/reference-print.png'),fullPage:true});await context.close();
  });
  assert.equal(result.pageErrors.length,0,'Page errors');assert.equal(result.consoleErrors.length,0,'Unexpected console errors');
  save('browser-results.json',result);if(result.failed.length)process.exitCode=1;
})().catch(e=>{result.failed.push({name:'suite',error:e.stack});save('browser-results.json',result);console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));});
