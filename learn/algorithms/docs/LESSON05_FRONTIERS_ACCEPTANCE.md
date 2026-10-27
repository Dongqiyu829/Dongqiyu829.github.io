# 第五课与算法前沿栏目验收

日期：2026-10-27（Asia/Shanghai）；资源版本：`20261027a`。

## 交付范围

- 第五课 `lessons/0005-master-theorem.html`，20–25 分钟主线。先诊断第四课三本账，具体递推逐层手算，比较等量/根/叶子集中，再引入经典 Master Theorem、条件与不适用边界。严格证明、开放迁移 4T(n/2)+n 和编码分层可选。
- `assets/level-work.js`、`master-programs.json` 与 `reference/master-theorem.html`：逐层计数、C++/Python 模型计数器和参考卡。明确叶子成本为 1，n=8 的线性模型总计 32 与第四课只数 merge 的 24 不混用；计数器本身运行时间不是所模拟的工作量。
- 独立 `research/` 栏目、ETH 专题、`assets/research-catalog.json`、`research.css`、`docs/RESEARCH_POLICY.md`；记录署名、首次官方公告、稿件日期、修订、证据状态、核查日、先修建议与追加式历史。
- 首页、路线与第四课下一课导航更新；主线 5 节，规划仍 24 主题。研究条目没有课程 ID 或完成按钮，不写完成存储，不参与分母。
- 生成器、静态与浏览器工具扩展到 research/；新增 `scripts/test-master.cjs`、`master-test-utils.cjs`，扩展双语言编辑器与浏览器验收。共享 Compiler Lab 和 quiz 运行逻辑未重写；旧页除导航外仅机械同步资源版本/元数据。
- `TEACH_SYNC.md`、课程路线、教学规范及本地资源/目标同步。新本地记录仅说明用户明确扩展研究学习目标，不是学习掌握证据；不发布内部记录。

## 数学与研究证据审阅

第五课明确范围 n=b^k、固定整数 b≥2、a≥1、非负 f、T(1)=Θ(1)。三例精确计数 n(k+1)、2n²−n、2n−1，证明上下匹配；经典情形 1/3 的多项式差距、情形 3 的 regularity 条件写明。非幂/任意取整不由本课幂规模证明自动推出。n log n 的间隙与 n−1 缩小反例分开说明。

ETH 条目严格标为 **前沿研究，独立验证中**：署名 OpenAI，公告 2026-10-26；稿件 10-17 修订 10-25；最近核查 10-27，固定材料版本 `42907c9e999cc00d6abe7a50bfc1023250edd1b9`。核对官方公告、论文同目录 TeX 的摘要/定理 1.1、Lean 378 范围、Comparator 目标与真实 solution 映射；没有独立认证新证明。

自然语言稿主张固定 k 的时间为 poly(n+m) 乘 `2^{O_k(n log log n / sqrt(log n))}`，固定线性密度时更强；Lean 范围是规范位编码 L、poly(L) 乘 `2^{O_k(n (log log n)^2 / sqrt(log n))}`，并覆盖多项式访问空间。三者分列，没有把最强稿件界写成 Lean 已覆盖。解释亚指数并非多项式、归约参数膨胀、条件下界失去前提不自动提供 Set Cover 算法。

P/NP、ETH/SETH 的概念与 Set Cover 相关猜想分别参考原始讲义/论文。研究证明仅作声明/范围核查；没有测过或复现新 SAT 算法、没有执行 Lean、没有宣称独立审查完成。论文署名与原始材料在专题直接可查；其他候选暂为计划，不虚构论文进展。

## 本轮通过

| 项目 | 实际结果 |
|---|---|
| 静态与链接 | 15 页；124 处内部链接/资源、55 处版本化资产、1 片段链接、6 JSON、9 生产 JS；HTML/ID/嵌套/资源/版本错误 0，生成无漂移。研究目录/正文与 catalog 状态和日期交叉检查 |
| 浏览器 | 17 场景通过、失败 0；应用 console/page errors 0。15 页分别在 1280/390/320px 检查无横向溢出；新课三种模型/三种规模、旧课 Split/Merge、存储容错、导航、选择反馈、开放回答与不自动记完成均通过 |
| 新数学/算法 | C++/Python 各 51 个实际递归模型（n=1..65536 的 2 的幂×三种自身工作），精确值与非法输入拒绝通过；各 8/8 代码样例。JS 同样 51 模型；11 个迁移/对数间隙模型核对。3-SAT 8 种赋值，满足数 5，与静态表一致 |
| 旧算法回归 | 二分每实现 3234 组，逐对/倍增 n=0..512；Merge Sort C++/Python 各 5345 数组，1026 树规模及有序返回检查通过 |
| 真实桌面在线 | 本地同版本父页 + 真实 OneCompiler，第五课 C++/Python：正确起始代码可见、真实匹配回传，补 TODO 实际各 8/8；语言切换、恢复、iframe 重载、刷新默认 C++ 通过 |
| 真实触控视口在线 | 390×844 Edge 移动触控模拟 + 真实 OneCompiler，第五课 C++/Python 各 8/8；Ace 焦点、页面运行按钮、独立页链接及无根溢出通过。不是实体机 |
| 研究隔离 | 浏览研究目录/正文、输入及复制开放回答后原完成 JSON 不变，返回首页正确显示 1 / 5；无研究完成按钮、无访问锁 |
| 视觉与打印 | 查看第五课模型、ETH 日期/状态块和长公式对照表的桌面/手机截图，以及 Master Theorem 参考卡打印媒体；全部参考卡打印媒体无横向溢出 |

## 失败尝试与修复

- 首次完整浏览器检查发现 ETH 复杂度表在 320px 溢出。新增仅作用于研究正文的换行/固定表布局，完整 17 场景重跑通过，未放宽溢出断言。
- PDF 原始抓取受网络/内容类型限制，未成功解析 PDF；通过 GitHub 连接器读取同目录官方 TeX，核验摘要与主定理。此替代来源在资源与交接中明示，不谎称下载或完整验证论文。
- 首次自动化创建缺少 thread destination，返回参数错误；补齐后创建成功。未把首次错误计为成功，也未创建重复任务。

## 持续研究核查

已为本聊天配置每日静默证据核查。无实质变化不通知；仅遇正式独立确认、具具体数学依据的关键反驳、实质修订/撤回或与现有专题有关的重大新证据才更新。追加版本、日期、来源和影响，保留旧记录；发布前重新读 HEAD 并测试。定时检查不是实时同步，也不会同步学生答案或推断掌握。

## 公开部署复核

代码提交：[7ef2f857](https://github.com/Dongqiyu829/Dongqiyu829.github.io/commit/7ef2f857736c28d67581a8dd8a74ceedab33d8bd)；[Pages 部署成功](https://github.com/Dongqiyu829/Dongqiyu829.github.io/actions/runs/40449423697)。[第五课](https://dongqiyu829.github.io/learn/algorithms/lessons/0005-master-theorem.html)、[算法前沿](https://dongqiyu829.github.io/learn/algorithms/research/index.html)。

- 公开 15 页、13 个去重后的直接 CSS/JS 共享资源、站点根链接均 HTTP 200；全部页面内元数据/引用为 `20261027a`。另核对 course-manifest、research-catalog、master-programs 三个带版本参数 JSON 均 HTTP 200，研究状态对应。
- 公开 1280/390/320px 无页面级横向溢出；页面 JavaScript 异常 0。第四课六输入/38 状态回归通过，第五课 n=8 的三种模型分别得到 15、32、120；第三→第四→第五→路线导航通过。
- 旧重复/未知 ID 记录正确显示 1 / 5，新完成标记后为 2 / 5；研究访问不改原始 JSON、无完成按钮。测试使用隔离浏览器，不接触用户的实际进度。
- **公开父页 + 真实 OneCompiler**：第五课 C++、Python 起始代码可见并有匹配回传，补 TODO 实际运行各 **8/8**；恢复代码、iframe 重载、刷新默认 C++ 通过。JavaScript 页面异常 0；公共控制台仍有站点根 favicon 404 的一条非阻塞网络错误，不宣称全零。

## 未执行与保留事项

实体手机、软键盘遮挡、Safari/iOS、开放题草稿保护仍未实现/未验，不阻塞发布。根 favicon 404 仍属低优先级。本轮未重建 Lean 或对新 ETH 证明进行完整独立审查；形式化与独立确认不能用网页测试替代。未重跑旧课第三方在线编译器，但旧算法、网页与故障回退已回归。

复验命令：`node scripts/prepare-site.cjs --check`、`node scripts/check-site.cjs`、`node scripts/test-master.cjs`、`node scripts/test-algorithms.cjs`、`node scripts/test-merge.cjs`、`node scripts/test-site.cjs`。新在线课可用 `COURSE_EDITOR_LESSON=0005` 限定，`COURSE_TEST_ORIGIN` 指向公开课程路径。JSON 与截图在本地 work/qa，不作为学生学习记录发布。
