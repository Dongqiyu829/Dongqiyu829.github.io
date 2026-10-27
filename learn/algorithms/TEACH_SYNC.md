# COMP3711H Teaching Sync

Updated: 2026-10-27 (Asia/Shanghai)
Release: 20261027b
Repository: Dongqiyu829/Dongqiyu829.github.io, main, learn/algorithms/

This file is a repository handoff, not an automatic connection to ChatGPT.
Student answers, completion marks and mastery are not synchronized with a teacher.

## Mission and teaching contract

- HKUST undergraduate preparing for COMP3711H; Chinese short lessons, intuitive algorithms, rigorous proofs and practical implementation.
- One observable learning outcome per lesson; default main path 15–25 minutes. Split difficult topics, preserve core / rigorous / optional layers.
- Use one concrete problem, an attempted prediction, stepwise reasoning, a complete proof, independent transfer and a brief self-check.
- Exploration, prediction and transfer are distinct activities. Every lesson has an open response with hints and a reference solution; copy-to-teacher is manual, not semantic auto-grading.
- Publishing, checking boxes or reading solutions is not evidence of mastery. Keep MISSION / NOTES / learning-records local.

## Published lessons and planning

- Lesson 01: lessons/0001-binary-search-loop-invariant.html — lower_bound, index contract, boundary demo, invariant and counterexample to hi=mid-1; optional upper_bound.
- Lesson 02: lessons/0002-asymptotic-analysis.html — pair comparisons, inversion-counting background, n(n-1)/2 and a quadratic tight bound; transfer allows self-pairs.
- Lesson 03: lessons/0003-doubling-work-sum.html — doubling-loop work sums, general-n bounds, transfer changes <= to <.
- Lesson 04: lessons/0004-merge-sort-recursion-tree.html — concrete 8-element array, recursive calls/base case, linear merge, depth-by-depth tree, power-of-two counting then arbitrary-n two-sided proof. Main path 20–25 minutes; optional coding and comparison-count challenge. Transfer: split into 1 and m-1, derive quadratic work. No Master Theorem in this lesson.
- Lesson 05: lessons/0005-master-theorem.html — diagnose node/level/tree, compare own work m/m²/1 with leaf cost 1, derive equal/root/leaf concentration, then classic Master Theorem conditions and limits. 20–25 minute path; strict proof, transfer 4T(n/2)+n and optional C++/Python counter. The counter computes work totals; its own runtime is not the modeled algorithm runtime. No learner mastery is inferred.
- Lesson 06: lessons/0006-counting-inversions.html — design from quadratic enumeration to left/right/cross partition; sorted right head below left head contributes all remaining left elements at once. Strict correctness, general-n time bounds and C++/Python are optional layers. Independent transfer diagnoses equality; 1–3 minute layer-work recall is used directly in the analysis.
- assets/course-manifest.json is the source for published lesson IDs/paths, topic IDs, planned topic count and release. There are currently 6 published lessons and 24 planned topics; topics need not map one-to-one to pages. Research pages are excluded from lessons and completion counts.
- References: reference/binary-search-boundaries.html, reference/asymptotic-bounds.html, reference/doubling-sums.html, reference/merge-sort-tree.html, reference/master-theorem.html, reference/counting-inversions.html and reference/algorithm-answer-template.html.
- Previous interval-scheduling discussion previewed earliest-finish exchange reasoning: replacing F by E is safe when end(E)<=end(F)<=start(next). Do not infer full mastery from this preview or skip the foundations.

## Access and progress

- Every published lesson is freely accessible, with previous/next/catalog links. No quiz or completion-based unlocking.
- Keep the legacy key comp3711h-learning-progress-v1. Count unique completed IDs only within published lessons; retain other string IDs when saving.
- Malformed or denied storage must not crash interactions. Use current-page temporary state and an explicit notice; do not overwrite malformed stored data.
- Display published lesson count, personal completion / published lesson count, and planned topics separately.
- Open answers are not automatically saved, loaded or sent; optional manual save/load/delete drafts use separate per-origin/page/exercise keys, comp3711h-draft-v1. Explicit load replaces the current input, deletion retains it. Denied storage/quota/malformed drafts never crash copy or completion. Self-checks and drafts do not write completion records.

## Shared components and quality changes

- Lesson 02's extra closing p tag is fixed. All public HTML uses a standard validator, resource/link/anchor checks and duplicate-ID checks.
- All coding lessons use assets/compiler-lab.js. Lesson 01 programs are in assets/binary-programs.json; Lesson 03 uses assets/doubling-programs.json; Lesson 04 uses assets/merge-programs.json; Lesson 05 uses assets/master-programs.json; Lesson 06 uses assets/inversion-programs.json.
- assets/recursion-tree.js / .css now separate Split (raw subarrays/base cases, no completed merge charges) and Merge (sorted child returns, own merge writes, sorted node return). Inputs n=0,1,5,6,8,16; snapshots grouped by depth are explicitly not real execution order. Statically readable n=5 split/return details and the complete n=8 accounting table survive disabled JavaScript.
- Lesson 04 keeps its original single main outcome and 20-25 minute path. Peak auxiliary space, stack depth, cumulative writes vs simultaneous memory, and stable tie handling are optional disclosures; the snapshot cache is not a simulation of the sorting program's memory.
- assets/code-runner.js is only a compatibility loader for cached older Lesson 01 pages.
- Complete C++ and Python starters plus all tests are embedded as native HTML code banks; they survive third-party failure, JSON blocking and disabled JavaScript.
- populateCode requests are not treated as success. Confirmation requires matching code echoed from the current iframe and trusted origin/language. No automatic reinjection after user edits.
- Timeout / missing echo is explicit, with reset, reload, manual copy and standalone editor fallbacks. Mobile has a parent-page triggerRun button; it never asserts test success.
- assets/reflection.js copies open responses only after an explicit click; failed clipboard permission falls back to selection/manual copying.
- Native list semantics and accessible navigation names are used; reference print styles use dark text on white paper.

## Cache and release procedure

- Bump release only in assets/course-manifest.json.
- node scripts/prepare-site.cjs mechanically updates all local asset versions, embedded course metadata, statistics and code banks.
- node scripts/prepare-site.cjs --check detects drift; no bundler or website runtime package dependencies.
- Read current GitHub HEAD and file SHAs before changing the remote tree, preserve concurrent changes, and fast-forward with an expected SHA.
- Site HTML caching still follows GitHub Pages behavior; never promise instant refresh of an already-open old tab.

## Prior release acceptance (20261025a; historical)

- Local strict static checks: 9 HTML pages, 64 internal link/resource references (including 30 versioned assets), 1 fragment link; zero remaining HTML, ID, nesting, missing-resource or version errors.
- Browser fault/interaction matrix: 14 scenarios passed; application console/page errors zero. Desktop 1280px and mobile 390px / 320px; native no-JavaScript code banks and print-media references checked.
- Real OneCompiler service: both coding lessons and both languages received matching echoes and ran 8/8 tests, with reset/reload/refresh checks. Touch mobile 390px uses Ace rather than desktop Monaco; all four mobile combinations ran 8/8 via the page's Run button.
- Algorithm checks: C++ lower_bound 3234 combinations; Python lower_bound and upper-bound transfer 3234 each; pair-loop n=0..512; doubling/strict-boundary exact counts and bounds n=0..512.
- Public release 20261025a deployed successfully in commit 9ede1ebe354e06987edf3476210d3b39beb5047e (Pages run 40172669914). All 9 public pages, 9 distinct directly linked CSS/JS resources and the personal-site root returned HTTP 200; public 1280/390/320px layouts and legacy 1 / 3 progress checked.
- Deployed public-page C++/Python editors for Lessons 01 and 03 each ran 8/8 against real OneCompiler, including matched echoes, reset, iframe reload and default-C++ page refresh. The initial attempt before deployment completed timed out against the old page; the post-deployment rerun passed all four combinations.
- Full scope, file changes, actual vs simulated checks, boundary counts and remaining limitations: [docs/QUALITY_REPORT.md](docs/QUALITY_REPORT.md). Do not count local mock tests as online execution.
- Physical phones, OS software keyboards, Safari/iOS and a long-duration third-party outage are not verified by the headless viewport tests.

## Lesson 04 release acceptance (20261025b)

- Code commit 4266a3091d8f6cbf63c14a1677f00395251ea49b; Pages run 40174248413 completed successfully. See [docs/LESSON04_ACCEPTANCE.md](docs/LESSON04_ACCEPTANCE.md) for scope, changes, actual vs simulated checks and limitations.
- Static: 11 HTML pages, 85 internal link/resource references, 40 versioned asset references, 4 JSON and 8 production JS; zero errors. Existing browser acceptance expanded to 15 passed scenarios, zero application console/page errors, with 1280/390/320px and reference print checks.
- New C++ and Python Merge Sort implementations each passed 5345 arrays: sorted permutation, original input unchanged, exact merge writes, depth and two-sided bounds. Tree generator passed all 1026 sizes n=0..1025. Existing binary/pair/doubling algorithm regression also passed this run.
- Local-page + real service: Lessons 01/03/04 x C++/Python all six ran 8/8, with initial code, matching echoes, reset, iframe reload and refresh. Lesson 04 touch viewport 390x844 x both languages also ran 8/8 with Ace focus and page Run controls; not a physical-phone test.
- Public deployment: 11 pages and 11 distinct directly linked CSS/JS resources returned HTTP 200 with release 20261025b. Public 1280/390/320px layouts, exact tree totals, prev/route navigation, legacy 1 / 4 progress and optional completion 2 / 4 passed. Public Lesson 04 x C++/Python each ran 8/8 against real OneCompiler, including reset/reload/default-C++ refresh.
- Public editor page errors: zero JavaScript exceptions; one browser console network error for the personal-site root /favicon.ico (404), a cosmetic follow-up outside this course's asset scope. Do not claim the public browser console was entirely empty.
- Test harness corrections and initial failed attempts are disclosed in the report. No changes to shared Compiler Lab or progress runtime were needed for Lesson 04.

## Reusable standards and next teaching phase

See docs/TEACHING_STANDARD.md for lesson structure, misconception checklist, progress semantics, editor failure handling and the minimum acceptance matrix.
Lesson 04 is published and verified; no student mastery is inferred from publication or automated tests.
Next teaching decision: use the student's actual explanations of remaining-left counting and equality counterexamples to choose reinforcement or Randomized Quickselect. Earlier unbalanced-split/node-layer-tree diagnoses remain useful if those prerequisites are unclear; no new student response or mastery has been recorded by development.
Fifth-lesson design is preserved in [docs/LESSON05_PLAN.md](docs/LESSON05_PLAN.md) and implemented under the user's 2026-10-27 request. The page explicitly asks for node/layer/tree diagnosis, offers a return to Lesson 04 and keeps rigorous depth optional. We still have no new student answer: use actual explanations to decide reinforcement or deeper follow-up; publication is not a passed diagnosis and never an access gate.

## Research Frontiers (2026-10-27)

- research/index.html and research/0001-eth-claim.html form a freely accessible, separate route; no completion buttons and no writes to the completion store. Main curriculum ordering is unchanged. See docs/RESEARCH_POLICY.md and assets/research-catalog.json.
- ETH entry: OpenAI author, official announcement 2026-10-26, manuscript 10-17 revised 10-25, checked 2026-10-27; independent-review status. Primary artifact snapshot 42907c9e999cc00d6abe7a50bfc1023250edd1b9. PDF extraction was unavailable; official same-directory TeX abstract/main theorem, Lean 378 scope and Comparator configuration were read. No Lean build or independent proof certification is claimed.
- Paper claims poly(n+m) times 2 to O(n log log n / sqrt(log n)), and under fixed linear clause density 2 to O(n / sqrt(log n)); stated Lean scope has the weaker poly(L) times 2 to O(n (log log n)^2 / sqrt(log n)), canonical inputs and polynomial visited space. Do not collapse these bounds into one formalized claim.
- ETH/SETH, subexponential vs polynomial, and parameter growth in reductions are taught with small examples. Conditional Set Cover lower-bound implications are qualified; an invalidated hypothesis alone supplies no new Set Cover algorithm and does not erase unrelated NP/approximation hardness.
- Status changes must append evidence, date, old/new wording and impact; retain immutable source/version links. Monitoring is retrieval/reporting, not automatic GitHub publishing. Website updates are a separate, tested maintenance step; student answers/mastery are not synchronized.
- Set Cover, Subset Sum, modern Flow/Matching and fine-grained reductions are research candidates only; no unverified paper summaries are presented as completed topics.
- Current acceptance: [docs/LESSON05_FRONTIERS_ACCEPTANCE.md](docs/LESSON05_FRONTIERS_ACCEPTANCE.md). Code commit 7ef2f857736c28d67581a8dd8a74ceedab33d8bd; Pages run 40449423697 succeeded. Public 15 pages / 13 direct assets / 3 metadata-program JSONs returned HTTP 200 with release 20261027a. Public desktop/mobile-width layouts, Lesson 05 exact models, research status/progress isolation and navigation passed.
- This run: static 15 pages / 124 internal references / 55 versioned references / 6 JSON / 9 production JS, no errors; 17 browser scenarios passed with local application console/page errors zero. Master count C++/Python each 51 exact models plus input rejection and 8/8 fixtures, JS 51 models, 11 transfer/gap models and SAT toy truth table verified; earlier algorithms re-executed successfully.
- Lesson 05 real desktop and 390px touch-viewport C++/Python each ran 8/8 locally with real service; deployed public C++/Python also each ran 8/8 including reset/reload/default-C++ refresh. Public page exceptions zero; one known favicon 404 console network error. No physical phone or Lean proof rebuild is claimed.

## Split/Merge follow-up (20261025c)

- Scope: fourth-lesson visualization and optional supplements, reference card, next-lesson planning, and matching tests. Shared Compiler Lab, storage, free access, lesson count and the first three lesson bodies are preserved; old pages only receive mechanical release metadata/asset updates.
- Current acceptance: [docs/LESSON04_SPLIT_MERGE_ACCEPTANCE.md](docs/LESSON04_SPLIT_MERGE_ACCEPTANCE.md). Code commit 7a4628fb3479df1eacd1be8a45e8cc7eae5c7de4, Pages run 40193662382 successful.
- This run: static 11 pages / 85 internal references / 40 versioned references / 4 JSON / 8 production JS, zero errors; 15 browser scenarios passed, local application console/page errors zero. Split/Merge states tested in real Edge at 1280/390/320px for n=0,1,5,6,8,16 (114 states), plus reset, direct phase access, navigation, fault fallbacks and no-JavaScript reading.
- Model: n=0..1025 plus 1,050,626 unordered/duplicate/negative-input node-return snapshots verified. C++ and Python Merge Sort each passed 5345 actual arrays and 8/8 samples; prior binary/pair/doubling regression re-executed successfully. Space claim is a proof under a stated live-storage/reclamation model, not a measured RSS claim.
- Public: release 20261025c verified across all 11 pages and 11 direct assets; three widths checked; 38 actual UI phase states for all six sizes at 320px passed, with 1 / 4 legacy and 2 / 4 optional completion. Public Lesson 04 C++/Python each ran 8/8 against real OneCompiler with reset/reload/refresh; zero JavaScript page errors, one known favicon 404 console network error. Do not substitute simulated iframe checks for these actual runs.

## Monitoring correction and Lesson 06 (20261027b)

- The user confirms their ChatGPT research monitoring runs every Monday. The available local tool cannot independently read that cloud schedule or its hour; do not invent a time or claim it was tool-verified. A separate legacy local Codex heartbeat (id automation) was read as ACTIVE daily at 09:00 and is now PAUSED to avoid duplicate monitoring. No new monitor was created, and the ChatGPT schedule was not modified. Prior daily descriptions in the Lesson 05 acceptance document are explicitly corrected, not silently deleted.
- Monitoring means periodic retrieval/reporting. It is not automatic GitHub publishing; evidence-based website edits require a separate maintenance action and verification. Preserve ETH independent-review state, source dates and append-only history; no research verdict is inferred from news or repository timestamps.
- New course: same 20–25 minute core, concrete [2,4,1,3,5], naive baseline, three pair classes, a focused merge-count trace and equality counterexample. New reference: reference/counting-inversions.html. No broad rewrite of Lessons 01–05.
- New teaching rule: each new lesson begins with 1–3 minutes of directly reused prerequisite recall, with no forced revisit, unlock or mastery inference.
- Manual answer drafts implemented in assets/reflection.js without network requests or automatic saving/loading. Scope and overwrite warning are explicit. Existing responses/records remain untouched unless a user explicitly clicks an action.
- Acceptance: [docs/LESSON06_ACCEPTANCE.md](docs/LESSON06_ACCEPTANCE.md). Static: 17 pages / 143 internal references / 64 versioned references / 7 JSON / 10 production JS, zero errors or generation drift. Browser: 21 scenarios passed, local application console/page errors zero, widths 1280/390/320, no-JavaScript code banks and reference print media. New C++/Python each 14372 actual arrays and 8/8 fixtures; 3136 sorted-half traces; prior binary, pair/doubling, Merge Sort and Master models re-executed successfully.
- Local-page real OneCompiler: Lesson 06 C++/Python each 8/8 with matching echoes, resets/reloads/default-C++ refresh. 390x844 touch viewport real service each 8/8; not a physical phone. Code commit 64dfc1c7526bc0d234f43dd72892d3dd279d2a67, Pages run 40453518466 succeeded. Public 17 pages / 14 direct assets / 4 JSON returned HTTP 200, release 20261027b; all three widths, old tree/models, new merge trace, manual drafts, navigation, 1 / 6 and 2 / 6 progress passed. Public Lesson 06 C++/Python each actually ran 8/8 with reset/reload/refresh. Public page exceptions zero; one known root favicon 404 console network error. Old lessons' real third-party service was not rerun this round; their local algorithms and shared UI were.

## Follow-up improvements (not release blockers)

- Physical-phone validation: actual soft-keyboard behavior, small-screen editing and Safari/iOS. Headless touch viewports do not satisfy this item.
- Manual draft save/load/delete now available; automatic saving and cross-device synchronization remain out of scope. Physical phone / Safari / software-keyboard checks remain open.

## Primary sources

- https://amir.goharshady.com/teaching/honors-algorithms
- https://www.cs.umd.edu/class/spring2025/cmsc451-0101/lectures.html
- https://onecompiler.com/apis/embed-editor
- https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/90a37c49b07b105ea7a027abc67eddc6_MIT6_006F11_lec03.pdf#page=18
- https://www.cs.cornell.edu/courses/cs2110/2026sp/lectures/lec07/
- https://www.cs.ucdavis.edu/~bai/ECS122A/Notes/mastertheorem.pdf

