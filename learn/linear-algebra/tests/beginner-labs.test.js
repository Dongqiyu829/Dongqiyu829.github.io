const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {recipe,rowOperation,parseNumber,apply}=require('../assets/beginner-labs.js');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
let combinations=0;
for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++)for(let c=-2;c<=2;c++)for(let d=-2;d<=2;d++)for(let x=-2;x<=2;x++)for(let y=-2;y<=2;y++){
 const M=[a,b,c,d],target=[x,y],r=recipe(M,target),det=a*d-b*c;
 if(det!==0){assert.equal(r.kind,'unique');apply(M,r.particular).forEach((n,i)=>near(n,target[i]));}
 else if(r.kind==='many'){for(const s of [-2,0,2])apply(M,r.particular.map((n,i)=>n+s*r.direction[i])).forEach((n,i)=>near(n,target[i]));}
 else if(r.kind==='none'){assert.ok((a===0&&b===0&&c===0&&d===0&&(x||y))||a*y!==c*x||b*y!==d*x);}
 else {assert.equal(r.kind,'all');assert.deepEqual(M,[0,0,0,0]);assert.deepEqual(target,[0,0]);}
 combinations++;
}
assert.equal(recipe([1,2,1,2],[3,1]).kind,'none');assert.equal(recipe([1,2,1,2],[3,3]).kind,'many');assert.deepEqual(recipe([1,1,1,-1],[3,1]).particular,[2,1]);
assert.equal(recipe([2e-8,1e-8,1e-8,2e-8],[5e-8,4e-8]).kind,'unique');
for(const rows of [[[2,1,5],[1,2,4]],[[1,1,3],[2,2,6]],[[1,1,3],[2,2,5]]])for(const op of ['swap','scale','add'])for(const factor of [-2,-1,.5,1,2])for(const target of [0,1]){
 const source=1-target,next=rowOperation(rows,op,target,source,factor),old=recipe([rows[0][0],rows[0][1],rows[1][0],rows[1][1]],[rows[0][2],rows[1][2]]),now=recipe([next[0][0],next[0][1],next[1][0],next[1][1]],[next[0][2],next[1][2]]);
 assert.equal(now.kind,old.kind);if(now.kind==='unique')now.particular.forEach((n,i)=>near(n,old.particular[i]));
}
assert.throws(()=>rowOperation([[2,1,5],[1,2,4]],'scale',0,1,0));assert.throws(()=>rowOperation([[2,1,5],[1,2,4]],'add',0,0,-1));
let rows=[[2,1,5],[1,2,4]];rows=rowOperation(rows,'swap');rows=rowOperation(rows,'add',1,0,-2);rows=rowOperation(rows,'scale',1,0,-1/3);rows=rowOperation(rows,'add',0,1,-2);rows.flat().forEach((n,i)=>near(n,[1,0,2,0,1,1][i]));
for(const [s,n] of [['1/2',.5],['-1/3',-1/3],['0',0],[' 2 ',2],['2.5',2.5]])near(parseNumber(s),n);
for(const s of ['', '1/0','foo','1/2/3','/2','1/'])assert.ok(!Number.isFinite(parseNumber(s)));
const root=path.resolve(__dirname,'..'),files=['index.html','reference/course-route.html',...fs.readdirSync(path.join(root,'lessons')).filter(f=>f.endsWith('.html')).map(f=>'lessons/'+f)];
const voids=new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
for(const file of files){
 const html=fs.readFileSync(path.join(root,file),'utf8'),stack=[];
 for(const tag of html.matchAll(/<!--[\s\S]*?-->|<![^>]*>|<\/?([a-z][\w:-]*)\b[^>]*>/gi)){
  if(!tag[1])continue;const name=tag[1].toLowerCase();if(voids.has(name)||tag[0].endsWith('/>'))continue;
  if(tag[0].startsWith('</'))assert.equal(stack.pop(),name,`${file}: closing ${name}`);else stack.push(name);
 }
 assert.deepEqual(stack,[],file);
 for(const [,url] of html.matchAll(/(?:href|src)="([^"#]+)"/g))if(!/^(https?:|mailto:)/.test(url))assert.ok(fs.existsSync(path.resolve(path.dirname(path.join(root,file)),url.split(/[?#]/)[0])),`${file}: ${url}`);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,`${file}: duplicate IDs`);
}
for(const file of files.filter(f=>/^lessons\/(0[0-7]-|04t-)/.test(f))){const html=fs.readFileSync(path.join(root,file),'utf8');for(const token of ['data-number-check','data-quiz','class="beyond"','data-complete-lesson'])assert.ok(html.includes(token),`${file}: ${token}`);assert.ok(html.includes('data-reveal-target')||html.includes('<details>'),file);}
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.equal(Number(index.match(/data-total="(\d+)"/)[1]),[...index.matchAll(/data-lesson-id=/g)].length);
console.log(`PASS: ${combinations} basis/target combinations, row-operation invariants, fraction parsing, all ${files.length} HTML structures and local links.`);
