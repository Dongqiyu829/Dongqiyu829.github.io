const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {spawnSync}=require('child_process');
let HtmlValidate;
try { ({HtmlValidate}=require('html-validate')); }
catch { ({HtmlValidate}=require('../work/quality/node_modules/html-validate')); }
const root=path.resolve(__dirname,'..');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'assets/course-manifest.json'),'utf8'));
assert.equal(catalog.schemaVersion,1);
assert(Number.isInteger(catalog.planning.topicCount)&&catalog.planning.topicCount>0);
assert(/^[A-Za-z0-9._-]+$/.test(catalog.release));
for(const lesson of catalog.lessons){assert(typeof lesson.id==='string'&&lesson.id);assert(typeof lesson.topicId==='string'&&lesson.topicId);assert(typeof lesson.published==='boolean');assert(typeof lesson.path==='string'&&lesson.path.startsWith('lessons/'));}
assert.equal(new Set(catalog.lessons.map(l=>l.path)).size,catalog.lessons.length,'Duplicate lesson path');
const pages=['index.html',...['lessons','reference'].flatMap(dir=>fs.readdirSync(path.join(root,dir)).filter(n=>n.endsWith('.html')).map(n=>dir+'/'+n))];
const validator=new HtmlValidate({extends:['html-validate:recommended']});
const decode=s=>s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&quot;/g,'"');
const result={pages:pages.length,htmlErrors:[],links:0,assets:0,anchors:0,outsideCourse:[],jsonFiles:0,javascriptFiles:0};
const errors=[];
(async()=>{
  const ids={};
  for(const page of pages){const html=fs.readFileSync(path.join(root,page),'utf8');ids[page]=new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]));}
  for(const page of pages){
    const html=fs.readFileSync(path.join(root,page),'utf8');
    const report=await validator.validateString(html,page);
    for(const item of report.results)for(const message of item.messages)result.htmlErrors.push({page,line:message.line,rule:message.ruleId,message:message.message});
    const data=html.match(/<script type="application\/json" data-course-manifest>([\s\S]*?)<\/script>/);
    assert(data,'Missing metadata: '+page);assert.deepEqual(JSON.parse(data[1]),catalog,'Stale metadata: '+page);
    for(const match of html.matchAll(/\s(?:href|src|data-programs-source)="([^"]+)"/g)){
      const value=decode(match[1]);if(/^(?:https?:|mailto:|data:|\/\/)/.test(value))continue;
      const url=new URL(value,'https://site/learn/algorithms/'+page);
      if(!url.pathname.startsWith('/learn/algorithms/')){result.outsideCourse.push({page,url:url.pathname});continue;}
      const relative=decodeURIComponent(url.pathname.slice('/learn/algorithms/'.length))||'index.html';
      const file=path.join(root,relative);
      if(!fs.existsSync(file)){errors.push('Missing '+page+' -> '+value);continue;}
      result.links++;
      if(/\.(?:css|js|json)$/.test(relative)){
        result.assets++;if(url.searchParams.get('v')!==catalog.release)errors.push('Stale version '+page+' -> '+value);
      }
      if(url.hash&&relative.endsWith('.html')){result.anchors++;if(!ids[relative]?.has(decodeURIComponent(url.hash.slice(1))))errors.push('Missing anchor '+page+' -> '+value);}
    }
    const source=html.match(/data-programs-source="([^"]+)"/);
    if(source){
      const file=path.resolve(root,path.dirname(page),source[1].split('?')[0]);
      const programs=JSON.parse(fs.readFileSync(file,'utf8'));
      for(const language of ['cpp','python']){
        const regex=new RegExp('<pre[^>]*data-program-code="'+language+'"[^>]*>([\\s\\S]*?)<\\/pre>');
        const pre=html.match(regex);if(!pre||decode(pre[1])!==programs[language])errors.push('Static fallback differs: '+page+' '+language);
      }
    }
  }
  for(const name of fs.readdirSync(path.join(root,'assets'))){
    const file=path.join(root,'assets',name);
    if(name.endsWith('.json')){JSON.parse(fs.readFileSync(file,'utf8'));result.jsonFiles++;}
    if(name.endsWith('.js')){const check=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(check.status!==0)errors.push(check.stderr);result.javascriptFiles++;}
    if(name.endsWith('.css'))for(const m of fs.readFileSync(file,'utf8').matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)){
      if(!/^(?:data:|https?:)/.test(m[1])&&!fs.existsSync(path.resolve(path.dirname(file),m[1].split('?')[0])))errors.push('Missing CSS resource '+name+' -> '+m[1]);
    }
  }
  const published=catalog.lessons.filter(l=>l.published);
  assert.equal(new Set(catalog.lessons.map(l=>l.id)).size,catalog.lessons.length,'Duplicate lesson metadata');
  for(const lesson of published)assert(pages.includes(lesson.path),'Published page missing: '+lesson.path);
  const prepare=spawnSync(process.execPath,[path.join(root,'scripts/prepare-site.cjs'),'--check'],{encoding:'utf8'});
  if(prepare.status!==0)errors.push(prepare.stdout+prepare.stderr);
  result.otherErrors=errors;
  fs.mkdirSync(path.join(root,'work/qa'),{recursive:true});
  fs.writeFileSync(path.join(root,'work/qa/static-results.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2));
  if(result.htmlErrors.length||errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
