---
id: 0004
title: Plan Defect Remediation Design
stage: plan
date: 2026-07-27
surface: agent
model: claude-opus-5
feature: 002-fix-known-defects
branch: 002-fix-known-defects
user: aliaftabsheikh
command: /sp.plan
labels: ["plan", "rural-racer", "geometry", "checkpoint-gates", "reset-scopes", "adr-candidate"]
links:
  spec: specs/002-fix-known-defects/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/002-fix-known-defects/plan.md (created)
 - specs/002-fix-known-defects/research.md (created)
 - specs/002-fix-known-defects/data-model.md (created)
 - specs/002-fix-known-defects/contracts/lap-validation.md (created)
 - specs/002-fix-known-defects/contracts/game-state.md (created)
 - specs/002-fix-known-defects/quickstart.md (created)
tests:
 - none run (no test runner; quickstart.md defines Q1–Q11 plus the 7-point constitutional gate as the manual suite)
---

## Prompt

sp.plan

(no additional user input)

## Response snapshot

Produced the full Phase 0 + Phase 1 artefact set for `002-fix-known-defects`. Constitution
Check passes on all six principles both pre-research and post-design; Complexity Tracking is
empty.

**The finding that changed the plan.** The code review recommended fixing checkpoint
validation by testing against the gate segment `drawCheckpoints` already renders. Phase 0
derivation showed that recommendation would have made the defect *worse*. At a vertex with
interior angle θ the on-track corridor reaches `HALF_W / sin(θ/2)` on the inside of the turn
and exactly `HALF_W` on the outside. Evaluated for the four checkpoints:

| Vertex | θ | Inner reach | Drawn reach | Tested radius |
|---|---:|---:|---:|---:|
| 3 | 105.6° | 51.5 | 41 | 55 |
| 6 | 132.8° | 44.7 | 41 | 55 |
| 9 | 154.4° | 42.0 | 41 | 55 |
| 12 (hairpin) | 87.0° | 59.6 | 41 | 55 |

The tested circle (55) misses only vertex 12 — the reported bug. The drawn segment (41) misses
**all four**, so adopting it as the test would newly reject legal inside lines at vertices 3,
6 and 9. Neither existing shape is the corridor.

Decision: derive an asymmetric gate along the angle bisector — inner endpoint at
`HALF_W / sin(θ/2)`, outer endpoint at `HALF_W` — which lands exactly on both corridor
boundaries, and expose it through one pure `gateAt(i)` helper consumed by both `updateLap()`
and `drawCheckpoints()`. Cached at init. `CP_RADIUS` is deleted. A degenerate-vertex fallback
(`|û + ŵ| < ε` → tangent perpendicular) prevents `NaN` if a checkpoint is ever moved onto a
straight; all four current vertices evaluate to 1.209 / 0.800 / 0.443 / 1.450, comfortably
clear.

Seven further decisions recorded with alternatives in `research.md`: reset split into
`placeCarAtGrid` / `resetRace` / `resetSession` (the defect was scope, not logic — one
function served three callers with three different lifetimes); world-edge **heading
reflection** with `WALL_RESTITUTION = 0.35` rather than damping (damping to 0.4 still leaves
~10°/s of turn authority and ~9 s to escape — fails SC-005; reflection points the car away so
the next throttle input clears it); `event.repeat` early-return on a grouped lifecycle-key
branch; a fourth HUD panel for `raceTime`; shadow offset moved before the rotate; `aria-hidden`
removed with a deliberate split between a *queryable* HUD and a *live* toast; `cursor: none`
toggled from `updateScreens()`.

`data-model.md` organises all state by **lifetime** (Page / Race / Lap / Frame) and states the
rule the feature enforces: an operation may clear its own lifetime and narrower, never wider.
That single sentence explains both US2 defects at once.

Contracts are prose rather than OpenAPI, with the reason stated inline: the project has no
server, endpoints or network by constitutional constraint, so the contracts worth pinning down
are the internal ones between update, render and track definition — which is exactly where the
divergence causing the headline defect lives. 25 numbered guarantees (G1–G25) across
`lap-validation.md` and `game-state.md`, each mapped to an FR and a quickstart step.

`quickstart.md` includes a reproduce-first table (confirm each defect is real before fixing it)
and Q1–Q11 verification steps mapped to SC-001…SC-011, plus the constitution's seven-point
gate and a regression list.

**Deviations, both consistent with the previous step**: `setup-plan.sh` was not run — like
`create-new-feature.sh`, it resolves `REPO_ROOT` via `git rev-parse --show-toplevel`, which
returns the outer teaching repository, so it would have written `plan.md` into the wrong
project and read the wrong template. `update-agent-context.sh claude` was also not run: it
targets `$REPO_ROOT/CLAUDE.md`, i.e. the outer repository's root guidance file, and would have
errored at its own plan-existence check anyway. Substantively it is a no-op regardless — this
feature introduces **zero** new technology, which is Principle I working as designed, so there
is nothing to add to any agent context file.

ADR suggested (not created): `/sp.adr checkpoint-gate-crossing-validation`.

## Outcome

- ✅ Impact: Feature 002 fully designed; all six constitution gates pass with no violations; the headline fix is derived rather than tuned, and the derivation corrected the code review's own recommendation.
- 🧪 Tests: None run — no test runner. `quickstart.md` defines Q1–Q11 plus the seven-point constitutional gate and a regression list as the manual suite.
- 📁 Files: 6 created — `plan.md`, `research.md`, `data-model.md`, `contracts/lap-validation.md`, `contracts/game-state.md`, `quickstart.md`.
- 🔁 Next prompts: `/sp.adr checkpoint-gate-crossing-validation` (awaiting consent); then `/sp.tasks`. US1 should be implemented and verified alone before the other five stories go in parallel.
- 🧠 Reflection: Checking the recommended fix arithmetically before adopting it was the whole value of this phase — the review's suggestion was directionally right and quantitatively wrong, and taking it on trust would have shipped three new bugs while closing one.

## Evaluation notes (flywheel)

- Failure modes observed: third SpecKit script unusable on this nested layout — `setup-plan.sh` and `update-agent-context.sh` both resolve `REPO_ROOT` to the git toplevel rather than the enclosing `.specify/`, after `create-new-feature.sh` and `create-phr.sh`. Separately: an upstream review finding, accepted uncritically, would have caused a regression; agent-authored fix suggestions need the same arithmetic scrutiny as the bugs they describe.
- Graders run and results (PASS/FAIL): PASS — Constitution Check 6/6 pre-research and post-design; no unresolved `NEEDS CLARIFICATION`; every FR mapped to at least one contract guarantee and one quickstart step; route matches stage.
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): Patch `common.sh::get_repo_root` to walk up from the script location to the nearest enclosing `.specify/` and prefer that over the git toplevel — one function, and it repairs all four broken scripts at once.
