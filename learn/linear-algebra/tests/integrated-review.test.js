const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {bank,reasonOptions,assess}=require('../assets/definiteness-challenges'),eigen=require('../assets/eigen-labs'),math=require('../assets/quadratic-math'),{recipe}=require('../assets/beginner-labs'),inner=require('../assets/inner-product-lab');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`),same=(a,b)=>{assert.equal(a.length,b.length);a.forEach((v,i)=>near(v,b[i]));};
// Grade every visible option, including plausible calculations with the right conclusion.
let contextual=0,combinations=0;
for(const item of bank){const options=reasonOptions(item);assert.equal(options.filter(o=>o[2]).length,1);assert.equal(options.find(o=>o[2])[0],item.reason);if(options[0].length===4)contextual++;
 for(const [id,,valid] of options)for(const kind of ['PD','ND','PSD','NSD','IND','ZERO']){const result=assess(item,kind,id,item.sample.value);assert.equal(result.correct,valid&&kind===item.kind);assert.equal(result.reasonCorrect,valid);assert.equal(result.valueCorrect,true);if(!valid)assert.ok(result.explanation.includes('理由尚不足'));combinations++;}
 assert.equal(assess(item,item.kind,item.reason,NaN).incomplete,true);assert.equal(assess(item,item.kind,item.reason,item.sample.value+1).valueCorrect,false);
}
assert.equal(contextual,6);
const get=id=>bank.find(x=>x.id===id);
// Independently verify the six accepted arguments and the numeric traps.
assert.equal(eigen.det(get('p1').M),5);assert.equal(get('p1').M[0],3);assert.equal(math.analyze([-1,0,0,-1]).kind,'ND');
for(let x=-4;x<=4;x+=.5)for(let y=-4;y<=4;y+=.5){near(math.quadratic(get('p2').M,[x,y]),2*(x-y/4)**2+7*y*y/8);near(math.quadratic(get('s1').M,[x,y]),(x-2*y)**2);}
assert.notEqual(math.quadratic(get('p2').M,[1,1]),2*(1-1/2)**2+.5);assert.equal(assess(get('p2'),'PD','wrong_square',11).correct,false);
assert.equal(math.analyze(get('n1').M.map(n=>-n)).kind,'PD');assert.equal(math.analyze([-1,2,2,-1]).kind,'IND');assert.equal(math.quadratic(get('s1').M,[2,1]),0);assert.equal(math.analyze([-1,0,0,0]).kind,'NSD');same(math.analyze(get('s2').M).values,[1.25,0]);
assert.equal(math.quadratic(get('i2').M,[1,-1]),6);assert.equal(math.quadratic(get('i2').M,[1,1]),-2);
for(const [id,reason] of [['p1','wrong_det'],['p2','wrong_square'],['s2','wrong_eigen']]){const item=get(id),result=assess(item,item.kind,reason,item.sample.value);assert.equal(result.classCorrect,true);assert.equal(result.correct,false);}

const K=[3,1,1,3],P=[1,1,1,-1],D=[4,0,0,2],x=[3,1],c=recipe(P,x).particular,R=[1,2,2,4],H=[1,2,2,1],G=[3,2,2,3];
same(eigen.multiply(eigen.multiply(P,D),eigen.inverse(P)),K);same(eigen.apply(P,c),x);same(eigen.apply(P,eigen.apply(D,c)),eigen.apply(K,x));
// Non-normalized orthogonal eigenvectors require their squared lengths in q.
for(let a=-3;a<=3;a++)for(let b=-3;b<=3;b++)near(math.quadratic(K,eigen.apply(P,[a,b])),8*a*a+4*b*b);
same(eigen.apply(R,[-2,1]),[0,0]);for(let t=-3;t<=3;t++)same(eigen.apply(R,[3-2*t,t]),[3,6]);assert.equal(math.analyze(R).kind,'PSD');assert.notDeepEqual(eigen.multiply(R,R),R);
const projection=inner.measure([4,0],[1,2]),residual=[4-projection.projection[0],-projection.projection[1]];near(residual[0]+2*residual[1],0);
assert.equal(math.analyze(H).kind,'IND');assert.equal(math.analyze(G).kind,'PD');assert.equal(math.analyze([2,2,2,2]).kind,'PSD');
const expected={
 transform:[eigen.det(P),...c,...math.analyze(K).values,...eigen.apply(D,c),eigen.det(K),recipe(K,[0,0]).rank,math.quadratic(K,x)],
 measurement:[recipe(R,[0,0]).rank,eigen.det(R),-2,...math.analyze(R).values,math.quadratic(R,[-2,1]),math.quadratic(R,[1,1]),projection.coefficient,projection.projection[1],inner.errorSquared([4,0],[1,2],projection.coefficient)],
 saddle:[eigen.det(H),recipe(H,[0,0]).rank,...math.analyze(H).values,math.quadratic(H,[1,1]),math.quadratic(H,[1,-1]),...math.analyze(G).values,eigen.det(G),math.quadratic(G,[1,-1])]
};
const html=fs.readFileSync(path.join(__dirname,'../reference/core-review.html'),'utf8'),cases=[...html.matchAll(/data-integrated-case="([^"]+)"([\s\S]*?)<\/section>/g)];assert.equal(cases.length,3);let answers=0;
for(const [,id,body] of cases){const values=[...body.matchAll(/data-expected="([^"]+)"/g)].map(m=>Number(m[1]));same(values,expected[id]);answers+=values.length;assert.equal((body.match(/data-case-step=/g)||[]).length,3);assert.equal((body.match(/可选提示/g)||[]).length,3);assert.equal((body.match(/完整解释与条件检查/g)||[]).length,3);assert.ok(!body.includes('disabled'));}
assert.equal(answers,30);assert.ok(html.indexOf('id="integrated-cases"')>html.indexOf('id="review-11"'));assert.ok(html.includes('href="#integrated-cases"'));assert.ok(!html.includes('data-complete-lesson'));
console.log(`PASS: 3 integrated cases/9 independent parts/30 answers, basis and spectral identities, nullspace/projection/definiteness connections, 6 contextual proof cases/${combinations} visible grading combinations and numeric-proof traps.`);
