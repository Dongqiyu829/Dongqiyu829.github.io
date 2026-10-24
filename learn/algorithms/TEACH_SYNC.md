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
- Lesson 01: `lessons/0001-binary-search-loop-invariant.html` (lower_bound, loop invariant, upper_bound transfer)
- Lesson 02: `lessons/0002-asymptotic-analysis.html` (one pair-comparison example: hand count → exact sum → two-sided bounds → Θ(n²); a one-line transfer change)
- Lesson 02 now linked on `index.html`, `reference/course-route.html` and from Lesson 01.
- Lesson 02 reuses `assets/course.css` and `assets/quiz.js`, with shared `assets/short-lesson.css`. The old `asymptotic-lab` assets are no longer used by Lesson 02. Quick review: `reference/asymptotic-bounds.html`.

## Previous discussion context
- The learner explored interval scheduling, proposed earliest-start greedy strategy and then examined the earliest-finish exchange argument.
- In explaining the exchange step, the learner wrote that E ends earlier than F but accidentally used `d>b`; the correct inequality is `d<=b`. A concise proof is `d<=b<=start(A2)`, which ensures the replacement E is compatible with all later selected activities.
- This interval scheduling discussion is a preview of planned Lesson 09, not a reason to skip the foundation sequence.

## Current state and next move
- Lesson 02 rewritten on 2026-10-24 around a single worked example. Keep main lessons short: concrete problem, intuition, learner attempt, rigorous derivation, then a small transfer. Optional definitions and extensions are collapsed or on reference cards.
- Do **not** mark either lesson completed merely because it is published; completion is based on the learner's actual work and local UI status.
- Current Lesson 02 transfer: change the inner loop start from `j=i+1` to `j=i`; derive W(n)=n(n+1)/2 and, for n>=1, (1/2)n²<=W(n)<=n². Ask for the learner's own three-line derivation before inferring mastery.
- Geometric sums / doubling loops are deferred to a later short session if needed. Do not assume they were learned from the previous, broader lesson.
- Next topic depends on actual answers: reinforce two-sided bounds, teach doubling-loop counts separately, or continue to Merge Sort recursion trees.

## Sources
- https://amir.goharshady.com/teaching/honors-algorithms
- https://www.cs.umd.edu/class/spring2025/cmsc451-0101/lectures.html

## Navigation and access update (2026-10-23)
- All published lessons are independently accessible from `index.html`: there is NO prerequisite unlocking requirement.
- Completion checkboxes are optional, device-local progress markers only. The site must not block navigation based on quiz results or completion status.
- Lesson 01 has a prominent "进入第二课" action plus a footer next-lesson button; Lesson 02 links back to Lesson 01 and the course catalog (Lesson 03 is not yet published).
- Shared responsive styles live in `assets/course.css`; progress messaging lives in `assets/quiz.js`. Both use cache-busting version `20261023e` on the published pages.
- Future lessons should maintain clear previous/next/catalog navigation while leaving all published lessons freely accessible.

