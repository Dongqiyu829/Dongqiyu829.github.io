(function(){
  'use strict';
  const matrix=rows=>`<span class="matrix" style="grid-template-columns:repeat(${rows[0].length},minmax(28px,auto))">${rows.flat().map(n=>`<span>${n}</span>`).join('')}</span>`;
  const transfers={
    '00':{title:'迁移：换一张账单，独立求解',prompt:'求 x+2y=8、3x−y=3。这不是上面已算过的方程组。',fields:[['新解 x',2],['新解 y',3]],hint:'可将第二式乘 2，与第一式相加消去 y；不要只验一条式子。',solution:'① x+2y=8 与 6x−2y=6 相加，7x=14，所以 x=2。② 代回 2+2y=8，y=3。③ 验算 2+6=8、6−3=3，两条都满足。'},
    '01':{title:'迁移：新矩阵与带负数输入',prompt:`C=${matrix([[1,-1],[2,0]])}，输入列向量为 (−2,3)。求输出两个分量。`,fields:[['新输出 x',-5],['新输出 y',-4]],hint:'先取 −2 倍第一列，再加 3 倍第二列；最后按行核对。',solution:'① −2(1,2)=(−2,−4)。② 3(−1,0)=(−3,0)。③ 相加为 (−5,−4)。④ 按行是 −2−3=−5、2×(−2)+0×3=−4。'},
    '02':{title:'迁移：别只记住第一象限的反例',prompt:'在 S={(x,y):x−2y=0} 中取 u=(2,1)、v=(−4,−2)。计算 u+v，再代入 x−2y 检查。',fields:[['和的 x',-2],['和的 y',-1],['和满足的 x减2y',0]],hint:'成员可以含负数；检查的是方程限制，不是“看起来在右上角”。',solution:'① u+v=(−2,−1)。② −2−2×(−1)=0，所以这次仍在 S。③ 一般地，成员可写成 (2s,s)，相加与任意实数数乘仍有此形状；这个通式才说明所有情况，而不是只靠本次成功。'},
    '03':{title:'迁移：离开默认斜基，重新求配方',prompt:'有序候选方向 b₁=(2,0)、b₂=(1,1)，固定目标 v=(1,3)。求其坐标 (a,b)，并说明为什么唯一。',fields:[['新基第一用量',-1],['新基第二用量',3]],hint:'先比较第二分量得 b，再代入 2a+b=1。目标的通常坐标不是新基下的用量。',solution:'① 第二分量 b=3。② 第一分量 2a+3=1，所以 a=−1。③ −(2,0)+3(1,1)=(1,3)。④ 两方向不平行，故对平面中每个目标都能唯一求出配方。'},
    '04':{title:'迁移：算新矩阵，不照搬 A、B 的答案',prompt:`C=${matrix([[0,1],[1,1]])}，D=${matrix([[2,1],[1,0]])}。计算 CD，记住先 D 后 C。`,fields:[['CD 新左上',1],['CD 新右上',0],['CD 新左下',3],['CD 新右下',1]],hint:'每格用左矩阵的一行与右矩阵的一列。不是对应位置相乘。',solution:'① 左上 0×2+1×1=1。② 右上 0×1+1×0=0。③ 左下 1×2+1×1=3。④ 右下 1×1+1×0=1。CD 的两列也是把 D 的两列分别送入 C 的结果。'},
    '04t':{title:'迁移：负对角线与线性性质',prompt:`M=${matrix([[-2,4],[1,5]])}，I 为二维单位矩阵。求 tr(M) 与 tr(3M−2I)。`,fields:[['新矩阵的迹',3],['组合矩阵的迹',5]],hint:'tr(I)=2；只取主对角线，别把右上和左下也加进去。',solution:'① tr(M)=−2+5=3。② tr(3M−2I)=3×3−2×2=5。③ 直接核对：组合矩阵对角线为 −8、13，相加仍为 5。迹不是面积倍数，也不能据此还原全部矩阵。'},
    '05':{title:'迁移到非方阵：三格输入，两格输出',prompt:`K=${matrix([[1,0,1],[0,2,-1]])}。输入列向量 (2,−1,3) 有三格，求 K 的两格输出。`,fields:[['非方阵输出第一格',5],['非方阵输出第二格',-5]],hint:'三列各是一支二维输出；输入三个分量分别给三列用量。',solution:'① 第一格 1×2+0×(−1)+1×3=5。② 第二格 0×2+2×(−1)−1×3=−5。③ 输入空间为 ℝ³，输出空间为 ℝ²；列数决定输入格数，行数决定输出格数。'},
    '06':{title:'迁移：新矩阵，不能直接套 A 的逆',prompt:`M=${matrix([[1,2],[3,1]])}，输出为 (5,5)。独立消元求输入 (x,y)。`,fields:[['新方程输入 x',1],['新方程输入 y',2]],hint:'R₂ 减 3 倍 R₁，整行包括右端一起操作。A 的逆只适用于 A。',solution:'① 方程是 x+2y=5、3x+y=5。② 第二式减 3 倍第一式，−5y=−10，所以 y=2。③ 代回 x+4=5，x=1。④ 验算 1+4=5、3+2=5。'},
    '07':{title:'迁移：新矩阵、换列与整台缩放',prompt:`N=${matrix([[2,-1],[3,1]])}。求 det(N)、交换两列后的行列式，以及 det(2N)。`,fields:[['新行列式',5],['交换列后的行列式',-5],['整矩阵乘二后的行列式',20]],hint:'先算 ad−bc；交换列变号；二维两列都乘 2，总倍数是 4。',solution:'① det(N)=2×1−(−1)×3=5。② 交换两列变成 −5，普通面积仍为 5。③ 2N 的两列各乘 2，因此 det(2N)=2²×5=20；直接算 4×2−(−2)×6 也为 20。'},
    '08':{title:'迁移：斜直线，而不是只投影到坐标轴',prompt:'u=(3,−1)、v=(1,2)。求 u 在 span(v) 上的投影系数 α、投影的第二格，以及最小误差平方。可填分数。',fields:[['新投影系数',.2],['新投影第二格',.4],['新最小误差平方',9.8]],hint:'先算 u·v=1、v·v=5；平方和是距离平方，不是距离本身。',solution:'① α=1/5。② p=(1/5,2/5)，第二格为 2/5。③ r=(14/5,−7/5)，r·v=14/5−14/5=0。④ ‖r‖²=(196+49)/25=49/5=9.8。没有用到三角函数。'},
    '09':{title:'迁移：换目标、换权重，重新找最近点',prompt:'u=(3,0)、v=(1,1)，权重 w=(1,2)。求带权投影系数和最小带权误差平方。',fields:[['新带权系数',1],['新带权误差平方',6]],hint:'分子、分母、误差都必须使用同一组权重，不要照抄默认例子的 1.25。',solution:'① ⟨u,v⟩w=3，⟨v,v⟩w=1+2=3，所以 α=1。② p=(1,1)，r=(2,−1)。③ ⟨r,v⟩w=2−2=0。④ 带权误差平方为 2²+2×(−1)²=6。'}
  };
  const reviews={
    '03':[
      {title:'1 · 从向量组合回到子空间',prompt:'过原点直线 L=span((1,2))。目标 (3,6) 是几倍 (1,2)？这次成功之外，一般封闭性的理由是什么？',fields:[['直线配方',3]],hint:'比较两分量，然后用任意系数 s、t 写通式。',solution:'3(1,2)=(3,6)。一般成员为 s(1,2)，相加得 (s+t)(1,2)，数乘仍沿同一方向；后面两个式子对所有实数都成立。'},
      {title:'2 · 同一箭头，另一套坐标',prompt:'b₁=(1,0)、b₂=(1,1)，目标仍为 (2,3)。求基下坐标，而不是抄通常坐标。',fields:[['阶段坐标第一格',-1],['阶段坐标第二格',3]],hint:'a+b=2、b=3。',solution:'先得 b=3，再得 a=−1。目标箭头保持 (2,3)，只是配方改成 (−1,3)。'},
      {title:'3 · 配方就是矩阵的列组合',prompt:'一个线性变换的两列为 (1,2)、(0,1)。输入 (2,−1)，输出是什么？',fields:[['阶段输出 x',2],['阶段输出 y',3]],hint:'取两倍第一列减第二列。',solution:'2(1,2)−(0,1)=(2,3)。这把 01 的列组合、02 的线性规则和 03 的配方连在一起。'}
    ],
    '07':[
      {title:'1 · det=0 就一定无穷多解吗？',prompt:'M 两列都是 (1,2)。目标 (2,4) 能到达吗？',choices:[['many','能，有无穷多输入'],['none','不能，det=0 就无解']],correct:'many',solution:'目标在列空间中，例如输入 (2,0) 或 (1,1) 都能到达。零空间可产生更多同输出的输入。'},
      {title:'2 · 只换目标，结局就不同',prompt:'仍用两列均为 (1,2) 的 M，目标换成 (2,5)。有输入能得到它吗？',choices:[['yes','有，只是配方不唯一'],['no','没有，目标在列空间之外']],correct:'no',solution:'输出总为 (s,2s)，第一格为 2 时第二格只能为 4，不可能为 5。det=0 没有单独决定目标是否可达。'},
      {title:'3 · 面积、可逆与求解',prompt:`M=${matrix([[2,-1],[1,1]])}。计算 det(M)，再求输出 (3,0) 对应的输入。`,fields:[['复习行列式',3],['复习输入 x',1],['复习输入 y',-1]],hint:'由第二式 y=−x，代回第一式。',solution:'det(M)=2×1−(−1)×1=3，非零所以可逆。由 x+y=0、2x−y=3 得 x=1、y=−1。面积信号与唯一配方一致。'}
    ],
    '09':[
      {title:'1 · 独立与正交不是同一个词',prompt:'(1,0)、(1,1) 能成为 ℝ² 的基。它们是否因此必定正交？',choices:[['yes','是，基都要垂直'],['no','否，还需按内积检查']],correct:'no',solution:'它们不平行，因而是基；普通点积为 1，并不正交。03 的无关与 08 的正交要分开。'},
      {title:'2 · 残差连接最近点',prompt:'普通内积下，u=(1,2)、v=(1,0)。求 α 与最小误差平方。',fields:[['复习普通 alpha',1],['复习普通误差平方',4]],hint:'p=(α,0)，残差要与横轴正交。',solution:'α=1，p=(1,0)，r=(0,2)，误差平方为 4。任何别的 q=(t,0) 都多出 (1−t)²。'},
      {title:'3 · 换尺子后重新最小化',prompt:'u=(1,2)、v=(1,1)，权重 w=(4,1)。求新 α 与最小带权误差平方。',fields:[['复习带权 alpha',1.2],['复习带权误差平方',.8]],hint:'分子 4+2=6，分母 4+1=5。',solution:'α=6/5，p=(6/5,6/5)，r=(−1/5,4/5)。带权残差与 v 的内积为 −4/5+4/5=0；误差平方为 4/25+16/25=4/5。'}
    ]
  };
  const summaries={
    '00':['解必须同时满足所有限制；交点是这种共同满足的图像。','消元、回代，并代回全部原式验算。','只验一条式子；把看不到交点误当无解。'],
    '01':['列向量把同一组方程读成原料的配方。','每个分量相加、数乘，再算矩阵的列组合。','数乘只改一格；把横排速记当作乘法里的行向量。'],
    '02':['空间是对象与运算，变换是映射；一次反例能否定一般断言。','算出运算结果，再检查它是否仍为集合成员。','用几次成功证明“对所有情况成立”。'],
    '03':['基意味着对整个指定空间恰有一份配方，不是必须垂直。','比较分量求新基用量，核对组合等于原目标。','把有限网格点当成 Span；把向量个数直接当成维数。'],
    '04':['矩阵乘法接两台机器，右边先作用。','检查形状后逐行逐列相乘相加。','只做对应格相乘；无条件交换乘法顺序。'],
    '04t':['迹是主对角线摘要，不能还原全部变换。','算迹，使用加法与数乘性质。','把 tr(MN) 写成 tr(M)tr(N)。'],
    '05':['改变向量与改变其坐标表示是两类问题。','从标准方向的像读出列；检查输入格数和输出格数。','认为列数是输出维度；换基时把箭头也搬动。'],
    '06':['行操作改写限制，不改变共同解；秩与零空间描述信息。','对整条增广行操作，回代验算，也能处理三未知数。','只改左边；将不可逆一概等同于无解。'],
    '07':['行列式记录有向面积；零是压扁，负数是翻向。','计算 ad−bc；区分换一列与缩放整台矩阵。','把负行列式说成负普通面积；把等行列式说成等矩阵。'],
    '08':['投影先是“在允许集合中找离目标最近的点”，点积帮助算出它。','求 α=(u·v)/(v·v)、p=αv，再核对残差正交。','混淆系数、向量与长度；未排除零参考向量。'],
    '09':['尺子换了，长度、正交与最近点一起改变。','分子、分母和误差都用同一组正权重。','用旧尺子评价新投影；把函数积分选学误作先修。']
  };
  if(typeof module!=='undefined')module.exports={transfers,reviews,summaries};
  if(typeof document==='undefined')return;
  function exercise(record,key){
    if(record.choices)return `<div class="exercise" data-quiz><h3>${record.title}</h3><p>${record.prompt}</p>${record.choices.map(([value,label])=>`<button type="button" data-answer="${value===record.correct?'correct':'incorrect'}" data-message="${record.solution}">${label}</button>`).join('')}<p class="feedback" data-feedback-output aria-live="polite"></p><details><summary>查看推理</summary><p>${record.solution}</p></details></div>`;
    return `<div class="exercise" data-number-check data-transfer-id="${key}" data-hint="${record.hint} 可在文字框填分数，如 1/5。" data-success="计算正确。请再用自己的话解释为何这些步骤适用，而不只记住数值。"><h3>${record.title}</h3><p>${record.prompt}</p><div class="number-fields">${record.fields.map(([label,value],i)=>`<label>${label}<input type="text" inputmode="decimal" data-expected="${value}" aria-label="${key} ${label}"></label>`).join('')}</div><button type="button" data-check-values>核对独立作答</button><p class="feedback" data-check-output aria-live="polite"></p><details><summary>作答后展开逐步解析</summary><p>${record.solution}</p></details></div>`;
  }
  const id=document.querySelector('[data-complete-lesson]')?.dataset.completeLesson.replace('linear-','');
  if(!transfers[id])return;
  const block=document.createElement('section');block.dataset.transferSection=id;block.innerHTML='<h2>离开演示，换一个问题试试</h2><p>这道题使用不同数字、条件或表示；不需要先完成任何互动。先独立解释、计算，再核对。以下题目是固定新问题，不随上面的实验改变。</p>'+exercise(transfers[id],'transfer-'+id);
  const summary=document.createElement('section');summary.className='win';summary.dataset.lessonSummary=id;summary.innerHTML='<h2>离开本课前记住三件事</h2><p><strong>直觉：</strong>'+summaries[id][0]+'</p><p><strong>必须会算：</strong>'+summaries[id][1]+'</p><p><strong>常见误区：</strong>'+summaries[id][2]+'</p>';
  const anchors=document.querySelectorAll('details.beyond'),anchor=anchors[anchors.length-1]||document.querySelector('[data-complete-lesson]').closest('section');anchor.before(block,summary);
  if(reviews[id]){const review=document.createElement('details');review.className='stage-review';review.dataset.stageReview=id;review.innerHTML='<summary>选做：阶段复习（3 题，不记录闯关、不解锁课程）</summary><p>每题都把前面不同课的概念连起来。可以反复作答，也可以跳过。</p>'+reviews[id].map((r,i)=>exercise(r,'review-'+id+'-'+i)).join('');summary.after(review);}
})();
