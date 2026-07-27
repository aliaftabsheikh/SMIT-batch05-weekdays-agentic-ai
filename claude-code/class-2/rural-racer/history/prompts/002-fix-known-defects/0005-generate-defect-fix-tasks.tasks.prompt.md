---
id: 0005
title: Generate Defect Fix Tasks
stage: tasks
date: 2026-07-27
surface: agent
model: claude-opus-5
feature: 002-fix-known-defects
branch: 002-fix-known-defects
user: aliaftabsheikh
command: /sp.tasks
labels: ["tasks", "rural-racer", "defect-remediation", "mvp-scoping", "baseline-audit"]
links:
  spec: specs/002-fix-known-defects/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/002-fix-known-defects/tasks.md (created)
tests:
 - none (no automated tests by constitutional stance; a throwaway scratchpad harness is planned as T001-T003, T009, T020)
---

## Prompt

Before start making a tasks analyze what work should be done and then a task and execute only
those that are not implemented yet but don't execution from the start of the project

sp.tasks

(followed by the analysis plan produced in response to the above, passed back as command
arguments — the baseline audit, nine phases, file map, verification approach and risks)

## Response snapshot

**Baseline audit first, as asked.** Verified against the actual source rather than assumed:
`CP_RADIUS` still at `game.js:66` and used at `:289`; single `reset()` at `:112`; `raceTime`
accumulated at `:210` with no HUD element and no `id="race"` in `index.html`; no repeat guard in
the keydown handler at `:162-165`; `aria-hidden="true"` at `index.html:15`, `:39`, `:42`; no
cursor rule in `styles.css`; shadow offset after `ctx.rotate()` at `:436`. `git status` shows the
directory wholly untracked with no source edits. **All eight defects are live; nothing is
implemented.**

Confirmed already complete and excluded from the task list: `constitution.md` v1.0.0, `spec.md`,
`plan.md`, `research.md`, `data-model.md`, both contracts, `quickstart.md`,
`checklists/requirements.md`, PHRs 0001–0004. `tasks.md` was the only missing artifact.

**Generated 34 tasks across nine phases**, all in the required
`- [ ] T### [P?] [Story?] description with file path` format:

| Phase | Tasks | Count |
|---|---|---|
| 1 Setup | T001–T003 | 3 |
| 2 Foundational | — | 0 |
| 3 US1 (P1) legal laps count | T004–T009 | 6 |
| 4 US2 (P2) progress survives restart | T010–T014 | 5 |
| 5 US3 (P3) total race time | T015–T017 | 3 |
| 6 US4 (P4) never stuck | T018–T021 | 4 |
| 7 US5 (P5) assistive technology | T022–T025 | 4 |
| 8 US6 (P6) visual consistency | T026–T028 | 3 |
| 9 Polish | T029–T034 | 6 |

**Phase 2 is deliberately empty and says so.** The project is initialized, has no dependencies,
schema, routing or shared scaffolding, and every story touches a disjoint region. Recording that
honestly beat inventing filler tasks to fill a template slot.

**Setup is reproduce-first.** T001–T003 build a throwaway Node harness in the scratchpad —
outside the repository, since a permanent test file would contradict the constitution's
no-test-runner stance — that ports the geometry verbatim from `game.js` and demonstrates the
defect numerically before any source edit. T009 then flips it into a proof: every sampled
on-track point on each corner's bisector must lie on the gate segment. T020 does the same for
wall escape (< 2 s under reflection versus ~15 s today).

**Only one cross-story dependency exists** — US4 T019 (world-edge backstop) after US2 T013
(recovery guard rewire), because both edit the same region of `update()`. Everything else is
independent. Parallelism is genuinely limited and the file says so: three source files means
most tasks contend on `game.js`, so only two `[P]` pairs are real (US3 `index.html` ∥ `game.js`;
US6 `game.js` ∥ `styles.css`).

**MVP is US1 alone.** It is the only story that changes gameplay-visible geometry and the only
one whose fix was derived rather than read off the defect report — the code review's own
recommendation for it was quantitatively wrong. Isolating it means the containment proof and the
browser lap test exercise exactly one change.

T014 is a **verification-only** task with "expected outcome is no edit": `completeLap()` already
uses a strict `<` comparison, so FR-010 is satisfied by existing code. Recording the
confirmation is more honest than editing working code to look busy.

T034 exists specifically to prevent a false pass: Q1 (20 varied legal laps), Q7 (boundary
recovery feel) and Q9 (screen reader) require a human at the keyboard and must be reported as
outstanding.

**Scope note**: this turn generated `tasks.md` and stopped, per the `/sp.tasks` contract. No
source file was touched. Two decisions were confirmed with the user beforehand — create the ADR
as part of the work (T032), and verify via a scratchpad harness rather than a repo test file or
code-only reasoning.

## Outcome

- ✅ Impact: 34 immediately executable tasks generated; baseline audited against real source so no completed work will be redone.
- 🧪 Tests: None — no test runner by constitutional stance. A throwaway scratchpad harness is planned (T001–T003, T009, T020) and the manual suite is `quickstart.md` Q1–Q11.
- 📁 Files: `specs/002-fix-known-defects/tasks.md` created. No source file modified.
- 🔁 Next prompts: `/sp.implement` to execute T001–T034, MVP-first (Setup → US1 → stop and validate).
- 🧠 Reflection: The audit was worth doing before writing tasks — it turned "eight defects" from a claim inherited from a review into a set of verified line numbers, and it produced the one genuinely surprising result (T014 needs no code change at all).

## Evaluation notes (flywheel)

- Failure modes observed: `check-prerequisites.sh` shares the `get_repo_root` git-toplevel bug already hit by `create-new-feature.sh`, `create-phr.sh`, `setup-plan.sh` and `update-agent-context.sh` — five scripts, one root cause. Also: the template's Foundational phase invites invented work when a project has no shared prerequisites; resisting that required an explicit "None" with justification.
- Graders run and results (PASS/FAIL): PASS — all 34 tasks carry a checkbox, sequential ID, file path, and a story label in exactly the story phases (none in Setup, Foundational or Polish); every user story has an independent test criterion tied to a numbered quickstart step; every FR from the spec maps to at least one task.
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): Patch `common.sh::get_repo_root` to prefer the nearest enclosing `.specify/` over the git toplevel — one function, and all five broken scripts start working on nested SpecKit projects.
