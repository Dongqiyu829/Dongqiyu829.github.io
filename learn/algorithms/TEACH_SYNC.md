# COMP3711H Teaching Sync

Updated: 2026-10-25 (Asia/Shanghai)
Release: 20261025a
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
- assets/course-manifest.json is the source for published lesson IDs/paths, topic IDs, planned topic count and release. There are currently 3 published lessons and 24 planned topics; topics need not map one-to-one to pages.
- References: reference/binary-search-boundaries.html, reference/asymptotic-bounds.html, reference/doubling-sums.html and reference/algorithm-answer-template.html.
- Previous interval-scheduling discussion previewed earliest-finish exchange reasoning: replacing F by E is safe when end(E)<=end(F)<=start(next). Do not infer full mastery from this preview or skip the foundations.

## Access and progress

- Every published lesson is freely accessible, with previous/next/catalog links. No quiz or completion-based unlocking.
- Keep the legacy key comp3711h-learning-progress-v1. Count unique completed IDs only within published lessons; retain other string IDs when saving.
- Malformed or denied storage must not crash interactions. Use current-page temporary state and an explicit notice; do not overwrite malformed stored data.
- Display published lesson count, personal completion / published lesson count, and planned topics separately.
- Open answers are not persisted or sent automatically; self-checks do not write completion records.

## Shared components and quality changes

- Lesson 02's extra closing p tag is fixed. All public HTML uses a standard validator, resource/link/anchor checks and duplicate-ID checks.
- Both coding lessons now use assets/compiler-lab.js. Lesson 01 programs are in assets/binary-programs.json; Lesson 03 uses assets/doubling-programs.json.
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

## Acceptance status for this maintenance run

- Local strict static checks: 9 HTML pages, 64 internal link/resource references (including 30 versioned assets), 1 fragment link; zero remaining HTML, ID, nesting, missing-resource or version errors.
- Browser fault/interaction matrix: 14 scenarios passed; application console/page errors zero. Desktop 1280px and mobile 390px / 320px; native no-JavaScript code banks and print-media references checked.
- Real OneCompiler service: both coding lessons and both languages received matching echoes and ran 8/8 tests, with reset/reload/refresh checks. Touch mobile 390px uses Ace rather than desktop Monaco; all four mobile combinations ran 8/8 via the page's Run button.
- Algorithm checks: C++ lower_bound 3234 combinations; Python lower_bound and upper-bound transfer 3234 each; pair-loop n=0..512; doubling/strict-boundary exact counts and bounds n=0..512.
- Public release 20261025a deployed successfully in commit 9ede1ebe354e06987edf3476210d3b39beb5047e (Pages run 40172669914). All 9 public pages, 9 distinct directly linked CSS/JS resources and the personal-site root returned HTTP 200; public 1280/390/320px layouts and legacy 1 / 3 progress checked.
- Deployed public-page C++/Python editors for Lessons 01 and 03 each ran 8/8 against real OneCompiler, including matched echoes, reset, iframe reload and default-C++ page refresh. The initial attempt before deployment completed timed out against the old page; the post-deployment rerun passed all four combinations.
- Full scope, file changes, actual vs simulated checks, boundary counts and remaining limitations: [docs/QUALITY_REPORT.md](docs/QUALITY_REPORT.md). Do not count local mock tests as online execution.
- Physical phones, OS software keyboards, Safari/iOS and a long-duration third-party outage are not verified by the headless viewport tests.

## Reusable standards and next teaching phase

See docs/TEACHING_STANDARD.md for lesson structure, misconception checklist, progress semantics, editor failure handling and the minimum acceptance matrix.
No Lesson 04 is authored in this maintenance run.
Next: introduce recursion calls, splitting subproblems and recursion-tree per-level vs total work using Merge Sort. Keep Master Theorem separate; use actual student transfer answers to decide the next scope.

## Primary sources

- https://amir.goharshady.com/teaching/honors-algorithms
- https://www.cs.umd.edu/class/spring2025/cmsc451-0101/lectures.html
- https://onecompiler.com/apis/embed-editor

