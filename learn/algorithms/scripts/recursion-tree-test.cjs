const assert=require('assert/strict');
const path=require('path');
const inputs={0:[],1:[7],5:[7,2,5,1,6],6:[7,2,5,1,6,3],8:[7,2,5,1,6,3,8,4],16:Array.from({length:16},(_,i)=>16-i)};
function records(values,depth=0,address='根',out=[]){
 out.push({values,depth,address,sorted:values.slice().sort((a,b)=>a-b)});
 if(values.length>1){const mid=Math.floor(values.length/2);records(values.slice(0,mid),depth+1,address+'L',out);records(values.slice(mid),depth+1,address+'R',out);}
 return out;
}
const arrayValue=text=>JSON.parse(text.slice(text.indexOf('[')));
async function verifyTree(page,{captureDir}={}){
 const tree=page.locator('[data-recursion-tree]');let states=0;
 for(const n of [0,1,5,6,8,16]){
  const expected=records(inputs[n]);const height=Math.max(...expected.map(x=>x.depth));
  await tree.locator('[data-tree-size="'+n+'"]').click();
  assert.equal(await tree.getAttribute('data-phase'),'split');
  for(let depth=0;depth<=height;depth++){
   if(depth)await tree.locator('[data-tree-next]').click();
   assert.equal(Number(await tree.getAttribute('data-total')),0,'Split must not claim completed merge writes');
   const shown=await tree.locator('[data-address]').evaluateAll(es=>es.map(e=>({address:e.dataset.address,returned:e.dataset.returned,original:e.querySelector('[data-tree-field="original"]').textContent,result:!!e.querySelector('[data-tree-field="result"]')})));
   assert.equal(shown.length,expected.filter(x=>x.depth<=depth).length);
   for(const node of shown){const target=expected.find(x=>x.address===node.address);assert.deepEqual(arrayValue(node.original),target.values);assert(!node.result);assert.equal(node.returned,'false');}
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));states++;
  }
  assert(await tree.locator('[data-tree-next]').isDisabled());
  await tree.locator('[data-tree-phase="merge"]').click();
  for(let depth=height;depth>=0;depth--){
   if(depth<height)await tree.locator('[data-tree-next]').click();
   const shown=await tree.locator('[data-address]').evaluateAll(es=>es.map(e=>({address:e.dataset.address,returned:e.dataset.returned,fields:Object.fromEntries([...e.querySelectorAll('[data-tree-field]')].map(n=>[n.dataset.treeField,n.textContent]))})));
   assert.equal(shown.length,expected.length);
   for(const node of shown){
    const target=expected.find(x=>x.address===node.address),ready=target.depth>=depth;
    assert.deepEqual(arrayValue(node.fields.original),target.values);assert.equal(node.returned,String(ready));
    if(!ready){assert(!node.fields.result);assert(node.fields.waiting);continue;}
    assert.deepEqual(arrayValue(node.fields.result),target.sorted);
    const work=target.values.length>1?target.values.length:0;assert(node.fields.work.includes('写入 '+work+' 次'));
    if(work){assert.deepEqual(arrayValue(node.fields.left),expected.find(x=>x.address===node.address+'L').sorted);assert.deepEqual(arrayValue(node.fields.right),expected.find(x=>x.address===node.address+'R').sorted);}
    else assert(!node.fields.left&&!node.fields.right);
   }
   const total=expected.filter(x=>x.depth>=depth&&x.values.length>1).reduce((sum,x)=>sum+x.values.length,0);
   assert.equal(Number(await tree.getAttribute('data-total')),total);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));states++;
   if(captureDir&&n===5&&depth===1)await page.screenshot({path:path.join(captureDir,'merge-phase-'+page.viewportSize().width+'.png')});
  }
  assert.equal(await tree.getAttribute('data-done'),'true');assert(await tree.locator('[data-tree-next]').isDisabled());
  await tree.locator('[data-tree-reset]').click();assert.equal(await tree.getAttribute('data-phase'),'split');assert.equal(await tree.getAttribute('data-depth'),'0');
  // Merge is freely accessible even before Split is fully expanded.
  await tree.locator('[data-tree-phase="merge"]').click();assert.equal(await tree.getAttribute('data-depth'),String(height));
  await tree.locator('[data-tree-phase="split"]').click();assert.equal(await tree.getAttribute('data-depth'),'0');
 }
 return {sizes:Object.keys(inputs).map(Number),states};
}
module.exports={verifyTree};
