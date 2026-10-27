const {fs,path,root,save}=require('./test-utils.cjs');const assert=require('assert/strict'),os=require('os');const {spawnSync}=require('child_process');
const {complete}=require('./inversion-test-utils.cjs'),{mergeTrace}=require('../assets/inversion-merge.js');
const out=path.join(root,'work/qa');fs.mkdirSync(out,{recursive:true});
const cxx=process.env.CXX||'C:/Program Files/mingw64/bin/g++.exe',python=process.env.COURSE_PYTHON||path.join(os.homedir(),'anaconda3/python.exe');
const result={harnesses:{},tracePairs:0};function run(cmd,args){const r=spawnSync(cmd,args,{encoding:'utf8',timeout:60000});assert.equal(r.status,0,r.stderr||r.error?.message);return r.stdout.trim();}
for(const language of ['cpp','python']){const file=path.join(out,'inversion-harness.'+(language==='cpp'?'cpp':'py')),exe=path.join(out,'inversion-harness.exe');fs.writeFileSync(file,complete(language));if(language==='cpp')run(cxx,['-std=c++17','-O2',file,'-o',exe]);const actual=language==='cpp'?run(exe,[]):run(python,[file]);assert.match(actual,/8\/8 passed/);result.harnesses[language]='8/8';}
let cpp=complete('cpp').split('int main()')[0].replace(/out\.push_back\(([^;]+)\);/g,'record(out,$1);');cpp=cpp.replace('struct Result','long long writes=0;\nvoid record(vector<int>& out,int value){++writes;out.push_back(value);}\nstruct Result');
cpp+=String.raw`
#include <functional>
#include <random>
#include <climits>
int main(){int checked=0;
auto check=[&](const vector<int>& a,bool large=false){auto original=a,expected=a;sort(expected.begin(),expected.end());long long slow=0;
 if(large)slow=1LL*a.size()*(a.size()-1)/2;else for(size_t i=0;i<a.size();++i)for(size_t j=i+1;j<a.size();++j)slow+=a[i]>a[j];
 writes=0;auto actual=sortCount(a);long long p=1;int h=0;while(p<(long long)a.size()){p*=2;++h;}
 long long expectedWrites=a.empty()?0:(long long)a.size()*(h+1)-p;
 if(actual.count!=slow||actual.values!=expected||a!=original||writes!=expectedWrites)throw runtime_error("count/sort/input/work mismatch");++checked;};
 vector<int>a;function<void(int)> visit=[&](int left){check(a);if(!left)return;for(int v=-1;v<=1;++v){a.push_back(v);visit(left-1);a.pop_back();}};visit(8);
 mt19937 rng(3711);for(int t=0;t<4000;++t){vector<int> v(rng()%41);for(int& x:v)x=int(rng()%21)-10;check(v);}
 for(int n=0;n<=129;++n){vector<int>v(n);for(int i=0;i<n;++i)v[i]=i;check(v);reverse(v.begin(),v.end());check(v);fill(v.begin(),v.end(),2);check(v);for(int i=0;i<n;++i)v[i]=i%2?1:-1;check(v);}
 for(int n:{31,32,33,63,64,65,255,256,257}){vector<int>v(n);for(int&x:v)x=int(rng()%21)-10;check(v);}
 check({INT_MAX,INT_MIN,0,INT_MAX,INT_MIN});vector<int> big(100000);for(int i=0;i<100000;++i)big[i]=100000-i;check(big,true);
 cout<<checked<<" arrays; exhaustive ternary length<=8, 4000 random, boundaries, exact writes; reverse n=100000 count=4999950000"<<endl;}
`;
const cf=path.join(out,'inversion-boundaries.cpp'),exe=path.join(out,'inversion-boundaries.exe');fs.writeFileSync(cf,cpp);run(cxx,['-std=c++17','-O2',cf,'-o',exe]);result.cpp=run(exe,[]);
const py='writes=0\ndef record(out,value):\n    global writes\n    writes+=1\n    out.append(value)\n'+complete('python').split('\ntests =')[0].replaceAll('out.append(','record(out,')+String.raw`
from itertools import product
from random import Random
checked=0
def check(a,large=False):
    global writes,checked
    original=a[:]
    slow=len(a)*(len(a)-1)//2 if large else sum(a[i]>a[j] for i in range(len(a)) for j in range(i+1,len(a)))
    writes=0
    values,count=sort_count(a)
    n=len(a);h=(n-1).bit_length() if n else 0
    assert count==slow and values==sorted(original) and a==original,(a,count,slow)
    assert writes==(n*(h+1)-(1<<h) if n else 0),(n,writes)
    checked+=1
for n in range(9):
    for a in product(range(-1,2),repeat=n):check(list(a))
rng=Random(3711)
for _ in range(4000):check([rng.randint(-10,10) for _ in range(rng.randrange(41))])
for n in range(130):
    check(list(range(n)));check(list(reversed(range(n))));check([2]*n);check([1 if i%2 else -1 for i in range(n)])
for n in [31,32,33,63,64,65,255,256,257]:check([rng.randint(-10,10) for _ in range(n)])
check([2**31-1,-2**31,0,2**31-1,-2**31]);check(list(range(100000,0,-1)),True)
print(checked,'arrays; exhaustive ternary length<=8, 4000 random, boundaries, exact writes; reverse n=100000 count=4999950000')
`;
const pf=path.join(out,'inversion-boundaries.py');fs.writeFileSync(pf,py);result.python=run(python,[pf]);
const halves=[];function generate(a,remaining,min){halves.push(a.slice());if(!remaining)return;for(let v=min;v<=1;v++){a.push(v);generate(a,remaining-1,v);a.pop();}}generate([],5,-1);
for(const left of halves)for(const right of halves){const original=JSON.stringify([left,right]),states=mergeTrace(left,right),last=states.at(-1);const expected=left.reduce((sum,l)=>sum+right.filter(r=>l>r).length,0);assert.equal(last.count,expected);assert.deepEqual(last.out,[...left,...right].sort((a,b)=>a-b));assert.equal(states.length,left.length+right.length+1);assert.equal(JSON.stringify([left,right]),original);for(let i=1;i<states.length;i++){assert.equal(states[i].count-states[i-1].count,states[i].added);assert(states[i].added>=0);}result.tracePairs++;}
save('inversion-results.json',result);console.log(JSON.stringify(result,null,2));
