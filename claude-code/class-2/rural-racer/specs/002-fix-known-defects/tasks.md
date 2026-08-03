---
description: "Task list for feature 002-fix-known-defects"
---

# Tasks: Fix Known Defects

**Input**: Design documents from `specs/002-fix-known-defects/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: No automated test tasks. The constitution takes an explicit no-test-runner stance and
Principle I forbids build tooling, so acceptance is the manual procedure in `quickstart.md`. The
one exception is a **throwaway** numeric harness written to the scratchpad, outside the
repository — it proves the geometry before a browser is ever opened and is deleted with the
session.

**Organization**: Tasks are grouped by user story so each can be implemented and verified
independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1…US6)
- Include exact file paths in descriptions

## Path Conventions

- **Source paths** below are relative to `claude-code/class-2/rural-racer/`.
- **Harness path** `<scratchpad>` means the session scratchpad directory, deliberately outside
  the repository.
- This is a single static project: three source files, no `src/`, no `tests/`, no build.

## Baseline (verified 2026-07-27)

All eight defects are live; nothing is implemented. `CP_RADIUS` at `game.js:66` used at `:289` ·
single `reset()` at `:112` · `raceTime` at `:210` with no HUD element · no repeat guard at
`:162-165` · `aria-hidden="true"` at `index.html:15`, `:39`, `:42` · no cursor rule in
`styles.css` · shadow offset after `ctx.rotate()` at `game.js:436`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Stand up the numeric harness that reproduces the geometry defect before it is
fixed, so the fix is proven rather than assumed.

- [x] T001 Create `<scratchpad>/gate-check.mjs` porting `TRACK`, `HALF_W`, `CP_INDICES`, `norm`, `clamp`, `distPointSeg`, `distToPath`, `isOnTrack`, `segIntersect` and `tangentAt` verbatim from `game.js` sections 1 and Helpers, so the harness and the game share identical geometry
- [x] T002 Add reproduce-first assertions to `<scratchpad>/gate-check.mjs`: for each vertex in `CP_INDICES`, densely sample the angle bisector and report the on-track span, the current `CP_RADIUS = 55` circle, and the currently drawn ±41 px segment
- [x] T003 Run `node <scratchpad>/gate-check.mjs` and record the baseline: the on-track span must exceed 55 at vertex 12 only, and must exceed 41 at all four vertices

**Checkpoint**: The defect is reproduced numerically, and the claim that the code review's suggested fix would break three further corners is confirmed or refuted before any source edit.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that must be complete before any user story.

**None.** The project is already initialized, has no dependencies to install, no schema, no
routing and no shared scaffolding. Every story below touches a disjoint region of the source.
This phase is recorded as empty rather than filled with work that does not exist.

**Checkpoint**: User story implementation can begin immediately.

---

## Phase 3: User Story 1 - Every legal lap is counted (Priority: P1) 🎯 MVP

**Goal**: A lap driven entirely on the track surface always counts, whatever line the player
takes through each corner.

**Independent Test**: Drive 20 laps that stay entirely on the dirt, varying the line through
every corner from the widest to the tightest that remains on track. All 20 must count
(quickstart Q1). Drive 10 laps that each cut a corner across the grass — none may count (Q2).

### Implementation for User Story 1

- [x] T004 [US1] Add pure `gateAt(i)` to the Helpers section of `game.js`, returning `{ a, b }`: with `û = unit(path[i-1] − path[i])`, `ŵ = unit(path[i+1] − path[i])`, `s = û + ŵ` and `sinHalf = sqrt(max(0, 1 − (|s|/2)²))`, set `a = path[i] + unit(s)·(HALF_W / sinHalf)` and `b = path[i] − unit(s)·HALF_W`; when `|s| < 1e-6` fall back to `perpendicular(tangentAt(i))` at `HALF_W` either side. Reuse the existing `norm()` and `tangentAt()`. No canvas call and no mutation — the function must be safe to call from both `update()` and `render()` (contract C1, Principle II)
- [x] T005 [US1] Add a module-level `CP_GATES` array to the STATE section of `game.js` and populate it in `init()` immediately after the existing `buildStart()` call, mapping each entry of `CP_INDICES` through `gateAt()` so all four gates are computed once and reused every frame
- [x] T006 [US1] In `updateLap()` in `game.js`, replace the `Math.hypot(car.x - cp.x, car.y - cp.y) < CP_RADIUS` test with `segIntersect(game.prev, pos, gate.a, gate.b) && isOnTrack(car.x, car.y)` where `gate = CP_GATES[game.nextCp]`, preserving the existing structure in which only the single next expected gate is ever tested (contract C2, FR-002, FR-004, FR-006)
- [x] T007 [US1] In `drawCheckpoints()` in `game.js`, replace the locally recomputed `tangentAt`/`perp`/`HALF_W` endpoints with a direct read of `CP_GATES[k].a` and `.b`, so the segment drawn is byte-for-byte the segment tested (FR-003, Principle IV)
- [x] T008 [US1] Delete the `CP_RADIUS` constant from the constants block of `game.js` and confirm no reference to it survives anywhere in the source
- [x] T009 [US1] Port the final `gateAt()` into `<scratchpad>/gate-check.mjs` and assert containment for every checkpoint: every sampled bisector point for which `isOnTrack` is true must lie on segment `a…b`. Add a synthetic straight vertex to exercise the `|s| < ε` fallback and assert all four returned coordinates are finite

**Checkpoint**: Checkpoint validation is derived from the corridor, drawn and tested geometry cannot diverge, and the containment proof passes at all four corners. Ready for quickstart Q1, Q2, Q3 and Q10.

---

## Phase 4: User Story 2 - Progress survives a restart (Priority: P2)

**Goal**: Restarting preserves the session best; internal recovery repairs only the car.

**Independent Test**: Set a lap, press `R`, confirm `BEST` is unchanged, complete a slower lap
and confirm it is not announced as a record (quickstart Q4). Force `game.car.x = NaN` from the
console and confirm `LAP`, `BEST` and `TOTAL` all survive (Q5).

### Implementation for User Story 2

- [x] T010 [US2] Add `placeCarAtGrid()` to the STATE section of `game.js`, containing only the car-scoped half of the current `reset()`: spawn position and heading from `start.dir`, `speed = 0`, `game.prev` set to the new position, `game.dust.length = 0`, `game.offTrack = false`. Setting `prev` is mandatory — a stale value would describe a movement segment spanning the track and fire spurious crossings (contract C6 G9)
- [x] T011 [US2] Add `resetRace()` to `game.js` calling `placeCarAtGrid()` then clearing the race-lifetime fields: `lap = 1`, `lapsDone = 0`, `nextCp = 0`, `raceTime = 0`, `lapTime = 0`, `lastLap = null`, `started = false`. It must NOT touch `best` (FR-008, FR-009)
- [x] T012 [US2] Add `resetSession()` to `game.js` calling `resetRace()` then `game.best = null`, and delete the old `reset()` function entirely
- [x] T013 [US2] Rewire the three callers in `game.js`: `init()` calls `resetSession()`; `restart()` calls `resetRace()`; the non-finite guard at the end of `update()` calls `placeCarAtGrid()` and additionally sets `game.lapTime = 0` and `game.nextCp = 0`, leaving `lapsDone`, `raceTime` and `best` standing (FR-011, contract C6 G6–G8)
- [x] T014 [US2] Verify the strict-improvement guard in `completeLap()` in `game.js` already reads `game.best === null || game.lapTime < game.best`; a tied lap must not set a record (FR-010). Expected outcome is no edit — record the confirmation rather than changing working code

**Checkpoint**: Each reset operation clears its own lifetime and narrower, never wider. Ready for quickstart Q4 and Q5.

---

## Phase 5: User Story 3 - Total race time is visible (Priority: P3)

**Goal**: A continuously advancing total elapsed race time is displayed.

**Independent Test**: Race across several laps with a ten-second pause in the middle. `TOTAL` is
visible throughout, does not reset at lap boundaries, does not advance while paused, and
restarts from zero after `R` (quickstart Q6).

### Implementation for User Story 3

- [x] T015 [P] [US3] Add a fourth HUD panel to `index.html` in `.hud__row--top` after the `BEST` panel, matching the existing panel markup exactly: label `TOTAL` and `<span id="race" class="hud__value hud__value--time">0:00.00</span>`
- [x] T016 [P] [US3] Add `setText('race', fmtTime(game.raceTime));` to `updateHud()` in `game.js`, reusing the existing formatter. No new state — `raceTime` already accumulates from the fixed `dt` inside `update()`, so continuity across laps (FR-014) and freezing while paused (FR-015) require no code
- [x] T017 [US3] Confirm `styles.css` needs no change: `hud__value--time` already reserves 7ch and `.hud__row--top` already centres a flex row. Verify four panels do not wrap at the narrowest supported stage width and add a rule only if they do (FR-016)

**Checkpoint**: Total race time is displayed and correct across laps, pauses and restarts. Ready for quickstart Q6.

---

## Phase 6: User Story 4 - Never stuck, always responsive (Priority: P4)

**Goal**: A car against a world boundary drives away within two seconds; a held restart key
produces exactly one countdown.

**Independent Test**: Drive into each of the four boundaries head-on and glancing; forward
controls alone must restore normal driving within 2 seconds (quickstart Q7). Hold `R` for five
seconds — exactly one countdown must run to completion without releasing the key (Q8).

### Implementation for User Story 4

- [x] T018 [US4] Add `WALL_RESTITUTION = 0.35` to the section 1 constants block of `game.js`, alongside the existing `CAR` and `OFFROAD` tuning objects (Principle IV — no magic numbers in update code)
- [x] T019 [US4] Replace the four world-edge lines in `update()` in `game.js` that currently set `car.speed = 0`: keep the position clamp, reflect heading (`Math.PI - car.heading` for the `x` boundaries, `-car.heading` for the `y` boundaries), scale `car.speed *= WALL_RESTITUTION`, and apply `wrapAngle()` afterwards so a corner impact reflecting on both axes stays wrapped (contract C7). Depends on T013 — the recovery guard sits in the same function
- [x] T020 [US4] Add a wall-escape simulation to `<scratchpad>/gate-check.mjs` reproducing the longitudinal, drag and steering equations from `update()`, and assert that from rest nose-into a wall the car reaches normal control in under 2 seconds under reflection, versus roughly 15 seconds under the current `speed = 0` (SC-005)
- [x] T021 [US4] Restructure the keydown handler in `game.js`: collect `Enter`, `KeyP`, `Escape`, `KeyR` into a `LIFECYCLE_KEYS` set handled in one branch that calls `e.preventDefault()` unconditionally, returns early when `e.repeat` is true, then dispatches. Make `KeyR` inert while `game.state === 'title'`. Movement keys keep their repeat events — set insertion is idempotent and `preventDefault()` must keep firing to stop page scroll (contract C5, FR-019, FR-020)

**Checkpoint**: Neither the world edge nor a held key can strand the player. Ready for quickstart Q7 and Q8.

---

## Phase 7: User Story 5 - Game state available to assistive technology (Priority: P5)

**Goal**: A screen reader user can obtain every live readout and is told when a lap completes.

**Independent Test**: With a screen reader running, query the interface mid-race — lap number,
lap time, best and total must all be obtainable, the controls hint readable, and lap completion
announced within 2 seconds (quickstart Q9).

### Implementation for User Story 5

- [x] T022 [US5] Remove `aria-hidden="true"` from the `.hud` wrapper in `index.html` and replace it with `role="group"` plus an accessible name such as `aria-label="Race status"`, so the four label/value pairs are queryable on demand. Do NOT add `aria-live` — the HUD changes every frame (FR-021, contract C9 G20)
- [x] T023 [US5] Remove `aria-hidden="true"` from `#toast` in `index.html` and add `role="status"`, making lap completion a polite live region that announces the lap time and any new record (FR-022)
- [x] T024 [US5] Remove `aria-hidden="true"` from `#hint` in `index.html` so the first-time controls guidance is exposed to assistive technology (FR-023)
- [x] T025 [US5] Confirm `pointer-events: none` remains on `.hud`, `.toast` and `.hint` in `styles.css` — this, not `aria-hidden`, is what lets clicks reach the canvas (FR-024, contract C9 G22)

**Checkpoint**: No live game state is hidden from assistive technology, and clicks still reach the game. Ready for quickstart Q9.

---

## Phase 8: User Story 6 - Consistent visual presentation (Priority: P6)

**Goal**: The shadow holds a fixed light direction; the pointer is hidden during play.

**Independent Test**: Drive a full lap — the shadow must fall in the same direction at every
heading, and an observer must not be able to infer the car's heading from it. The pointer
disappears while racing and returns on the title and pause screens (quickstart Q11).

### Implementation for User Story 6

- [x] T026 [US6] In `drawCar()` in `game.js`, change the shadow block so the `(+3, +5)` offset is applied as `ctx.translate(3, 5)` **before** `ctx.rotate(car.heading)`, then draw the rounded rect centred at the origin — making the offset world-space instead of car-local (FR-026)
- [x] T027 [P] [US6] Add `#game.is-playing { cursor: none; }` to `styles.css` beside the existing `#game` rule
- [x] T028 [US6] Toggle the class from `updateScreens()` in `game.js` with `canvas.classList.toggle('is-playing', game.state === 'racing')`, reusing the existing module-level `canvas` reference — no new listener and no new state (FR-027, contract C10 G25)

**Checkpoint**: All six user stories complete. Ready for quickstart Q11.

---

## Phase 9: Polish & Cross-Cutting Concerns

- [x] T029 Static audit of `game.js`, `index.html` and `styles.css`: `CP_RADIUS` appears nowhere; no new file, dependency, build step, `localStorage`, `sessionStorage` or network call was introduced; `game.js` retains its six-section order (CONSTANTS → STATE → INPUT → UPDATE → RENDER → LOOP → Helpers)
- [x] T030 Re-evaluate all six constitution gates from `.specify/memory/constitution.md` against the final diff and record the result in this file
- [x] T031 Rewrite `PROJECT-EXPLANATION.md`: §6 to describe corridor-spanning gate crossing instead of the radius test, §10 so it no longer lists defects that are fixed, and the `CP_RADIUS` row in §11 to point at `gateAt()`
- [x] T032 Write the ADR to `history/adr/` from `.specify/templates/adr-template.md`, covering the gate geometry derivation, why the code review's own recommendation was rejected, and the six alternatives from `research.md` §R1
- [x] T033 Write the implementation PHR to `history/prompts/002-fix-known-defects/` recording what changed, the harness results, and any deviation from this task list
- [ ] T034 Hand off the manual acceptance suite: `quickstart.md` Q1–Q11 plus the seven-point constitutional gate. Q1 (20 varied legal laps), Q7 (boundary recovery feel) and Q9 (screen reader) require a human at the keyboard and MUST be reported as outstanding, never as passing

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies — start immediately.
- **Foundational (Phase 2)**: empty; blocks nothing.
- **User Stories (Phases 3–8)**: all may begin immediately. Only one cross-story dependency
  exists (below).
- **Polish (Phase 9)**: depends on every story that is being delivered.

### Cross-story dependencies

- **US4 T019 → US2 T013.** The world-edge backstop and the non-finite recovery guard sit in the
  same region of `update()`. Landing T013 first avoids an edit collision.
- No other story pair touches the same function.

### Within each story

- US1: T004 → T005 → T006 / T007 → T008 → T009. The helper must exist before the cache, the
  cache before both consumers, and both consumers before the constant is deleted.
- US2: T010 → T011 → T012 → T013 → T014. Strictly sequential — each function wraps the last.
- US3: T015 and T016 are parallel (different files); T017 verifies after both.
- US4: T018 → T019 → T020; T021 is independent of all three.
- US5: T022, T023, T024 all edit `index.html` sequentially; T025 verifies `styles.css`.
- US6: T026 and T027 are parallel (different files); T028 follows T027.

### Parallel opportunities

- US3 T015 (`index.html`) with T016 (`game.js`).
- US6 T026 (`game.js`) with T027 (`styles.css`).
- Whole stories: US3, US5 and US6 touch disjoint files and functions from each other and from
  US1, so they can be worked simultaneously once US1 is verified.
- Parallelism is limited by design — three source files means most tasks contend on `game.js`.

---

## Parallel Example: User Story 3

```bash
# Different files, no shared state — safe to run together:
Task: "Add the TOTAL HUD panel to index.html"
Task: "Add setText('race', fmtTime(game.raceTime)) to updateHud() in game.js"
```

## Parallel Example: User Story 6

```bash
Task: "Move the shadow offset before ctx.rotate() in drawCar() in game.js"
Task: "Add #game.is-playing { cursor: none; } to styles.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 Setup — build the harness and reproduce the defect numerically.
2. Phase 2 Foundational — nothing to do.
3. Phase 3 User Story 1 — the gate geometry fix.
4. **STOP and VALIDATE**: run the harness (T009), then quickstart Q1, Q2, Q3 and Q10 in the
   browser.
5. This alone is a shippable increment: it makes the game correct. The remaining five stories
   improve a game that already works.

### Incremental Delivery

1. Setup → harness proves the defect.
2. US1 → laps count correctly → **MVP**.
3. US2 → records and progress stop being destroyed.
4. US3 → total race time appears.
5. US4 → no way to get stranded.
6. US5 → playable with a screen reader.
7. US6 → visual consistency.
8. Polish → documentation, ADR, PHR, manual handoff.

Each step is independently verifiable against its quickstart section and adds value without
breaking the previous ones.

### Why US1 goes first and alone

It is the only story that changes gameplay-visible geometry, and the only one whose fix was
derived rather than read off the defect report — the code review's own recommendation for it was
quantitatively wrong. Isolating it means the containment proof and the browser laps test exactly
one change.

---

## Notes

### T030 — Constitution re-check against the final diff (2026-07-27)

| Principle | Verdict | Evidence |
|---|---|---|
| I. Zero Dependencies, Zero Build | ✅ PASS | Still three source files; no package manager, bundler, import or require. `grep` for `import`/`require(` returns nothing |
| II. Simulate and Draw Are Separate | ✅ PASS | `gateAt()` is pure — no `ctx.*`, no mutation — and is called from both paths. The one DOM write added to `updateScreens()` is in the existing render-side DOM writer |
| III. Fixed-Timestep Determinism | ✅ PASS | No new time source. `TOTAL` reads the existing `dt`-accumulated `raceTime`; wall reflection is a pure function of position and heading; `event.repeat` is consumed on the input edge, outside `update()` |
| IV. One Definition Per Fact | ✅ PASS | `CP_GATES` is now the single definition of a checkpoint, read by `updateLap()` and `drawCheckpoints()`. `CP_RADIUS` deleted. `WALL_RESTITUTION` added to the constants block |
| V. Canvas Owns World, DOM Owns Interface | ✅ PASS | `TOTAL` is a DOM panel; gates render on the canvas in world coordinates; no new DPI handling |
| VI. Playable by Default | ✅ PASS | `aria-hidden` removed from all live state; toast is a live region; reduced-motion handling untouched; `event.code` retained; focus-loss handling untouched |

**Additional constraints**: no storage, no network (`grep` for `localStorage`/`sessionStorage`/`fetch`/`XMLHttpRequest`/`document.cookie` returns nothing). `game.js` section order intact (CONSTANTS 14 → STATE 96 → INPUT 178 → UPDATE 244 → RENDER 388 → LOOP 610). **No violations; Complexity Tracking remains empty.**

### Deviation record

- **T017 added one CSS rule** where the task said "add a rule only if [the panels wrap]". `.hud__row` gained `flex-wrap: wrap`. The HUD uses fixed px type while the stage scales with the viewport, so four panels (~494 px) overflow a stage narrower than ~500 px, where three did not. Newly reachable, so guarded.
- **T009 was strengthened.** Rather than only porting `gateAt()` into the harness, a second harness (`verify-shipped.mjs`) loads the real `game.js` with stubbed browser globals and runs the containment proof against the **shipped** function, so the proof cannot pass on a copy that has drifted from the source.

### Verification results

- Containment: gate spans equal on-track spans to within 0.05 px at all four checkpoints.
- Swept racing lines: 2001 on-track offsets per corner, **0 missed** the new gate (46 missed the old 55 px circle at vertex 12).
- Degenerate straight vertex: finite coordinates, gate exactly one track width long.
- Wall escape: **0.52–0.67 s** across 4 walls × 3 incidences × 2 steer directions, against 11.1–20.6 s before. SC-005 requires under 2 s.

---

## Notes

- `[P]` marks tasks in different files with no dependency on incomplete work.
- Reuse, do not reimplement: `segIntersect()`, `isOnTrack()`, `distPointSeg()`, `norm()`,
  `tangentAt()`, `wrapAngle()`, `clamp()`, `fmtTime()`, `setText()`, `toggleHidden()`,
  `roundRect()` — all already in `game.js`.
- The harness is deliberately outside the repository. Adding a permanent test file would
  contradict the constitution's no-test-runner stance and require its own ADR.
- Commit after each story, not each task; each story is the meaningful reviewable unit.
- Do not report Q1, Q7 or Q9 as passing without a human running them.
