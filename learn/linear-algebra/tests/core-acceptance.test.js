const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const math=require('../assets/quadratic-math'),{bank,reasons,assess}=require('../assets/definiteness-challenges'),{transition}=require('../assets/learning-modes'),{recipe,apply}=require('../assets/beginner-labs'),inner=require('../assets/inner-product-lab'),eigen=require('../assets/eigen-labs');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`),root=path.resolve(__dirname,'..');
assert.equal(bank.length,12);assert.equal(new Set(bank.map(x=>x.id)).size,12);assert.equal(new Set(bank.map(x=>x.M.join(','))).size,12);
const demo=Object.values(math.presets).map(p=>p.M.join(',')),reasonByKind={PD:'positive',ND:'negative',PSD:'positive_flat',NSD:'negative_flat',IND:'both',ZERO:'zero'};
let predictions=0;
for(const item of bank){assert.equal(math.analyze(item.M).kind,item.kind);assert.equal(item.reason,reasonByKind[item.kind]);const [x,y]=item.sample.point,[a,b,c,d]=item.M;near(a*x*x+(b+c)*x*y+d*y*y,item.sample.value);if(item.kind!=='ZERO')assert.ok(!demo.includes(item.M.join(',')),'Assessment must not reuse a demo');if(item.kind==='IND'){assert.ok(math.quadratic(item.M,item.positive)>0);assert.ok(math.quadratic(item.M,item.negative)<0);}
 for(const kind of Object.keys(reasonByKind))for(const [reason] of reasons){const result=assess(item,kind,reason,item.sample.value);assert.equal(result.correct,kind===item.kind&&reason===item.reason);predictions++;}
 assert.equal(assess(item,item.kind,item.reason,item.sample.value+1).correct,false);assert.equal(assess(item,item.kind,'',item.sample.value).incomplete,true);assert.equal(assess(item,item.kind,item.reason,NaN).incomplete,true);
 const wrongReason=assess(item,item.kind,'samples',item.sample.value);assert.equal(wrongReason.classCorrect,true);assert.equal(wrongReason.reasonCorrect,false);assert.ok(wrongReason.explanation.includes('有限'));
}
const edited=transition({mode:'challenge',revealed:true,selected:'PD'},{type:'edit'});assert.deepEqual(edited,{mode:'challenge',revealed:false,selected:'PD'});
// A principal-axis section is an actual restriction of the same quadratic form.
for(const item of [...bank,...Object.values(math.presets)]){const info=math.analyze(item.M);for(let i=0;i<2;i++)for(const t of [-3,-1,0,.5,2]){const section=math.axisSection(info.Q,info.values,i,t);near(math.quadratic(item.M,section.input),section.height);near(section.height,info.values[i]*t*t);}}
for(const values of [[2,0],[-2,0],[2,-1],[0,0],[2,2]])for(const angle of [0,15,45,90]){const s=math.fromSpectrum(values,angle);for(let i=0;i<2;i++){const section=math.axisSection(s.Q,values,i,2);near(math.quadratic(s.M,section.input),section.height);}}
const review=fs.readFileSync(path.join(root,'reference/core-review.html'),'utf8'),tasks={};for(const match of review.matchAll(/data-review-task="([^"]+)"([\s\S]*?)<\/section>/g))tasks[match[1]]=[...match[2].matchAll(/data-expected="([^"]+)"/g)].map(m=>Number(m[1]));assert.equal(Object.keys(tasks).length,13);assert.equal(Object.values(tasks).flat().length,32);assert.equal((review.match(/data-quiz/g)||[]).length,6);
const expected={
 '00':recipe([1,-1,2,1],[1,8]).particular,'01':apply([1,2,-1,1],[-1,2]),'02':[2*(2+1)-(1-1)],'03':recipe([2,-1,1,1],[1,5]).particular,
 '04':eigen.multiply([1,1,0,1],[2,0,0,-1]),'04t':[2+4,(2+2)+(4+2)],'05':[3,2,2+2*(-1)-3,-1+3],'06':[recipe([1,2,2,4],[0,0]).rank,-2],
 '07':[eigen.det([1,3,2,1]),5,eigen.det([2,6,4,2])],
 '08':[inner.measure([2,3],[1,-1]).coefficient,inner.measure([2,3],[1,-1]).projection[1],inner.errorSquared([2,3],[1,-1],-.5)],
 '09':[inner.measure([2,0],[1,1],[3,1]).coefficient,inner.errorSquared([2,0],[1,1],1.5,[3,1])],
 '10':[...eigen.eigenInfo([2,1,0,-1]).values,-1],'11':[math.analyze([4,-1,-1,3]).det,math.quadratic([4,-1,-1,3],[1,2])]
};for(const id of Object.keys(expected)){assert.equal(tasks[id].length,expected[id].length);tasks[id].forEach((n,i)=>near(n,expected[id][i]));}assert.deepEqual(apply([2,1,0,-1],[-1,3]),[1,-3]);assert.equal(math.analyze([4,-1,-1,3]).kind,'PD');assert.ok(!bank.some(x=>x.M.join(',')===[4,-1,-1,3].join(',')));
const lessonFiles=fs.readdirSync(path.join(root,'lessons')).filter(f=>f.endsWith('.html'));assert.equal(lessonFiles.length,13);
for(const f of lessonFiles){const html=fs.readFileSync(path.join(root,'lessons',f),'utf8'),id=f.split('-')[0];assert.ok(html.includes(`../reference/core-review.html#review-${id}`));assert.ok(tasks[id]);assert.ok(html.includes('class="beyond"'));}
assert.ok(fs.readFileSync(path.join(root,'index.html'),'utf8').includes('href="reference/core-review.html"'));assert.ok(fs.readFileSync(path.join(root,'reference/course-route.html'),'utf8').includes('href="core-review.html"'));assert.equal((review.match(/data-complete-lesson/g)||[]).length,0);
const files=['index.html',...lessonFiles.map(f=>'lessons/'+f),'reference/course-route.html','reference/core-review.html'];
const voids=new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
for(const file of files){const html=fs.readFileSync(path.join(root,file),'utf8'),stack=[];for(const t of html.matchAll(/<!--[\s\S]*?-->|<![^>]*>|<\/?([a-z][\w:-]*)\b[^>]*>/gi)){if(!t[1]||voids.has(t[1])||t[0].endsWith('/>'))continue;if(t[0].startsWith('</'))assert.equal(stack.pop(),t[1],file);else stack.push(t[1]);}assert.deepEqual(stack,[],file);
 for(const [,url] of html.matchAll(/(?:href|src)="([^"]+)"/g)){if(/^(https?:|mailto:)/.test(url))continue;const [relative,hash]=url.split('#'),target=relative?path.resolve(path.dirname(path.join(root,file)),relative.split('?')[0]):path.join(root,file);assert.ok(fs.existsSync(target),`${file}: ${url}`);if(hash)assert.ok(fs.readFileSync(target,'utf8').includes(`id="${hash}"`),`${file}: #${hash}`);}}
console.log(`PASS: independent bank, ${predictions} class/reason pairs, evidence and partial-answer grading, principal-axis sections, 13 review problems/32 answers/6 concept checks, 16 page structures and anchors.`);
