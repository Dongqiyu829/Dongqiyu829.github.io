# 第六课与维护记录验收 · 20261027b

日期：2026-10-27（Asia/Shanghai）。范围：Counting Inversions 短课、参考卡、轻量合并计数演示、可选本机草稿、监测记录纠正与课程路线。保留前三至五课正文、统一 Compiler Lab、既有完成键和自由访问；旧页面的 release/元数据机械同步。

## 教学与数学审阅

单一主要成果：右侧队首严格小于左侧队首时，能用有序性解释一次增加左侧剩余长度。主线 20–25 分钟，从 [2,4,1,3,5] 手数三对与二次基线开始；按原位置分三类，建立“有序数组 + 计数”的递归契约。1–3 分钟回忆线性合并层，并直接用于本课复杂度分析。

局部合并不变量、长度归纳和任意 n 的上下界保留为折叠证明。n≥2 时完整层下界 n⌊log₂n⌋、每层≤n 与至多 ⌈log₂n⌉ 个合并层给出 Θ(n log n)；n=0、1 为常数。计数采用单位代价整数模型，C++ 用 long long。独立迁移要求最小相等反例、正确/错误计数与修复理由，不进行字符串匹配批改；[1,1] 正确 0，[2,2,1] 正确 2。315/493 仅可选后续。

来源实际读取 Sedgewick/Wayne 的原始 Inversions.java，以及 LeetCode 原题页。Princeton 课件 PDF 获取返回 403，未宣称读到该 PDF；采用原始代码核对严格比较、批量增量和长整数，本站例子/证明另行审阅及执行检验。未另聘独立审稿人，自动测试不代替证明。

## 修改文件与原因

| 文件 | 作用 |
|---|---|
| lessons/0006-counting-inversions.html；reference/counting-inversions.html | 新课与简洁复习卡，证明/代码分层、导航、无 JS 原生代码后备 |
| assets/inversion-merge.js；assets/inversion-programs.json | 六种有序半区示例的逐步计数；C++/Python 起始程序及 8 个测试 |
| assets/reflection.js；assets/short-lesson.css | 用户主动保存/载入/删除本机草稿，存储容错；沿用样式、适配小屏 |
| assets/course-manifest.json；index.html；reference/course-route.html；lessons/0005-master-theorem.html | 已发布课程变为 6，规划仍 24；目录/路线/下一课链接 |
| 其余既有 HTML | 仅统一 release/内嵌元数据及机械生成内容，没有重构旧课 |
| scripts/test-inversions.cjs；scripts/inversion-test-utils.cjs | 真实 C++/Python 算法与计数复杂度边界测试 |
| scripts/test-site.cjs；scripts/test-editors-real.cjs；scripts/test-editors-mobile.cjs；scripts/package.json | 将第六课、草稿失败路径与真实服务纳入可复验工具 |
| TEACH_SYNC.md；docs/TEACHING_STANDARD.md；docs/RESEARCH_POLICY.md；docs/LESSON05_FRONTIERS_ACCEPTANCE.md；本报告 | 前置回忆规范、误区表、真实监测来源、验收范围与后续计划 |

本地 COURSE-ROUTE.md、NOTES.md、RESOURCES.md 同步维护；学生学习记录不因开发/测试而新增。测试使用隔离浏览器，不接触用户实际完成数据；work/qa 仅为本地产物。

## 已通过：静态、算法执行、真实浏览器分别列示

| 类别 | 本轮结果 |
|---|---|
| HTML/版本/链接静态 | 17 HTML、143 内部链接/资源、64 版本化引用、1 片段、7 JSON、10 生产 JS；HTML、ID、嵌套、缺失资源、版本错误均 0；生成检查无漂移 |
| 新算法真实执行 | C++、Python 完成 TODO 后各 8/8；各 14372 数组：三值数组长度 0..8 穷举、4000 随机、奇偶/有序/逆序/重复/负数/整数极值/2 的幂附近；小数组与 Θ(n²) 基线交叉验证，排序/输入不变检查通过 |
| 复杂度与大计数 | 两种语言的实际合并输出写入数与 W=n(⌈log₂n⌉+1)−2^⌈log₂n⌉ 相符；空数组单独处理。n=100000 逆序数组计数 4,999,950,000，避免 32 位溢出 |
| 演示纯模型 | 3136 对排序后半区穷举，比较暴力跨区间计数、排序输出、每一步增量、总步数及输入不变 |
| 旧算法真实回归 | 二分每变体 3234 组，逐对/倍增 n=0..512；Merge Sort 每语言 5345 数组，1026 树规模与 1,050,626 节点快照；Master 每语言 51 模型及 8/8、JS 51、迁移 11 和 SAT 小表均通过 |
| 真实 Edge UI，本地页面 | 21 场景通过、失败 0；应用 console/page errors 均 0。17 页在 1280/390/320px 无根横向溢出；新增六示例的精确增量、相等不计、重置/结束按钮、导航通过 |
| 本机草稿 UI | 主动保存/载入/删除、页面隔离、刷新不自动载入、损坏 JSON、读取拒绝、写入配额失败通过；保留当前回答/复制退路，完成 JSON 字节不变 |
| 故障与无 JS | 阻断外部服务/程序 JSON 后可复制两种完整起始代码；无 JS 核心知识、原生折叠和代码可读。模拟错误来源/旧语言回传、无回传超时单列为 mock 测试，不冒充真实服务 |
| 本地父页 + 真实 OneCompiler | 第六课 C++、Python 起始代码可见、匹配回传、补 TODO 后真实各 8/8；语言切换、重填、iframe 重载、刷新默认 C++ 通过；页面异常/console 错误 0 |
| 390×844 触控视口 + 真实服务 | 第六课 C++、Python 各 8/8；Ace 焦点、页面 Run、独立页链接及无页面溢出通过。这是 Edge 模拟视口，非实体手机 |
| 视觉与打印媒体 | 查看新课手机标题、批量 +2、相等 +0、草稿控件截图与参考卡打印媒体；全站参考卡打印布局检查通过 |
| 进度与研究隔离 | 分母来自真实 6 课、24 规划主题独立；旧重复/未知 ID 保留，研究/开放回答不写完成记录。ETH catalog/正文仍为独立验证中；来源、原有日期、证据范围和追加历史不变，没有凭仓库时间戳升级结论 |

## 监测配置纠正

用户确认 ChatGPT 的算法前沿监测为每周一；现有工具不能独立读取该云端任务的时刻，故未臆填具体时间。发现另一个遗留本地 Codex heartbeat 原为每日 09:00 ACTIVE，已通过管理工具暂停并回读配置确认 PAUSED，避免双重监测；未新建任务、未改变 ChatGPT 频率。

定时检索/报告不等于自动发布 GitHub。网站证据更新仍须另行检查原始材料、追加历史、运行验收后发布。旧验收报告保留原任务创建历史，明确更正其与现配置的关系。

## 公开部署复核

代码提交：[64dfc1c7](https://github.com/Dongqiyu829/Dongqiyu829.github.io/commit/64dfc1c7526bc0d234f43dd72892d3dd279d2a67)；[Pages 40453518466 部署成功](https://github.com/Dongqiyu829/Dongqiyu829.github.io/actions/runs/40453518466)。[公开第六课](https://dongqiyu829.github.io/learn/algorithms/lessons/0006-counting-inversions.html)。发布前逐一核对 33 个目标 blob SHA，并基于最新 HEAD 的 expected SHA 非强制快进，保留仓库其他内容。

- 公开 17 页、14 个去重直接 CSS/JS 资源、4 个版本化 JSON 与个人站根链接均 HTTP 200。页面元数据与资源均为 20261027b；1280/390/320px 无根横向溢出，JavaScript 页面异常 0。
- 第四课 n=0,1,5,6,8,16 的 38 个 Split/Merge 状态回归，第五课三个精确模型、第六课 +2→总 3 与相等总 0 的真实 UI 操作通过。第三→第四→第五→第六→路线导航通过。
- 旧重复/未知 ID 正确显示 1 / 6，新完成标记后显示 2 / 6；研究仍独立验证中且不写完成 JSON。公开第六课手动草稿保存、刷新不自动载入、主动载入与删除均通过，原完成数据不变。
- **公开父页 + 真实 OneCompiler**：第六课 C++、Python 起始代码可见、有匹配回传，补 TODO 后真实各 8/8；恢复起始代码、iframe 重载、刷新默认 C++ 通过。JavaScript 页面异常 0；控制台保留个人站根 favicon 404 的一条已知非阻塞网络错误，不宣称公共控制台全零。
- 以上为本轮独立浏览器实测；390×844 真实服务测试使用同版本本地父页，公开父页服务测试使用桌面视口，两者未混为实体机验证。

## 失败、未执行与后续优先级

- 当前已完成的课程功能检查无未解决失败；个人站根 favicon 404 为已知低优先级问题，未扩大修改范围。环境受限时使用获准的独立无头 Edge/本地原生编译器执行；未将仅源码正确当成服务运行通过。
- 未执行：实体手机、Safari/iOS、软键盘遮挡；旧课程本轮没有重跑第三方真实编译服务，已重跑其实际本地算法与共享 UI 故障回归。长期第三方服务可靠性没有保证。
- 本轮未重建 Lean、未认证 ETH 论文、未取得足以改变研究状态的独立原始证据；没有把定时检索或新闻转述当成确认。
- 下一教学决策依据学生对跨区间计数和相等反例的实际解释，再补练或进入 Randomized Quickselect。研究候选顺序保留 Set Cover、Subset Sum、Flow/Matching、Fine-Grained Reductions，本轮不堆积新专题。实体机验证优先于装饰性改动。

复验：`node scripts/prepare-site.cjs --check`、`node scripts/check-site.cjs`、`node scripts/test-inversions.cjs`、`node scripts/test-algorithms.cjs`、`node scripts/test-merge.cjs`、`node scripts/test-master.cjs`、`node scripts/test-site.cjs`。真实服务用 `COURSE_EDITOR_LESSON=0006` 限定范围，`COURSE_TEST_ORIGIN` 指向公开课程路径；移动版执行 `node scripts/test-editors-mobile.cjs`。本地 JSON/截图记录于 work/qa，均不等于学生掌握证据。
