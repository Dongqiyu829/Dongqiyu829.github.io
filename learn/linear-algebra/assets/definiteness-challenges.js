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
  function assess(item,kind,reason,value){
    if(!reason||!Number.isFinite(value))return {incomplete:true,correct:false,explanation:'请同时选择理由并填写证据数值；空白不等于 0。也可随时切回自由探索。'};
    const classCorrect=kind===item.kind,reasonCorrect=reason===item.reason,valueCorrect=Math.abs(value-item.sample.value)<1e-8;
    return {correct:classCorrect&&reasonCorrect&&valueCorrect,classCorrect,reasonCorrect,valueCorrect,explanation:(classCorrect?'分类正确。':'分类需要修正。')+(reasonCorrect?'一般理由正确。':'理由尚不足。'+(corrections[reason]||'请核对权重符号与严格、非严格条件，而不是只匹配名称。'))+(valueCorrect?'证据计算正确。':`证据计算应为 ${item.sample.value}，请先做 Ax，再与输入点积。`)+item.proof};
  }
  const api={bank,reasons,assess};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.LADefChallenges=api;
})();
