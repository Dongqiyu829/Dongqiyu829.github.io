const {fs,path,root,save}=require('./test-utils.cjs');
const {spawnSync}=require('child_process');const os=require('os'),assert=require('assert/strict');
const {layerWork}=require('../assets/level-work.js');const {complete}=require('./master-test-utils.cjs');
const out=path.join(root,'work/qa');fs.mkdirSync(out,{recursive:true});
const cxx=process.env.CXX||'C:/Program Files/mingw64/bin/g++.exe',python=process.env.COURSE_PYTHON||path.join(os.homedir(),'anaconda3/python.exe');
function run(cmd,args){const r=spawnSync(cmd,args,{encoding:'utf8',timeout:60000});assert.equal(r.status,0,r.stderr||r.error?.message);return r.stdout.trim();}
const result={harnesses:{},powerModels:0,transferModels:0};
for(const language of ['cpp','python']){
 const file=path.join(out,'master-harness.'+(language==='cpp'?'cpp':'py')),exe=path.join(out,'master-harness.exe');fs.writeFileSync(file,complete(language));if(language==='cpp')run(cxx,['-std=c++17','-O2',file,'-o',exe]);const output=language==='cpp'?run(exe,[]):run(python,[file]);assert.match(output,/8\/8 passed/);result.harnesses[language]='8/8';
}
const cpp=complete('cpp').split('int main()')[0]+String.raw`
int main(){int checked=0;for(int k=0;k<=16;++k){int n=1<<k;for(int p=0;p<=2;++p){long long expected=p==0?2LL*n-1:p==1?1LL*n*(k+1):2LL*n*n-n;if(countWork(n,p)!=expected)throw runtime_error("count mismatch");++checked;}}
for(int n:{0,-1,3,5,6,65537}){bool rejected=false;try{countWork(n,1);}catch(const invalid_argument&){rejected=true;}if(!rejected)throw runtime_error("invalid n accepted");}
for(int p:{-1,3}){bool rejected=false;try{countWork(8,p);}catch(const invalid_argument&){rejected=true;}if(!rejected)throw runtime_error("invalid power accepted");}
cout<<checked<<" exact models; invalid input rejected"<<endl;}
`;
const cf=path.join(out,'master-boundaries.cpp'),exe=path.join(out,'master-boundaries.exe');fs.writeFileSync(cf,cpp);run(cxx,['-std=c++17','-O2',cf,'-o',exe]);result.cpp=run(exe,[]);
const py=complete('python').split('\ntests =')[0]+String.raw`
checked=0
for k in range(17):
    n=1<<k
    for p in range(3):
        expected = 2*n-1 if p==0 else n*(k+1) if p==1 else 2*n*n-n
        assert count_work(n,p)==expected
        checked+=1
for n,p in [(0,1),(-1,1),(3,1),(5,1),(6,1),(65537,1),(8,-1),(8,3)]:
    try: count_work(n,p)
    except ValueError: pass
    else: raise AssertionError((n,p))
print(checked, "exact models; invalid input rejected")
`;
const pf=path.join(out,'master-boundaries.py');fs.writeFileSync(pf,py);result.python=run(python,[pf]);
for(let k=0;k<=16;k++){const n=2**k;for(let power=0;power<=2;power++){
 const rows=layerWork(n,power);assert.equal(rows.length,k+1);assert.equal(rows.at(-1).work,n);const actual=rows.reduce((s,r)=>s+r.work,0),expected=power===0?2*n-1:power===1?n*(k+1):2*n*n-n;assert.equal(actual,expected);if(n>=2){if(power===1)assert(n*k<=actual&&actual<=2*n*k);if(power===2)assert(n*n<=actual&&actual<2*n*n);if(power===0)assert(n<=actual&&actual<2*n);}result.powerModels++;
}}
function transfer(n){return n===1?1:4*transfer(n/2)+n;}
for(let k=0;k<=10;k++){const n=2**k;assert.equal(transfer(n),2*n*n-n);assert.equal(layerWork(n,1,4).reduce((s,r)=>s+r.work,0),2*n*n-n);const logWork=Array.from({length:k},(_,d)=>n*(k-d)).reduce((a,b)=>a+b,n);assert.equal(logWork,n*k*(k+1)/2+n);result.transferModels++;}
const truth=[];for(let x=0;x<2;x++)for(let y=0;y<2;y++)for(let z=0;z<2;z++)truth.push({xyz:''+x+y+z,satisfied:!!((x||y||z)&&(!x||y||z)&&(x||!y||!z))});assert.deepEqual(truth.filter(x=>x.satisfied).map(x=>x.xyz),['001','010','101','110','111']);result.satToy=truth;
save('master-results.json',result);console.log(JSON.stringify(result,null,2));
