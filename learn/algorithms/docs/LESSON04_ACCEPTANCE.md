# Lesson 04 发布验收

日期：2026-10-25；资源版本：`20261025b`。

## 教学范围与改动

- 新增 `lessons/0004-merge-sort-recursion-tree.html`：20–25 分钟主线，具体数组 → 递归调用/边界 → merge → 递归树记账 → 双侧界 → 独立迁移；正确性、任意 n 的严格证明、编码和比较次数进阶分层展开。未加入 Master Theorem。
- 新增 `assets/recursion-tree.js`、`.css`：按层展开真实子数组和自身合并写入数；不使用动画或新运行依赖。支持 n=8、5、16、1、0；旁有静态账本与无 JavaScript 说明。
- 新增 `assets/merge-programs.json`：C++ / Python 完整起始代码与 8 个测试，复用现有 Compiler Lab 和原生 HTML 备用代码。
- 新增 `reference/merge-sort-tree.html`：可打印的算法、正确性与复杂度参考卡。
- 更新 `assets/course-manifest.json`、`index.html`、`reference/course-route.html`、第三课末尾导航；已发布分母由元数据变为 4，规划仍为 24 主题。其余旧 HTML 只机械更新共享元数据及资源版本，前三课正文与算法未重构。
- 更新 `scripts/test-site.cjs`、`test-editors-real.cjs`、`test-editors-mobile.cjs`、`package.json`；新增 `scripts/test-merge.cjs`、`merge-test-utils.cjs`。进度测试使用真实元数据数量，不再假定三课。
- 同步 `TEACH_SYNC.md`、`docs/TEACHING_STANDARD.md` 和本地课程路线/资源/教学笔记；未新增声称学习者掌握的新记录。

## 数学审阅要点

一次 merge 总长 m，输出恰写 m 个元素，不把比较数或全部操作都称作 m。树中节点只计自身工作，子调用另外记账；树深度不代表真实程序的执行次序。

n=2ᵏ 时有 k 个合并层，每层恰写 n 次，另有 n 个常数开销的叶子。对任意 n≥2，前 ⌊log₂n⌋ 层全是合并节点、每层 n；其余任一层≤n，最大深度 ⌈log₂n⌉，所以

`n⌊log₂n⌋ ≤ W(n) ≤ n⌈log₂n⌉`。

计入复制、分配、切片、控制和全部调用，单位代价模型下 `T(n)=Θ(W(n)+n)=Θ(n log n)`。n=0、1 单独处理。n=5 最后合并层只有 2 次写入，图示没有错误地把它也算成 n。

迁移题改拆成 1 与 m−1，独立写出 `n+(n−1)+⋯+2` 与二次双侧界；不以选择题或字符串匹配代替理解检验。答案需学生自行复制给教师反馈。

## 本轮实测

| 项目 | 结果与实际范围 |
|---|---|
| 生成一致性 | `prepare-site.cjs --check`，11 页均无漂移 |
| 静态 | 11 页 HTML、85 处内部链接/资源引用、40 处版本化资产引用、1 片段链接、4 JSON、8 生产 JS；错误 0 |
| 浏览器 | 15 场景通过，失败 0；应用 console/page errors 0。11 页分别在 1280/390/320px 检查无页面横向溢出；新树逐层工作量、终止、重置、导航、完成进度及动态 HTML 均通过 |
| 故障回退 | 含第四课的服务/JSON 阻断、手动复制、无 JavaScript 备用代码和核心内容通过；存储拒绝/损坏/额度及自由访问回归通过。属于模拟故障，不冒充外部服务成功 |
| 旧算法回归 | 第一/三课 C++、Python 各 8/8；二分每实现 3234 组；逐对与倍增计数 n=0..512 通过 |
| Merge Sort 实现 | C++、Python 各 5345 个数组，与标准排序对照；元素保留、输入不变、精确写入、最大深度及双侧界通过。含三值数组穷举至长度 7、n=0..513 的有序/逆序/全同/随机数组，以及 1024/2048/4096 附近规模 |
| 树模型与迁移 | n=0..1025 共 1026 个规模；各层无重叠、完整层工作、叶子/调用数、深度与总写入通过。1 与 m−1 迁移求和/上下界 n=2..513 通过 |
| 真实桌面编辑器 | 本地同版本页面 + 真实 OneCompiler：第一/三/四课 × C++/Python 六组均显示正确起始代码、匹配回传，补 TODO 实际运行各 8/8；切换、恢复、iframe 重载及刷新默认 C++ 通过 |
| 真实触控视口编辑器 | 第四课 × C++/Python，390×844 Edge 移动触控模拟 + 真实 OneCompiler，各 8/8；Ace 焦点、页面外置运行按钮、独立页链接及无根溢出通过；不是实体手机测试 |
| 视觉与打印 | 人工查看第四课桌面/390px 开头、320/390px 逐层图、白底深字参考卡打印媒体截图；全部参考页打印媒体无横向溢出 |

测试执行中遇到两类已处理问题：默认受限环境不能启动本机编译器，获准使用本机工具后重跑通过；扩展旧在线验收脚本时曾沿用第三课函数名识别，第四课代码已回传但可见文本断言超时，修正为 mergeSort/merge_sort 后完整六组重跑通过。未把这些失败尝试计作通过。

## 公开部署复核

待本版本部署后补充公开页面、资源发布号、进度、图示、导航与第四课双语言真实运行结果。以上真实服务测试使用本地同版本父页面，不能替代此项公开站点复核。

## 保留的架构与后续清单

保持原进度键和异常降级、自由访问、共享 Compiler Lab、统一资源生成及原验收工具。学习者答案没有自动同步 ChatGPT，也没有用测试或完成标记推断掌握。

- 后续：实体手机、软键盘遮挡、Safari/iOS 实测。
- 后续：可选开放题草稿保护；先定义选择保存、设备范围、隐私与删除机制，当前回答仍不自动保存。
- 上述两项不阻塞第四课发布。长期第三方服务可用性无法保证，完整代码与独立编辑器是回退。
- 下一课先看迁移回答再决定补练或独立讲 Master Theorem；不自动宣告已具备前置知识。

复验：`node scripts/prepare-site.cjs --check`、`node scripts/check-site.cjs`、`node scripts/test-algorithms.cjs`、`node scripts/test-merge.cjs`、`node scripts/test-site.cjs`、`node scripts/test-editors-real.cjs`、`node scripts/test-editors-mobile.cjs`。`COURSE_EDITOR_LESSON=0004` 可限定第四课；`COURSE_TEST_ORIGIN=https://dongqiyu829.github.io/learn/algorithms` 指向公开站点。原始 JSON 和截图保留在本地 `work/qa/`。
