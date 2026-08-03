---
id: 0006
title: Implement Defect Fixes
stage: green
date: 2026-07-27
surface: agent
model: claude-opus-5
feature: 002-fix-known-defects
branch: 002-fix-known-defects
user: aliaftabsheikh
command: /sp.implement
labels: ["implement", "rural-racer", "geometry", "accessibility", "adr", "harness"]
links:
  spec: specs/002-fix-known-defects/spec.md
  ticket: null
  adr: history/adr/ADR-0001-checkpoint-gate-crossing-validation.md
  pr: null
files:
 - game.js (modified — gateAt, buildGates, CP_GATES, updateLap, drawCheckpoints, reset split, wall reflection, keydown, updateHud, drawCar, updateScreens; CP_RADIUS deleted)
 - index.html (modified — TOTAL panel added; aria-hidden removed from HUD/toast/hint; role=group, role=status)
 - styles.css (modified — #game.is-playing cursor rule; .hud__row flex-wrap)
 - PROJECT-EXPLANATION.md (modified — §2, §5, §6, §8, §9, §10, §11)
 - history/adr/ADR-0001-checkpoint-gate-crossing-validation.md (created)
 - specs/002-fix-known-defects/tasks.md (33 of 34 marked complete; constitution re-check, deviations and results recorded)
 - <scratchpad>/gate-check.mjs (created, outside repo)
 - <scratchpad>/verify-shipped.mjs (created, outside repo)
tests:
 - gate-check.mjs — 21 assertions, ALL PASSED (defect reproduction, containment, degenerate fallback, wall escape)
 - verify-shipped.mjs — 15 assertions against the real game.js, ALL PASSED (containment proof on shipped code)
 - node --check game.js — syntax clean after every phase
 - quickstart.md Q1-Q11 — OUTSTANDING, requires a human at the keyboard
---

## Prompt

sp.implement

(no additional user input)

## Response snapshot

Checklist gate passed (requirements.md 16/16, 0 incomplete), so implementation proceeded
automatically. 33 of 34 tasks complete; T034 is the human handoff and is deliberately left open.

**Phase 1 — the harness earned its place immediately.** Before touching the source,
`gate-check.mjs` sampled the angle bisector at each checkpoint and measured the on-track corridor:

| vertex | θ | on-track inner reach | old 55 px circle | drawn ±41 px segment |
|---|---:|---:|---|---|
| 3 | 105.60° | 51.47 | covers | **NO** |
| 6 | 132.85° | 44.73 | covers | **NO** |
| 9 | 154.44° | 42.04 | covers | **NO** |
| 12 | 87.04° | **59.54** | **NO** | **NO** |

This confirmed the planning-phase finding empirically: the circle misses only vertex 12 (the
reported bug), but the segment the code review told us to test against under-spans **all four**.
Adopting the review's recommendation would have closed one bug and opened three.

**Phase 3 (US1)** — `gateAt(i)` derives the gate from the corridor along the angle bisector:
inner endpoint at `HALF_W/sin(θ/2)`, outer at `HALF_W`, with a tangent-perpendicular fallback at
`|û + ŵ| < 1e-6`. `buildGates()` caches four gates at init; `updateLap()` and `drawCheckpoints()`
both read `CP_GATES`; `CP_RADIUS` deleted.

**T009 was deliberately strengthened beyond the task text.** Rather than only porting `gateAt`
into the harness — which proves a copy, not the shipment — a second harness, `verify-shipped.mjs`,
loads the real `game.js` via `new Function` with stubbed `window`/`document` (readyState left as
`'loading'` so `init()` never fires) and runs the containment proof against the shipped function.
Result: gate spans equal on-track spans to within 0.05 px at all four corners, and **2001 swept
on-track racing lines per corner, 0 missed**.

**Phase 4 (US2)** — `reset()` split into `placeCarAtGrid()` → `resetRace()` → `resetSession()`,
each clearing its own lifetime and nothing wider. Callers rewired; the non-finite guard now
repairs the car and voids only the lap in progress. **T014 confirmed no edit was needed** —
`completeLap()` already used a strict `<`, so a tied lap never set a record. Recorded rather than
"fixed".

**Phase 5 (US3)** — `TOTAL` panel plus one `setText` call. No new state: `raceTime` already
accumulated from the fixed `dt` inside `update()`, so continuity across laps and freezing on pause
came for free.

**Phase 6 (US4)** — wall response changed from `speed = 0` to clamp + heading reflection + `speed
*= WALL_RESTITUTION` (0.35). Measured across 4 walls × 3 incidences × 2 steer directions:
**0.52–0.67 s to escape, against 11.1–20.6 s before.** SC-005 allows 2 s. Lifecycle keys grouped
into one branch returning early on `event.repeat`; `R` made inert on the title screen.

**Phases 7–8 (US5, US6)** — `aria-hidden` removed from all three live regions; HUD became a named
`role="group"` (queryable, deliberately not live — it changes every frame) and the toast
`role="status"` (a discrete event, exactly what a live region is for). Shadow offset moved before
the rotation. `#game.is-playing { cursor: none; }` toggled from `updateScreens()`.

**Phase 9** — static audit clean: no `import`/`require`/`localStorage`/`sessionStorage`/`fetch`/
`XMLHttpRequest`/`document.cookie`; still three source files; `game.js` section order intact. All
six constitution principles re-checked and recorded in `tasks.md`. `PROJECT-EXPLANATION.md` §10
rewritten from "Known issues" to "Defect history". ADR-0001 written.

**One deviation.** T017 said to add a CSS rule "only if" the four HUD panels wrap. They do not at
the native 900 px stage (~494 px of 876 px), but the HUD uses fixed px type while the stage scales
with the viewport, so below roughly a 500 px stage four panels overflow where three did not —
newly reachable, so `.hud__row` gained `flex-wrap: wrap`.

**T034 remains open and must not be closed by me.** Q1 (20 varied legal laps), Q7 (boundary
recovery feel) and Q9 (screen reader) require a human at the keyboard. The harness proves the
geometry and the escape time; it cannot prove how the bounce *feels* or that a screen reader
announces what it should.

## Outcome

- ✅ Impact: All eight defects fixed across three files. The headline fix is proven numerically against the shipped source, not merely reasoned about.
- 🧪 Tests: 36 harness assertions passed (21 in `gate-check.mjs`, 15 in `verify-shipped.mjs`); `node --check` clean. Manual suite Q1–Q11 outstanding by design.
- 📁 Files: 4 modified in-repo, 1 ADR created, `tasks.md` updated, 2 throwaway harnesses in the scratchpad.
- 🔁 Next prompts: run `quickstart.md` Q1–Q11 in a browser; then `/sp.git.commit_pr` to land the branch.
- 🧠 Reflection: The reproduce-first harness was the highest-value 20 minutes of the feature. It converted "the review says the radius is too small" into a measured table that showed the review's own suggested fix was wrong — a claim I would not have been willing to make from reasoning alone.

## Evaluation notes (flywheel)

- Failure modes observed: none in implementation. The recurring toolchain issue persists — `check-prerequisites.sh` shares the `get_repo_root` git-toplevel bug with four sibling scripts, so all six SpecKit phases in this feature were run agent-natively.
- Graders run and results (PASS/FAIL): PASS — `gate-check.mjs` 21/21; `verify-shipped.mjs` 15/15; `node --check` clean; static audit clean; constitution 6/6 principles re-verified post-implementation.
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): make `verify-shipped.mjs`'s load-the-real-source trick the default pattern for any future geometry change here — proving the shipped function rather than a transcription of it cost about ten extra lines and removes an entire class of false pass.
