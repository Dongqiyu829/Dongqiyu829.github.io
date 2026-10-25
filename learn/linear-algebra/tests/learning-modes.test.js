const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {transition,hidden,parseNumber}=require('../assets/learning-modes');
const {transfers,reviews,summaries}=require('../assets/transfer-practice');
const {recipe,apply,rowOperation}=require('../assets/beginner-labs');
const {measure,errorSquared}=require('../assets/inner-product-lab');
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
let state={mode:'explore',revealed:false,selected:null};assert.equal(hidden(state),false);
state=transition(state,{type:'mode',mode:'challenge'});assert.ok(hidden(state));
state=transition(state,{type:'select',value:'unique'});assert.ok(hidden(state));
state=transition(state,{type:'reveal'});assert.equal(hidden(state),false);
for(const type of ['change','retry']){const next=transition(state,{type});assert.ok(hidden(next));assert.equal(next.selected,null);}
assert.equal(hidden(transition(state,{type:'mode',mode:'explore'})),false);
for(const bad of ['','1/0','1/','/2','abc','1/2/3','Infinity'])assert.ok(!Number.isFinite(parseNumber(bad)));
close(parseNumber('-1/3'),-1/3);close(parseNumber(' 2.5 '),2.5);
const values=id=>transfers[id].fields.map(f=>f[1]);
assert.equal(Object.keys(transfers).length,11);assert.deepEqual(Object.keys(summaries),Object.keys(transfers));
const [x,y]=values('00');assert.equal(x+2*y,8);assert.equal(3*x-y,3);
assert.deepEqual(values('01'),apply([1,-1,2,0],[-2,3]));
const [sx,sy,restriction]=values('02');assert.deepEqual([sx,sy],[2-4,1-2]);assert.equal(sx-2*sy,restriction);
assert.deepEqual(apply([2,1,0,1],values('03')),[1,3]);assert.equal(recipe([2,1,0,1],[1,3]).kind,'unique');
const multiply=(a,b)=>a.map(row=>b[0].map((_,j)=>row.reduce((sum,n,k)=>sum+n*b[k][j],0)));
assert.deepEqual(values('04'),multiply([[0,1],[1,1]],[[2,1],[1,0]]).flat());
assert.deepEqual(values('04t'),[-2+5,(-2*3-2)+(5*3-2)]);
assert.deepEqual(values('05'),[2+3,2*(-1)-3]);
assert.deepEqual(apply([1,2,3,1],values('06')),[5,5]);
assert.deepEqual(values('07'),[2*1-(-1)*3,-5,4*2-(-2)*6]);
for(const [id,u,v,w] of [['08',[3,-1],[1,2],[1,1]],['09',[3,0],[1,1],[1,2]]]){
 const m=measure(u,v,w),expected=values(id);close(m.coefficient,expected[0]);
 if(id==='08')close(m.projection[1],expected[1]);
 close(errorSquared(u,v,m.coefficient,w),expected.at(-1));
 for(const t of [-2,0,.1,2,3])assert.ok(errorSquared(u,v,t,w)>=expected.at(-1)-1e-10);
}
assert.deepEqual(Object.keys(reviews),['03','07','09']);Object.values(reviews).forEach(q=>assert.equal(q.length,3));
assert.deepEqual(apply([1,1,0,1],reviews['03'][1].fields.map(f=>f[1])),[2,3]);
assert.deepEqual(apply([1,0,2,1],[2,-1]),reviews['03'][2].fields.map(f=>f[1]));
assert.equal(recipe([1,1,2,2],[2,4]).kind,'many');assert.equal(recipe([1,1,2,2],[2,5]).kind,'none');
assert.deepEqual(apply([2,-1,1,1],reviews['07'][2].fields.slice(1).map(f=>f[1])),[3,0]);
const last=measure([1,2],[1,1],[4,1]);close(last.coefficient,1.2);close(errorSquared([1,2],[1,1],last.coefficient,[4,1]),.8);
// Independent check of the three-variable example's elimination and final solution.
const rows=[[1,1,1,6],[2,1,-1,1],[1,-1,2,5]];
rows[1]=rows[1].map((n,i)=>n-2*rows[0][i]);rows[2]=rows[2].map((n,i)=>n-rows[0][i]);rows[2]=rows[2].map((n,i)=>n-2*rows[1][i]);
assert.deepEqual(rows,[[1,1,1,6],[0,-1,-3,-11],[0,0,7,21]]);
assert.deepEqual([1+2+3,2+2-3,1-2+6],[6,1,5]);
assert.throws(()=>rowOperation([[2,1,5],[1,2,4]],'scale',0,1,0));
const root=path.resolve(__dirname,'..');
for(const file of fs.readdirSync(path.join(root,'lessons')).filter(f=>f.endsWith('.html'))){const html=fs.readFileSync(path.join(root,'lessons',file),'utf8');assert.ok(html.indexOf('learning-modes.js')<html.indexOf('course.js'));assert.ok(html.includes('transfer-practice.js'));}
const route=fs.readFileSync(path.join(root,'reference/course-route.html'),'utf8');assert.ok(route.indexOf('04-matrix-operations.html')<route.indexOf('04t-trace.html'));assert.ok(route.indexOf('04t-trace.html')<route.indexOf('05-matrices-and-linear-transformations.html'));
console.log('PASS: prediction transitions, fractions, 11 transfer answers, 9 review questions, 3-variable elimination and script/route order.');
