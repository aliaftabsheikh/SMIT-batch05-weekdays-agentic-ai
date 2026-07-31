---
id: 0013
title: Tasks Three Level Progression
stage: tasks
date: 2026-07-31
surface: agent
model: claude-opus-5
feature: 004-three-level-progression
branch: 004-three-level-progression
user: aliaftabsheikh
command: /sp.tasks
labels: ["tasks", "rural-racer", "levels", "multi-track", "foundational-phase", "negative-control"]
links:
  spec: specs/004-three-level-progression/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/004-three-level-progression/tasks.md (created — 43 tasks across 6 phases)
tests:
 - none run at this stage — task generation only
 - T001/T002 will re-establish the harness baseline at /sp.implement
---

## Prompt

```text
/sp.tasks
```

(no additional user input)

## Response snapshot

`tasks.md` written: **43 tasks across 6 phases**, every one in the required checklist format with an
explicit file path.

| Phase | Tasks | |
|---|---|---|
| 1 Setup | T001–T003 | baseline before anything is touched |
| 2 Foundational | T004–T012 | **the track-singleton conversion — blocks all three stories** |
| 3 US1 (P1) | T013–T019 | three laps clears a level 🎯 MVP |
| 4 US2 (P2) | T020–T026 | winning the run |
| 5 US3 (P3) | T027–T032 | level/lap/best readouts |
| 6 Polish | T033–T043 | constitution, docs, five audits, handoff |

**Phase 2 is a real foundational phase, not boilerplate.** Feature 002's task list said "none —
stating this explicitly rather than inventing filler". Here the opposite is true: `TRACK`,
`HALF_W` and `CP_INDICES` are `const`s read by eleven call sites, and no user story can be written
against a fixed track. The nine tasks are strictly ordered, and **T012 is the gate that proves the
conversion changed nothing observable** — the game must be indistinguishable from today, on level 1,
before any level logic goes on top. That checkpoint is called out as worth stopping at.

**Two tasks carry the real risk, and each has a matching check.** T007 is eleven mechanical renames
where a missed site is a silent cross-track bug rather than a crash — caught by T012's regression.
T009 is `enterLevel()`'s internal ordering, where a stale `start`/`CP_GATES` means lap validation
silently tests the previous level's gates against the new level's track — caught by T013.

**T013 is deliberately the first US1 task, and it is the negative control.** Per plan.md's flywheel
note: the stale-cache bug is invisible to a positive test. T013 also requires proving the test
*fails* when the caches are not rebuilt, so it is shown capable of catching the bug before it is
trusted. The same discipline is repeated at T025, where the C-6 precedence assertion is split into a
positive control (L-I) that must be written and shown to pass **first**, and the real assertion
(L-J) — exactly the shape of the vacuous FR-015 check that feature 003 discovered.

**One task placement worth flagging.** T008 repoints `game.best` → `game.bests[game.level]` in the
*foundational* phase rather than in US3, where FR-033/FR-034 live. That is not scope drift: removing
`game.best` in T006 breaks three readers, and the file must run at the Phase 2 checkpoint. The task
says so explicitly — US3 adds the presentation and the per-level verification, T008 only keeps the
game working.

**`[P]` is used sparingly and the reason is stated.** Almost every task edits `game.js`, which the
constitution requires to remain one file in six sections. Marking same-file tasks parallel would be
false, so `[P]` appears only on `index.html`, `styles.css`, scratchpad harnesses and spec artifacts —
with a note at the top explaining why.

Polish carries five distinct audits rather than one vague "cleanup": single-definition (IV),
update/render separation (II), determinism (III), accessibility (VI), section order and
zero-dependency (I). **T036 records the count of Principle II exceptions in `game.js` as 0, down
from 1** — this feature closes the standing `completeLap()` → `showToast()` violation rather than
tripling it.

T043 hands off `quickstart.md` L1–L17 with six steps marked human-only, and says plainly that
**FR-020's difficulty ordering cannot be closed by measurement** — the two monotonic numbers support
the claim but do not settle it.

## Outcome

- ✅ Impact: `004-three-level-progression` is executable. 43 tasks, dependency-ordered, each with a file path and a verification story.
- 🧪 Tests: none at this stage. The harness plan is embedded in the tasks (T013/T014 for US1, T024/T025 for US2, T031 for US3, T037/T041 for polish).
- 📁 Files: 1 created. No source file touched.
- 🔁 Next prompts: `/sp.implement`; optionally `/sp.adr multi-track-level-progression` first, since the ADR documents the decision T004–T009 implement.
- 🧠 Reflection: The most useful structural choice was making Phase 2 end in a checkpoint that asserts *no observable change*. A conversion task list that only proves itself once the new feature works cannot tell a broken conversion from a broken feature; splitting them means T012 failing and T019 failing point at different code.

## Evaluation notes (flywheel)

- Failure modes observed: none at this stage. The two anticipated ones are both mechanical-looking and both silent — a missed call-site rename and a stale derived cache — which is why they got dedicated gates rather than being folded into general regression.
- Graders run and results (PASS/FAIL): PASS — 43/43 tasks in the required checklist format (checkbox, ID, `[P]` where genuine, `[Story]` on story phases only, file path present); all 3 user stories covered with independent test criteria; all 10 contract clauses (C-1…C-10) mapped to at least one task; the single Complexity Tracking item (constitution PATCH) has a task (T033).
- Prompt variant (if applicable): none — `/sp.tasks` with empty arguments.
- Next experiment (smallest change to try): at `/sp.implement`, run T012 and then deliberately revert one call site from T007 to confirm the regression actually fails. A gate that has never been seen to fail is an assumption, not a gate — the same reasoning that put the "prove it fails" clause into T013.
