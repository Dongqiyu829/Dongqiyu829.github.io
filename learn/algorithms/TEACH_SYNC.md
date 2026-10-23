# COMP3711H Teaching Sync

Updated: 2026-10-23 (Asia/Singapore)

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
- Lesson 02: `lessons/0002-asymptotic-analysis.html` (cost model, O/Ω/Θ, tight bounds, geometric vs triangular loops, interactive counts)
- Lesson 02 now linked on `index.html`, `reference/course-route.html` and from Lesson 01.
- Site uses `assets/course.css`, `assets/quiz.js`, and page-specific `assets/asymptotic-lab.{css,js}` for the new interactive comparison.

## Previous discussion context
- The learner explored interval scheduling, proposed earliest-start greedy strategy and then examined the earliest-finish exchange argument.
- In explaining the exchange step, the learner wrote that E ends earlier than F but accidentally used `d>b`; the correct inequality is `d<=b`. A concise proof is `d<=b<=start(A2)`, which ensures the replacement E is compatible with all later selected activities.
- This interval scheduling discussion is a preview of planned Lesson 09, not a reason to skip the foundation sequence.

## Current state and next move
- Lesson 02 content was added and its repository links validated on 2026-10-23.
- Do **not** mark either lesson completed merely because it is published; completion is based on the learner's actual work and local UI status.
- Invite the learner to solve Lesson 02 transfer problem: `for(i=1; i<=n; i*=2) for(j=1; j<=n/i; ++j) work()`. Desired proof: `n <= W(n) < 2n` hence tight `Θ(n)`.
- Next planned lesson: recurrence and Merge Sort recursion trees, conditional on demonstrated mastery of the transfer task.

## Sources
- https://amir.goharshady.com/teaching/honors-algorithms
- https://www.cs.umd.edu/class/spring2025/cmsc451-0101/lectures.html
