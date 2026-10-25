# 课程质量验收报告

日期：2026-10-25；资源版本：`20261025a`。范围：现有三课、五张参考/路线页及共享组件。保留原有数学主线，未开发第四课。

代码提交：[9ede1ebe](https://github.com/Dongqiyu829/Dongqiyu829.github.io/commit/9ede1ebe354e06987edf3476210d3b39beb5047e)。[Pages 部署成功](https://github.com/Dongqiyu829/Dongqiyu829.github.io/actions/runs/40172669914)。[公开课程](https://dongqiyu829.github.io/learn/algorithms/index.html)。

## 1. 文件与修改原因

以下路径均相对于 `learn/algorithms/`：

| 文件 | 修改原因 |
|---|---|
| `index.html`、`assets/course-manifest.json`、`assets/quiz.js` | 区分已发布页面、个人完成与规划主题；兼容旧记录、损坏数据与不可用存储 |
| `lessons/0001-binary-search-loop-invariant.html`、`0002-asymptotic-analysis.html`、`0003-doubling-work-sum.html` | 修复第二课标签；补充独立迁移回答、提示、参考解与自检；第二课加入逆序对背景；第一/三课统一编辑器和原生备用代码 |
| `assets/compiler-lab.js`、`assets/code-runner.js`、`assets/binary-programs.json` | 共享双语言编辑器；真实代码回传确认、超时回退、移动端外置运行；保留旧入口兼容 |
| `assets/reflection.js` | 显式复制开放回答；不自动上传或伪装智能批改 |
| `assets/course.css`、`binary-search-demo.css`、`binary-search-demo.js`、`work-sum-lab.css`、`work-sum-lab.js` | 可读反馈、原生列表、移动布局、打印配色；演示算法保持不变 |
| `reference/algorithm-answer-template.html`、`asymptotic-bounds.html`、`binary-search-boundaries.html`、`course-route.html`、`doubling-sums.html` | 统一资源版本、元数据、合法标记及导航语义；路线时长对齐 |
| `scripts/prepare-site.cjs`、`package.json`、`check-site.cjs`、`test-utils.cjs`、`test-site.cjs`、`test-algorithms.cjs`、`test-editors-real.cjs`、`test-editors-mobile.cjs` | 简单可复用的生成、静态、容错、边界及真实服务验收；依赖只用于开发检查 |
| `docs/TEACHING_STANDARD.md`、本报告、`TEACH_SYNC.md` | 固化教学骨架、误区检查表、验收结果与下一阶段安排 |

本地教学记录与公共资产分开维护；未把点击、通过测试或自检自动记为“已经掌握”。

## 2. 已确认并修复的问题

- 第二课 O/Ω/Θ 区域多余的 `</p>` 已移除；全部页面通过严格 HTML 检查。
- `x / 24` 改为已发布 **3**、个人 **x / 3**、规划 **24 个主题**。页面数与主题数分离，由同一元数据生成。
- 所有 CSS/JS/JSON 引用统一 `?v=20261025a`；生成器同时维护嵌入元数据与完整备用代码，`--check` 可发现漂移。
- 发送 `populateCode` 不再等于成功：只接收当前 iframe、可信来源和匹配语言的完整代码回传。超时明确显示未确认，保留复制、重载与独立编辑器入口；学生编辑后不自动覆盖。
- 实际触控视口测试发现第三方窄屏工具栏可能隐藏内部 Run；已增加课程页面的运行按钮，调用官方 `triggerRun`，文案仅说明请求运行，测试结果由编辑器输出。
- 三课均保留短课主线，增加真正开放的迁移推导与自检；提供提示和折叠参考解，不用字符串匹配冒充数学批改。

## 3. HTML、资源与链接

`node scripts/check-site.cjs`：9 个 HTML 页面，64 个内部链接/资源引用（含 30 处版本化资产引用）、1 个片段链接、3 个 JSON、7 个生产 JS；HTML、重复 ID、非法嵌套、缺失资源、导航与版本错误均为 **0**。动态演示 DOM 也检查；浏览器序列化布尔属性的写法差异仅在动态检查中豁免。

公开站点另行实际请求：9 页全部 HTTP 200，9 个去重后的直接 CSS/JS 资源全部 HTTP 200 且版本一致，个人网站根链接 HTTP 200；页面嵌入发布号均为 `20261025a`。

## 4. 编辑器实际运行结果

桌面：**已部署公开页面 + 真实 OneCompiler**，1280px Edge。触控：**本地同版本页面 + 真实 OneCompiler**，390×844 移动触控模拟。均实际填入 TODO 的正确实现，再运行完整测试，不以静态阅读或模拟回传代替运行。

| 课程/语言 | 公开站点桌面运行 | 触控视口运行 |
|---|---|---|
| Lesson 01 C++ | 8/8 | 8/8 |
| Lesson 01 Python | 8/8 | 8/8 |
| Lesson 03 C++ | 8/8 | 8/8 |
| Lesson 03 Python | 8/8 | 8/8 |

四组均检查完整起始代码可见、真实匹配回传、语言切换、恢复起始代码及重载 iframe；刷新回到默认 C++。桌面使用 Monaco，触控视口使用 Ace；触控焦点和页面外置运行按钮均实际操作。多行完整代码通过官方 `populateCode` 注入后执行。

独立的模拟容错测试覆盖快速切换、旧窗口/错误来源/错误语言消息、无回传超时、服务及 JSON 请求被阻断、剪贴板失败、JavaScript 禁用。两种语言的完整起始代码与各 8 个测试均保留在原生 HTML，可展开复制。模拟场景不计为第三方真实运行。

部署期间第一次公开编辑器检查读到旧页面，未找到新组件而超时，记为失败尝试；待 Pages 成功并确认新发布号后重新执行，最终四组全部通过。

## 5. 算法边界

- 第一/三课 C++ 与 Python 的完整测试架各 8/8，本地真实编译/执行。
- C++ `lower_bound`：3234 组有序数组/目标，与标准库对照。
- Python `lower_bound` 与迁移 `upper_bound`：各 3234 组，与 `bisect` 对照，覆盖空数组、重复值、负数及范围外目标。
- 第二课实际展示的逐对循环：C++ 对 `n=0..512` 检验 `n(n−1)/2`。
- 第三课原边界与严格边界迁移：Python 对 `n=0..512` 检验精确计数与上下界，含零、二次幂及相邻值。

## 6. 页面与交互

本地浏览器矩阵 **14 项通过、0 失败**，应用控制台/页面异常 **0**。9 页分别检查 1280、390、320px，无页面级横向溢出；检查可见截图、互动反馈、原生备用代码与五张参考页的打印媒体样式。公开同版本 9 页再次检查这三种宽度，并人工查看 320px 首页截图；无应用页面异常。公开真实编辑器运行另行执行，未在布局检查中冒充服务成功。

## 7. 进度、存储与访问

沿用 `comp3711h-learning-progress-v1`。有效旧记录保留，去重统计，未知课程 ID 不删除。损坏 JSON、非数组、存储读取被拒、写入额度耗尽均有测试：页面继续交互、说明临时状态，不覆盖损坏原记录。公开站点旧记录包含重复与未知 ID 时正确显示 **1 / 3**。

全部已发布课程、上一课/下一课/目录自由访问，无答题、完成或顺序解锁。完成标记可选且仅在本设备；开放回答由学生主动复制给教师，网站没有自动同步 ChatGPT 答案或掌握情况。

## 8. 限制与后续优先级

1. **尚未执行**：实体手机、操作系统软键盘遮挡、Safari/iOS、长时间真实服务中断。优先补一次实体手机验收；当前“移动通过”限定为 Edge 触控视口模拟。
2. OneCompiler 为外部服务，不能保证其持续可用；真实接口不能确认某次执行已完成时不显示通过，始终提供完整代码与独立编辑器回退。
3. 资源版本解决旧资产复用；HTML 本身仍遵循 GitHub Pages 缓存，已打开旧标签页需刷新。
4. 下一教学任务再进入第四课：先讲递归调用、子问题与 Merge Sort 递归树，明确单层工作和总工作；Master Theorem 独立安排。使用上一课关键求和作短复习，根据学生真实迁移回答调整进度。

复验入口：`node scripts/prepare-site.cjs --check`、`node scripts/check-site.cjs`、`node scripts/test-site.cjs`、`node scripts/test-algorithms.cjs`、`node scripts/test-editors-real.cjs`、`node scripts/test-editors-mobile.cjs`。真实桌面公开验收设置 `COURSE_TEST_ORIGIN=https://dongqiyu829.github.io/learn/algorithms`。本地原始结果位于 `work/qa/{static,browser,algorithm,real-editors,mobile-editors,public-smoke}-results.json`，不作为公共学习记录发布。
