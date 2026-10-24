# COMP3711H Teaching Sync

Updated: 2026-10-24 (Asia/Shanghai)

This file is a lightweight handoff between the ongoing Teach/Codex workspace and the public course website. It is not a claim that those conversations are directly connected; the GitHub repository is the shared source of truth.

## Mission and preferences
- HKUST undergraduate preparing for COMP3711H; study a short concept every few days.
- Prefer algorithms/LeetCode for now rather than abstract mathematical topics.
- Learning format: intuitive problem → formal definition / proof → interactive counterexample or worked case → concrete transfer problem.
- Challenge misconceptions precisely; encourage attempts first, followed by rigorous feedback.
- Split difficult topics across multiple sessions rather than giving long monologues.
- Main materials: HKUST Honors Algorithms (Amir Goharshady) and UMD CMSC451.

## Existing course
- Lesson 01: `lessons/0001-binary-search-loop-invariant.html` (beginner-first lower_bound: indices and return contract → discard reasoning → step-by-step boundary demo → invariant → C++ / Python two-line exercise). Formal proof and upper_bound transfer are optional reveals. Review card: `reference/binary-search-boundaries.html`.
- Lesson 02: `lessons/0002-asymptotic-analysis.html` (one pair-comparison example: hand count → exact sum → two-sided bounds → Θ(n²); a one-line transfer change)
- Lesson 03: `lessons/0003-doubling-work-sum.html` (one doubling loop, per-round counts, geometric sum, arbitrary-n two-sided proof, optional C++ / Python counting lab, change <= to < transfer). Review card: `reference/doubling-sums.html`.
- Lesson 02 now linked on `index.html`, `reference/course-route.html` and from Lesson 01.
- Lesson 02 reuses `assets/course.css` and `assets/quiz.js`, with shared `assets/short-lesson.css`. The old `asymptotic-lab` assets are no longer used by Lesson 02. Quick review: `reference/asymptotic-bounds.html`.

## Previous discussion context
- The learner explored interval scheduling, proposed earliest-start greedy strategy and then examined the earliest-finish exchange argument.
- In explaining the exchange step, the learner wrote that E ends earlier than F but accidentally used `d>b`; the correct inequality is `d<=b`. A concise proof is `d<=b<=start(A2)`, which ensures the replacement E is compatible with all later selected activities.
- This interval scheduling discussion previews the greedy topic (now topic 10 on the expanded route), not a reason to skip the foundation sequence.

## Current state and next move
- Lesson 01 rewritten on 2026-10-24 with beginner scaffolding. The main code challenge now practices lower_bound and has 8 visible edge tests; do not keep using the old upper_bound challenge description. New demo assets are `assets/binary-search-demo.{css,js}`. Preserve the large C++ / Python editor and freely accessible lessons.
- Lesson 02 rewritten on 2026-10-24 around a single worked example. Keep main lessons short: concrete problem, intuition, learner attempt, rigorous derivation, then a small transfer. Optional definitions and extensions are collapsed or on reference cards.
- Do **not** mark any lesson completed merely because it is published; completion is based on the learner's actual work and local UI status.
- Current Lesson 02 transfer: change the inner loop start from `j=i+1` to `j=i`; derive W(n)=n(n+1)/2 and, for n>=1, (1/2)n²<=W(n)<=n². Ask for the learner's own three-line derivation before inferring mastery.
- Geometric sums / doubling loops now form Lesson 03, rather than being compressed into Lesson 02. Do not assume mastery without the learner's own answers.
- Current Lesson 03 transfer: change i<=n to i<n; n=8 gives 7 calls, n=10 gives 15. Still Θ(n), with n/2<=W(n)<2n for n>=2.
- Next topic depends on actual answers: reinforce per-round counts or continue to Merge Sort recursion trees. The topic map now has 24 entries; this does not assert 24 fixed sessions.

## Sources
- https://amir.goharshady.com/teaching/honors-algorithms
- https://www.cs.umd.edu/class/spring2025/cmsc451-0101/lectures.html

## Navigation and access update (2026-10-23)
- All published lessons are independently accessible from `index.html`: there is NO prerequisite unlocking requirement.
- Completion checkboxes are optional, device-local progress markers only. The site must not block navigation based on quiz results or completion status.
- Lesson 01 has a prominent "进入第二课" action; Lesson 02 now has "进入第三课"; Lesson 03 links back to Lesson 02 and the catalog. All remain freely accessible.
- Shared responsive styles live in `assets/course.css`; progress messaging lives in `assets/quiz.js`. Both use cache-busting version `20261023e` on the published pages.
- Future lessons should maintain clear previous/next/catalog navigation while leaving all published lessons freely accessible.
- New labs can reuse `assets/compiler-lab.js` with per-lesson JSON programs. Lesson 03 uses `assets/doubling-programs.json` and `assets/work-sum-lab.{css,js}`. Index progress reads the total from data-total; Lesson 01's existing editor remains separate.

