const {fs,path,root,save}=require('./test-utils.cjs');
const {spawnSync}=require('child_process');
const os=require('os'),assert=require('assert/strict');
const {complete}=require('./merge-test-utils.cjs');
const {levelsFor}=require('../assets/recursion-tree.js');
const out=path.join(root,'work/qa');fs.mkdirSync(out,{recursive:true});
const cxx=process.env.CXX||'C:/Program Files/mingw64/bin/g++.exe';
const python=process.env.COURSE_PYTHON||path.join(os.homedir(),'anaconda3/python.exe');
function run(command,args){const r=spawnSync(command,args,{encoding:'utf8',timeout:60000});assert.equal(r.status,0,r.stderr||r.error?.message);return r.stdout.trim();}
const result={harnesses:{},boundaries:{},treeSizes:0,returnSnapshots:0};
for(const language of ['cpp','python']){
 const file=path.join(out,'merge-harness.'+(language==='cpp'?'cpp':'py'));fs.writeFileSync(file,complete(language));
 const exe=path.join(out,'merge-harness.exe');if(language==='cpp')run(cxx,['-std=c++17','-O2',file,'-o',exe]);
 const output=language==='cpp'?run(exe,[]):run(python,[file]);assert.match(output,/8\/8 passed/);result.harnesses[language]='8/8';
}
const cpp=complete('cpp').split('int main()')[0]+String.raw`
#include <functional>
#include <random>
int main(){
 int checked=0;
 auto check=[&](const vector<int>& a){
   auto original=a, expected=a;sort(expected.begin(),expected.end());Stats stats;auto actual=mergeSort(a,stats);
   int h=0;long long p=1,n=a.size();while(p<n){p*=2;++h;}
   long long writes=n ? n*(h+1)-p : 0;
   if(actual!=expected||a!=original||stats.writes!=writes||stats.maxDepth!=h)throw runtime_error("sort / exact count / depth mismatch");
   if(n>=2){int floor=h-(p!=n);if(stats.writes<n*floor||stats.writes>n*h)throw runtime_error("bound mismatch");}
   ++checked;
 };
 vector<int>a;
 function<void(int)> visit=[&](int remaining){check(a);if(!remaining)return;for(int v=-1;v<=1;++v){a.push_back(v);visit(remaining-1);a.pop_back();}};visit(7);
 mt19937 rng(3711);
 for(int n=0;n<=513;++n){
   vector<int> v(n);for(int i=0;i<n;++i)v[i]=i;check(v);reverse(v.begin(),v.end());check(v);
   fill(v.begin(),v.end(),-2);check(v);for(int &x:v)x=int(rng()%21)-10;check(v);
 }
 for(int k=10;k<=12;++k)for(int delta=-1;delta<=1;++delta){vector<int> v((1<<k)+delta);for(int &x:v)x=int(rng()%101)-50;check(v);}
 cout<<checked<<" arrays: sorted permutation, unchanged input, exact merge writes, exact depth, two-sided bounds"<<endl;
}
`;
const cppFile=path.join(out,'merge-boundaries.cpp'),exe=path.join(out,'merge-boundaries.exe');fs.writeFileSync(cppFile,cpp);run(cxx,['-std=c++17','-O2',cppFile,'-o',exe]);result.boundaries.cpp=run(exe,[]);
const py=complete('python').split('\ntests =')[0]+String.raw`
from itertools import product
from random import Random
checked = 0
def check(a):
    global checked
    original = a[:]
    stats = {"writes": 0, "max_depth": 0}
    actual = merge_sort(a, stats)
    n = len(a)
    h = (n-1).bit_length() if n else 0
    expected_writes = n*(h+1)-(1 << h) if n else 0
    assert actual == sorted(original) and a == original
    assert stats["writes"] == expected_writes and stats["max_depth"] == h, (n, stats)
    if n >= 2:
        assert n*(n.bit_length()-1) <= stats["writes"] <= n*h
    checked += 1
for length in range(8):
    for a in product(range(-1,2), repeat=length): check(list(a))
rng = Random(3711)
for n in range(514):
    check(list(range(n))); check(list(reversed(range(n)))); check([-2]*n)
    check([rng.randint(-10,10) for _ in range(n)])
for k in range(10,13):
    for delta in [-1,0,1]: check([rng.randint(-50,50) for _ in range((1<<k)+delta)])
for n in range(2,514):
    unbalanced = sum(range(2,n+1))
    assert unbalanced == n*(n+1)//2-1
    assert n*n/2 <= unbalanced <= n*n
print(checked, "arrays: sorted permutation, unchanged input, exact merge writes, exact depth, two-sided bounds; unbalanced n=2..513")
`;
const pyFile=path.join(out,'merge-boundaries.py');fs.writeFileSync(pyFile,py);result.boundaries.python=run(python,[pyFile]);
for(let n=0;n<=1025;n++){
 const a=Array.from({length:n},(_,i)=>i),levels=levelsFor(a);let total=0,leaves=0,calls=0;
 const h=n>1?Math.ceil(Math.log2(n)):0;
 assert.equal(levels.length,h+1);
 levels.forEach((nodes,d)=>{
   let work=0;const seen=new Set();
   for(const node of nodes){
     calls++;assert.equal(node.work,node.values.length>1?node.values.length:0);
     for(const v of node.values){assert(!seen.has(v));seen.add(v);}
     if(node.values.length<=1)leaves++;work+=node.work;
     if(d<Math.floor(Math.log2(n||1)))assert(node.values.length>=2);
   }
   assert(work<=n);if(d<Math.floor(Math.log2(n||1)))assert.equal(work,n);total+=work;
 });
 assert.equal(total,n?n*(h+1)-2**h:0);assert.equal(calls,n?2*n-1:1);assert.equal(leaves,n||1);result.treeSizes++;
 const input=Array.from({length:n},(_,i)=>((n-i)*17)%23-11),original=input.slice();
 for(const nodes of levelsFor(input))for(const node of nodes){
   assert.deepEqual(node.returned,node.values.slice().sort((a,b)=>a-b));
   if(node.work){assert.equal(node.children.length,2);assert.deepEqual(node.children.flatMap(x=>x.values),node.values);}
   else assert.equal(node.children.length,0);
   result.returnSnapshots++;
 }
 assert.deepEqual(input,original);
}
save('merge-algorithm-results.json',result);console.log(JSON.stringify(result,null,2));
