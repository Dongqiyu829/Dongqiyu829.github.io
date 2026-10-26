const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),m=require('../assets/jordan-math');
let checks=0;const near=(a,b,tol=1e-8)=>{checks++;assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);};
const same=(a,b,tol)=>{assert.equal(a.length,b.length);a.forEach((r,i)=>{assert.equal(r.length,b[i].length);r.forEach((x,j)=>near(x,b[i][j],tol));});};
const plus=(A,B)=>A.map((r,i)=>r.map((x,j)=>x+B[i][j]));
// Independent series, not the closed form used by the lesson.
function series(A,t){let out=m.I(),term=m.I();for(let r=1;r<=100;r++){term=m.scale(m.multiply(term,A),t/r);out=plus(out,term);}return out;}
const J=m.block(1),I=m.I(),N=m.block(0);
assert.equal(m.eigenspaceDimension(I,1),2);assert.equal(m.eigenspaceDimension(J,1),1);
for(const A of [I,J])for(const l of [-2,0,1,3]){const B=m.subtract(A,m.scale(I,l));near(B[0][0]*B[1][1]-B[0][1]*B[1][0],(1-l)**2);}
for(const name of ['jordan','similar']){const p=m.presets[name],c=m.chain(p.A,1,p.v1,p.v2);near(c.firstError,0);near(c.secondError,0);assert.ok(c.independent);same(m.similar(J,p.P),p.A);same(m.multiply(m.multiply(m.inverse(p.P),p.A),p.P),J);assert.equal(m.eigenspaceDimension(p.A,1),1);for(const t of [-1,0,.4,2])same(m.similar(m.exponential(1,1,t),p.P),series(p.A,t));}
for(let n=0;n<=20;n++)same(m.power(J,n),[[1,n],[0,1]]);
for(const lambda of [-1.5,-1,0,.5,2])for(const k of [-4,0,1,3])for(const t of [-1,0,.01,.5,1,2]){
 const A=m.block(lambda,k),E=m.exponential(lambda,k,t);same(E,series(A,t));same(m.exponential(lambda,k,0),I);
 const h=1e-5,d=m.scale(m.subtract(m.exponential(lambda,k,t+h),m.exponential(lambda,k,t-h)),1/(2*h));same(d,m.multiply(A,E),1e-7);
 for(const x of [[0,0],[0,1],[2,-1]]){const ahead=m.state(lambda,k,t+h,x),behind=m.state(lambda,k,t-h,x),velocity=m.apply(A,m.state(lambda,k,t,x));ahead.forEach((z,i)=>near((z-behind[i])/(2*h),velocity[i],1e-7));}
 for(const s of [-.5,0,.7])same(m.exponential(lambda,k,t+s),m.multiply(m.exponential(lambda,k,t),m.exponential(lambda,k,s)));
}
const current=m.state(-1,4,1,[0,1]);near(current[0],4/Math.E);near(current[1],1/Math.E);near(m.norm(current),Math.sqrt(17)/Math.E);assert.ok(m.norm(current)>1);
for(const t of [0,.2,1,6]){same([m.state(-1,4,t,[2,0])],[[2*Math.exp(-t),0]]);same(m.exponential(-1,0,t),m.scale(I,Math.exp(-t)));same(m.exponential(0,0,t),I);same([m.state(0,0,t,[1,2])],[[1,2]]);}
same(m.power([[0,0],[0,0]],0),I);same(m.power([[0,0],[0,0]],3),[[0,0],[0,0]]);
for(const t of [-1,0,.5,1])same(series(m.presets.diagonal.A,t),[[Math.exp(2*t),0],[0,Math.exp(-t)]]);
const N3=[[0,1,0],[0,0,1],[0,0,0]],mul3=(A,B)=>A.map(r=>[0,1,2].map(j=>r.reduce((s,x,k)=>s+x*B[k][j],0))),I3=[[1,0,0],[0,1,0],[0,0,1]],N32=mul3(N3,N3);
same(mul3(N32,N3),[[0,0,0],[0,0,0],[0,0,0]]);for(const t of [-2,0,.5,2])same(m.nilpotent3(t),I3.map((r,i)=>r.map((x,j)=>x+t*N3[i][j]+t*t/2*N32[i][j])));same([m.nilpotent3(2).map(r=>r[2])],[[2,2,1]]);
// The exception to splitting exponentials is a genuine noncommuting example.
const D=[[0,0],[1,0]],C=N;assert.notDeepEqual(m.multiply(C,D),m.multiply(D,C));same(m.multiply(series(C,1),series(D,1)),[[2,1],[1,1]]);assert.ok(Math.abs(series(plus(C,D),1)[0][0]-2)>.1);
// Independent exercises use a different eigenvalue/coupling/initial condition.
const transfer=m.chain([[2,3],[0,2]],2,[1,0],[0,1/3]);near(transfer.secondError,0);near(transfer.firstError,0);assert.ok(transfer.independent);assert.equal(m.eigenspaceDimension([[2,3],[0,2]],2),1);
same([m.state(-2,3,.5,[1,2])],[[4/Math.E,2/Math.E]]);same([m.state(-1,4,1,[2,0])],[[2/Math.E,0]]);
assert.throws(()=>m.power(J,-1));assert.throws(()=>m.power(J,.5));assert.throws(()=>m.inverse([[1,1],[1,1]]));assert.throws(()=>m.exponential(Infinity,1,1));assert.throws(()=>m.exponential(1000,1,1));assert.throws(()=>m.apply(J,[1]));assert.throws(()=>m.trajectory(1,1,1,[0,1],0));
const root=path.resolve(__dirname,'..'),file='lessons/13-jordan-matrix-exponential-dynamics.html',html=fs.readFileSync(path.join(root,file),'utf8');
for(const token of ['id="jordan"','id="exponential"','id="dynamics"','id="transfer"','data-chain-lab','data-time-lab','data-dynamics-lab','class="beyond"'])assert.ok(html.includes(token));assert.equal((html.match(/data-number-check/g)||[]).length,3);assert.equal((html.match(/data-quiz/g)||[]).length,3);assert.ok(!html.includes('data-complete-lesson'));
const answers=[...html.matchAll(/data-expected="([^"]+)"/g)].map(x=>Number(x[1]));same([answers],[[1,1/3,0,4,2,0,2,0,4]]);
for(const f of ['index.html','reference/course-route.html','lessons/12-svd-least-squares-pseudoinverse.html'])assert.ok(fs.readFileSync(path.join(root,f),'utf8').includes('13-jordan-matrix-exponential-dynamics.html'));
assert.equal((fs.readFileSync(path.join(root,'index.html'),'utf8').match(/data-lesson-id=/g)||[]).length,13);
console.log(`PASS: ${checks} Jordan/power/exponential/derivative/ODE/group/similarity/3D/transfer numeric checks; zero/repeated/distinct roots and negative time; optional integration.`);
