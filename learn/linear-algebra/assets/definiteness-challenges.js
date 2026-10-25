(function(){
  'use strict';
  // This assessment bank is independent of the demonstration presets. Zero has
  // one unique matrix, so it is intentionally a boundary check, not a new example.
  const bank=[
    {id:'p1',M:[3,-1,-1,2],kind:'PD',reason:'positive',sample:{point:[1,2],value:7},proof:'a=3>0，det=5>0；也可写成 3(x−y/3)²+(5/3)y²，所以每个非零输入都给正值。'},
    {id:'p2',M:[2,-.5,-.5,1],kind:'PD',reason:'positive',sample:{point:[2,-1],value:11},proof:'a=2>0，det=7/4>0；配方为 2(x−y/4)²+(7/8)y²。单个正测试值只是核对，不是一般证明。'},
    {id:'n1',M:[-3,1,1,-2],kind:'ND',reason:'negative',sample:{point:[1,2],value:-7},proof:'−A 的首格 3>0、行列式 5>0，所以 −A 正定，原 A 对所有非零输入严格为负。'},
    {id:'n2',M:[-1,.5,.5,-2],kind:'ND',reason:'negative',sample:{point:[2,-1],value:-8},proof:'q=−(x−y/2)²−(7/4)y²；非零输入不可能使两个平方同时为零。'},
    {id:'s1',M:[1,-2,-2,4],kind:'PSD',reason:'positive_flat',sample:{point:[2,1],value:0},proof:'q=(x−2y)²≥0，非零输入 (2,1) 给零。因此半正定但非正定；不能只凭一个零值就跳过非负性的证明。'},
    {id:'s2',M:[.25,.5,.5,1],kind:'PSD',reason:'positive_flat',sample:{point:[2,-1],value:0},proof:'q=(x/2+y)²≥0，非零输入 (2,−1) 给零；特征值为 5/4、0。'},
    {id:'t1',M:[-1,2,2,-4],kind:'NSD',reason:'negative_flat',sample:{point:[2,1],value:0},proof:'q=−(x−2y)²≤0，非零输入 (2,1) 给零，因此半负定但不满足严格负定。'},
    {id:'t2',M:[-4,2,2,-1],kind:'NSD',reason:'negative_flat',sample:{point:[1,2],value:0},proof:'q=−(2x−y)²≤0，非零输入 (1,2) 给零。所有值不大于零，还需与严格负定区分。'},
    {id:'i1',M:[2,1,1,-1],kind:'IND',reason:'both',sample:{point:[0,1],value:-1},positive:[1,0],negative:[0,1],proof:'q(1,0)=2>0，q(0,1)=−1<0。已有正负两个明确反例，足以判不定；迹为正仍不能判正定。'},
    {id:'i2',M:[1,-2,-2,1],kind:'IND',reason:'both',sample:{point:[1,1],value:-2},positive:[1,-1],negative:[1,1],proof:'q(1,−1)=6>0，q(1,1)=−2<0。两个对角格为正不够，交叉项不能忽略。'},
    {id:'i3',M:[0,1,1,0],kind:'IND',reason:'both',sample:{point:[1,-1],value:-2},positive:[1,1],negative:[1,-1],proof:'q=2xy；q(1,1)=2，q(1,−1)=−2。仅找到非零零值不能判半定，因为此例在坐标轴上也给零。'},
    {id:'z',M:[0,0,0,0],kind:'ZERO',reason:'zero',sample:{point:[2,-1],value:0},proof:'q 对所有输入恒为零，同时是 PSD 与 NSD，但不是 PD 或 ND。零矩阵只有一张，此题专测边界，不计作新数字迁移。'}
  ];
  const reasons=[['positive','正交特征坐标的权重全部严格正'],['negative','正交特征坐标的权重全部严格负'],['positive_flat','所有权重非负，且有零权重与正权重'],['negative_flat','所有权重非正，且有零权重与负权重'],['both','能给出一个正值和一个负值的输入'],['zero','所有输入的二次型都为零'],['samples','试过几个正值，就证明所有非零输入都正'],['trace','只要迹为正，就可以判断正定'],['entries','只看矩阵元素的正负就能判断'],['one_zero','找到一个非零零值，就能判断半正定']];
  const corrections={samples:'有限个正值不能证明“所有非零输入”；应使用配方、适用判据或全部特征值的符号。',trace:'正迹不排除异号特征值，例如 diag(4,−1)。',entries:'正定是二次型对所有非零输入的性质，不是逐格符号；交叉项也起作用。',one_zero:'鞍面也可有非零零值，例如 x²−y² 在 (1,1) 给零；还需证明所有值非负。'};
  // These cases require checking a matrix-specific argument, not a definition label.
  const argumentsById={
    p1:[['det_only','det(A)=5>0，因此正定。',false,'行列式正只说明两根同号；−I 的行列式也为正，还需首个顺序主子式 a>0。'],['positive','A 实对称，顺序主子式为 3、5，均正，因此正定。',true,'2×2 实对称矩阵的两个顺序主子式为正，判据适用。'],['wrong_det','a=3>0，det(A)=3×2+1=7>0，因此正定。',false,'结论虽碰巧正确，计算却错了：行列式是 3×2−(−1)²=5，不能接受这条论证。']],
    p2:[['wrong_square','q=2(x−y/2)²+(1/2)y²，所以正定。',false,'展开交叉项得到 −2xy，原式为 −xy；这不是当前矩阵的配方。'],['one_sample','q(2,−1)=11>0，所以正定。',false,'只检查一个输入不能覆盖所有非零输入。'],['positive','q=2(x−y/4)²+(7/8)y²；两平方同时为零只可能 x=y=0，所以正定。',true,'展开得到 2x²−xy+y²，且两个平方项权重严格正。']],
    n1:[['negative','−A 实对称，顺序主子式为 3、5，均正；故 −A 正定，A 负定。',true,'先对 −A 使用正定判据，再反转二次型符号。'],['trace_only','tr(A)=−5<0，所以负定。',false,'负迹也可能来自异号根，例如 diag(1,−6)；只看和不充分。'],['negative_entries','两个对角格为负，因此负定。',false,'对角格只测试两条轴，例如 [[−1,2],[2,−1]] 仍可取正值。']],
    s1:[['one_zero','q(2,1)=0，因此半正定但非正定。',false,'只排除了严格正定；不定矩阵也可能有非零零值，还需证明全域非负。'],['positive_flat','q=(x−2y)²≥0，且非零 (2,1) 给零，因此半正定但非正定。',true,'恒等式覆盖所有输入，非零零值负责排除严格正定。'],['zero_det','det(A)=0，因此半正定。',false,'奇异只说明有零根，另一个根可能为负；如 diag(−1,0)。']],
    s2:[['trace_positive','tr(A)=5/4>0，所以正定。',false,'忽略了零根；迹正不能保证每一根严格正。'],['positive_flat','A 实对称，tr=5/4、det=0；两根为 5/4、0，所以半正定但非正定。',true,'特征多项式为 λ(λ−5/4)，符号判据覆盖所有输入。'],['wrong_eigen','两根为 1、0，所以半正定但非正定。',false,'两根之和应为 5/4；结论正确不等于论据计算正确。']],
    i2:[['both','q(1,−1)=6>0，q(1,1)=−2<0，因此不定。',true,'两个经过核算的输入已给正负值，足以证明不定。'],['diagonal_positive','a=d=1>0，所以正定。',false,'交叉项 −4xy 不能忽略；(1,1) 就给 −2。'],['axis_zero','q(1,0)=q(0,1)=1>0，所以不可能有负值。',false,'只看两条坐标轴遗漏了其他方向。']]
  };
  function reasonOptions(item){return argumentsById[item.id]||reasons.map(([id,text])=>[id,text,id===item.reason]);}
  function assess(item,kind,reason,value){
    if(!reason||!Number.isFinite(value))return {incomplete:true,correct:false,explanation:'请同时选择理由并填写证据数值；空白不等于 0。也可随时切回自由探索。'};
    const classCorrect=kind===item.kind,reasonCorrect=reason===item.reason,valueCorrect=Math.abs(value-item.sample.value)<1e-8;
    const argument=reasonOptions(item).find(([id])=>id===reason),detail=argument?.[3];
    return {correct:classCorrect&&reasonCorrect&&valueCorrect,classCorrect,reasonCorrect,valueCorrect,explanation:(classCorrect?'分类正确。':'分类需要修正。')+(reasonCorrect?'理由正确。'+(detail||''):'理由尚不足。'+(detail||corrections[reason]||'请核对当前矩阵的计算与判据前提，不能只匹配名称。'))+(valueCorrect?'证据计算正确。':`证据计算应为 ${item.sample.value}，请先做 Ax，再与输入点积。`)+item.proof};
  }
  const api={bank,reasons,reasonOptions,assess};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.LADefChallenges=api;
})();
