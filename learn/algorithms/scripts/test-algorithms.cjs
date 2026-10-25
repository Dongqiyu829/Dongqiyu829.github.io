const fs=require('fs'),path=require('path'),os=require('os'),assert=require('assert/strict');
const {spawnSync}=require('child_process');
const root=path.resolve(__dirname,'..'),out=path.join(root,'work/qa');fs.mkdirSync(out,{recursive:true});
const binary=JSON.parse(fs.readFileSync(path.join(root,'assets/binary-programs.json'),'utf8'));
const doubling=JSON.parse(fs.readFileSync(path.join(root,'assets/doubling-programs.json'),'utf8'));
const cppBinary=binary.cpp.replace('throw runtime_error("TODO 1: 替换为 lo 的更新");','lo = mid + 1;').replace('throw runtime_error("TODO 2: 替换为 hi 的更新");','hi = mid;');
const pyBinary=binary.python.replace('raise NotImplementedError("TODO 1: 替换为 lo 的更新")','lo = mid + 1').replace('raise NotImplementedError("TODO 2: 替换为 hi 的更新")','hi = mid');
const cppDoubling=doubling.cpp.replace('// TODO: 每执行一次 work，让 count 加 1','++count;');
const pyDoubling=doubling.python.replace('pass  # TODO: 每执行一次 work，让 count 加 1','count += 1');
const result={harnesses:[],boundaries:[]};
function run(command,args){const r=spawnSync(command,args,{encoding:'utf8',timeout:30000});assert.equal(r.status,0,r.stderr||r.error?.message);return r.stdout;}
const cxx=process.env.CXX||'C:/Program Files/mingw64/bin/g++.exe';
const python=process.env.COURSE_PYTHON||path.join(os.homedir(),'anaconda3/python.exe');
for(const [id,cpp,py]of[['binary',cppBinary,pyBinary],['doubling',cppDoubling,pyDoubling]]){
  const c=path.join(out,id+'-harness.cpp'),p=path.join(out,id+'-harness.py'),exe=path.join(out,id+'-harness.exe');fs.writeFileSync(c,cpp);fs.writeFileSync(p,py);
  run(cxx,['-std=c++17',c,'-o',exe]);const a=run(exe,[]),b=run(python,[p]);assert.match(a,/8\/8 passed/);assert.match(b,/8\/8 passed/);result.harnesses.push({id,cpp:'8/8',python:'8/8'});
}
const pyFn=pyBinary.split('\ntests =')[0];
const dFn=pyDoubling.split('\ntests =')[0];
const strict=dFn.replace('def count_work','def count_strict').replace('while i <= n:','while i < n:');
const upper=pyFn.replace('def lower_bound','def upper_bound').replace('if a[mid] < x:','if a[mid] <= x:');
const pyChecks=pyFn+'\n'+upper+'\n'+dFn+'\n'+strict+String.raw`
from itertools import combinations_with_replacement
from bisect import bisect_left, bisect_right
checked=0
for length in range(7):
    for a in combinations_with_replacement(range(-2,3),length):
        for x in range(-3,4):
            assert lower_bound(a,x)==bisect_left(a,x),(a,x)
            assert upper_bound(a,x)==bisect_right(a,x),(a,x)
            checked+=1
print('binary cases',checked,'per variant')
for n in range(513):
    expected=(1 << n.bit_length())-1 if n else 0
    assert count_work(n)==expected,n
    if n: assert n/2 < count_work(n) < 2*n,n
    expected_strict=(1 << (n-1).bit_length())-1 if n>1 else 0
    assert count_strict(n)==expected_strict,n
    if n>=2: assert n/2 <= count_strict(n) < 2*n,n
print('doubling n=0..512 base/strict exact counts and bounds')
`;
const pyFile=path.join(out,'algorithm-boundaries.py');fs.writeFileSync(pyFile,pyChecks);result.boundaries.push(run(python,[pyFile]).trim());
const html=fs.readFileSync(path.join(root,'lessons/0002-asymptotic-analysis.html'),'utf8');
const pair=html.match(/<pre><code>([\s\S]*?)<\/code><\/pre>/)[1].replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace('work(a[i], a[j]);','++count;');
const cppChecks='#include <algorithm>\n#include <functional>\n'+cppBinary.split('int main()')[0]+'\nlong long pairs(int n){long long count=0;\n'+pair+'\nreturn count;}\n'+String.raw`
int main(){
  int checked=0; vector<int> a;
  function<void(int,int)> visit=[&](int left,int start){
    for(int x=-3;x<=3;++x){
      int expected=lower_bound(a.begin(),a.end(),x)-a.begin();
      if(lowerBound(a,x)!=expected)throw runtime_error("binary mismatch");
      ++checked;
    }
    if(!left)return;
    for(int v=start;v<=2;++v){a.push_back(v);visit(left-1,v);a.pop_back();}
  };
  visit(6,-2);
  for(int n=0;n<=512;++n)if(pairs(n)!=1LL*n*(n-1)/2)throw runtime_error("pair count mismatch");
  cout<<"C++ binary cases "<<checked<<"; displayed pair loop n=0..512"<<endl;
}
`;
const cppFile=path.join(out,'algorithm-boundaries.cpp'),exe=path.join(out,'algorithm-boundaries.exe');fs.writeFileSync(cppFile,cppChecks);run(cxx,['-std=c++17',cppFile,'-o',exe]);result.boundaries.push(run(exe,[]).trim());
fs.writeFileSync(path.join(out,'algorithm-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
