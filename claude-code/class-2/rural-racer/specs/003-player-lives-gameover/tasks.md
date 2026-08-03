---
description: "Task list for feature 003-player-lives-gameover"
---

# Tasks: Player Lives and Game Over

**Input**: Design documents from `specs/003-player-lives-gameover/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: No automated test tasks in the repository — the constitution takes an explicit
no-test-runner stance and Principle I forbids build tooling. As in feature 002, a **throwaway**
harness is built in the scratchpad, outside the repo. This one goes further than 002's: it loads
the real `game.js` and *drives the car programmatically*, so the life rules are verified as
behaviour rather than as geometry.

**Organization**: Tasks are grouped by user story. Note the dependency warning below — unlike
feature 002, these three stories are a **strict chain**, not independent.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1…US3)
- Include exact file paths in descriptions

## Path Conventions

- **Source paths** are relative to `claude-code/class-2/rural-racer/`.
- **`<scratchpad>`** is the session scratchpad directory, deliberately outside the repository.
- Single static project: three source files, no `src/`, no `tests/`, no build.

## ⚠️ Story dependencies are a chain, not a fan-out

Feature 002's six stories were independent. These three are not, and pretending otherwise would
produce a misleading plan:

```
US1 (lives are deducted)  →  US2 (running out ends the race)  →  US3 (start again)
```

US2 cannot be triggered without US1's deduction; US3 cannot be reached without US2's game-over
state. Build in order. Parallelism exists only *within* a story, between `game.js` and the
markup/style files.

## Baseline (verified 2026-07-27)

No lives concept exists. `game.offTrack` is maintained every step by `update()` but only drives
penalties; `game.state` has four values; `resetRace()` owns race-lifetime fields; `goFlash` and
`lastCountLabel` exist as the timed-event and render-memo precedents this feature will follow.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Stand up a harness that can drive the real game headlessly, so the per-excursion rule
— the one place a wrong reading ends a race in 50 ms — is proven as behaviour before a browser is
opened.

- [x] T001 Create `<scratchpad>/lives-check.mjs` that loads the real `game.js` via `new Function` with stubbed `window` and `document` (readyState left as `'loading'` so `init()` never fires), following the pattern established in feature 002's `verify-shipped.mjs`, and returns `game`, `update`, `stepGame`, `resetRace`, `restart`, `buildStart`, `buildGates`, `isOnTrack` and `TRACK`
- [x] T002 Add driver helpers to `<scratchpad>/lives-check.mjs`: `startRace()` (build geometry, `resetRace()`, force `game.state = 'racing'`), `placeAt(x, y)` (set car position and `game.prev` together), and `runSteps(n)` (call `update(STEP)` n times), so a test can put the car on or off the track and advance the simulation deterministically

**Checkpoint**: The real game can be driven from Node, so every life rule below can be asserted against shipped code rather than against a description of it.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The state all three stories read. Deliberately inert — after this phase lives exist
and reset correctly, but nothing decrements them yet.

- [x] T003 Add `LIVES_START = 3` and `LIFE_FLASH = 0.6` to the section 1 constants block of `game.js`, beside the existing `CAR`, `OFFROAD` and `WALL_RESTITUTION` tuning values (Principle IV — no magic numbers in update or render code)
- [x] T004 Add `lives: LIVES_START` and `lifeFlash: 0` to the `game` object in the STATE section of `game.js`, with a comment marking `lives` as race-lifetime and `lifeFlash` as a presentation timer
- [x] T005 Set `game.lives = LIVES_START` and `game.lifeFlash = 0` in `resetRace()` in `game.js` — the race-lifetime scope established by feature 002. This single line satisfies FR-001, FR-018 and FR-021 together, and keeps `placeCarAtGrid()` free of lives so the non-finite recovery guard can never cost the player one (FR-011 of feature 002)

**Checkpoint**: Lives exist, start at 3, and are restored by every restart path. User stories can begin.

---

## Phase 3: User Story 1 - Leaving the track costs a life (Priority: P1) 🎯 MVP

**Goal**: Three lives are visible, and each off-track excursion costs exactly one — regardless of
how long it lasts.

**Independent Test**: Testable on its own up to two excursions, without US2 existing. Start a
race, confirm `LIVES` reads 3. Leave the track once for a fraction of a second and once for a full
minute — each costs exactly one life (quickstart L1). Return and leave again — one more (L2).
Pause mid-excursion and resume — no extra charge (L3).

### Implementation for User Story 1

- [x] T006 [US1] In `update()` in `game.js`, capture `const wasOffTrack = game.offTrack;` immediately before the line that recomputes `game.offTrack`, so the rising edge can be detected without introducing a second flag — `game.offTrack` must remain the single definition of the car being off the track (contract C1 G4, Principle IV)
- [x] T007 [US1] Add `loseLife()` to the UPDATE section of `game.js`: return early if `game.lives <= 0`; otherwise decrement `game.lives` and set `game.lifeFlash = LIFE_FLASH`. It MUST perform no DOM write and no `ctx.*` call — presentation belongs to the render path (contract C2 G10)
- [x] T008 [US1] In `update()` in `game.js`, call `loseLife()` when `game.offTrack && !wasOffTrack`, positioned **after** the world-edge backstop and **before** `updateLap(car)` so the bounce-onto-grass case is already reflected in `game.offTrack` (contract C1, data-model "Ordering within a step")
- [x] T009 [P] [US1] Add a `LIVES` panel to `.hud__row--bottom` in `index.html`, before the existing `SPEED` panel, matching the existing panel markup: label `LIVES` and `<span id="lives" class="hud__value">3</span>`
- [x] T010 [P] [US1] Change `.hud__row--bottom` in `styles.css` from `justify-content: flex-end` to `space-between`, so `LIVES` sits left and `SPEED` stays right
- [x] T011 [US1] Add `setText('lives', game.lives);` to `updateHud()` in `game.js`, reusing the existing helper and inheriting the tabular figures and reserved width that keep the layout from shifting (FR-002, SC-007)
- [x] T012 [US1] Decay `game.lifeFlash` by `dt` in `stepGame()` in `game.js`, alongside the existing `goFlash` decay and before the state gate, so it drains identically at any frame rate (Principle III)
- [x] T013 [US1] Add `drawLifeLostCue()` to the RENDER section of `game.js`, drawing a brief red world-space flash whose opacity is driven by `game.lifeFlash / LIFE_FLASH`; call it from `render()` after `drawCar()`; skip entirely when `REDUCED_MOTION` is set (FR-009, FR-026)
- [x] T014 [US1] Announce the loss through the toast live region from `updateScreens()` in `game.js`, using a module-level render-side memo (`lastLivesAnnounced`) so it fires once per change rather than once per frame — mirroring the existing `lastCountLabel` pattern in the same function (FR-024, contract C4 G20). Do NOT call `showToast()` from `update()`
- [x] T015 [US1] Add assertions to `<scratchpad>/lives-check.mjs` for L1–L3: one excursion of 1 step, 120 steps and 3600 steps each costs exactly one life; returning to the track and leaving again costs one more; and simulating a pause (stop calling `update()`, then resume) across an excursion costs nothing extra

**Checkpoint**: Lives deduct correctly per excursion and are visible. Ready for quickstart L1, L2, L3.

---

## Phase 4: User Story 2 - Running out of lives ends the race (Priority: P2)

**Depends on**: US1 — game over is triggered by the third deduction, which does not exist yet.

**Goal**: The third excursion stops the race and shows a game-over panel with the result.

**Independent Test**: Leave the track three times. The race stops, the panel appears within a
second, the controls no longer move the car and both timers are frozen (quickstart L4, L5). An
in-progress lap is not counted (L6).

### Implementation for User Story 2

- [x] T016 [US2] Add `'gameover'` as a fifth value of `game.state` in `game.js`: update the state comment on the `game` object and add `enterGameOver()` to the UPDATE section, which sets `game.state = 'gameover'` and does nothing else. No new guard is needed in `stepGame()` or `togglePause()` — both already act only on `racing`/`paused`, so the world and both timers freeze and pause becomes inert for free (contract C3 G13–G16)
- [x] T017 [US2] Make `loseLife()` in `game.js` call `enterGameOver()` and return `true` when `game.lives` reaches 0, returning `false` otherwise; change the call site from T008 to `if (game.offTrack && !wasOffTrack && loseLife()) return;` so `update()` exits before `updateLap()` on the step the race ends — making FR-015 structurally true rather than incidentally true (contract C3 G17)
- [x] T018 [P] [US2] Add `#gameoverScreen` to `.screens` in `index.html`, reusing the existing `.screen`/`.screen__title`/`.screen__cta` markup: title `GAME OVER`, a result line with `<span id="goLaps">` and `<span id="goBest">`, and `Press <kbd>Enter</kbd> to race again`. Give it `class="screen is-hidden"` to match the pause screen's initial state
- [x] T019 [P] [US2] Add a `.screen__result` rule to `styles.css` for the laps/best line, matching the existing `.screen__cta` and `.screen__controls` treatment
- [x] T020 [US2] In `updateScreens()` in `game.js`, add `toggleHidden('gameoverScreen', game.state !== 'gameover')` and, while the state is `gameover`, write the result with `setText('goLaps', game.lapsDone)` and `setText('goBest', fmtTime(game.best))` — composed live from existing state, with no stored result snapshot (FR-012)
- [x] T021 [US2] Announce game over through the toast live region from `updateScreens()` in `game.js`, once on entry using the same render-side memo approach as T014, including the result and how to start again (FR-025)
- [x] T022 [US2] Add assertions to `<scratchpad>/lives-check.mjs` for L4–L6: three excursions drive `game.lives` to 0 and `game.state` to `'gameover'` while two never do; once in game over, repeated `stepGame()` calls advance neither `lapTime` nor `raceTime` and do not move the car; and `game.lapsDone` does not increase on the step the race ends

**Checkpoint**: The race ends correctly and reports its result. Ready for quickstart L4, L5, L6.

---

## Phase 5: User Story 3 - Starting again after game over (Priority: P3)

**Depends on**: US2 — there is no game-over panel to start again from until it exists.

**Goal**: One key press starts a fresh race with three lives, keeping the session best.

**Independent Test**: Reach game over, press `Enter`, and confirm a new race begins with the usual
countdown, three lives, lap one, zeroed timers, and the previous best lap still displayed
(quickstart L7).

### Implementation for User Story 3

- [x] T023 [US3] Add a `gameover` branch to `onEnter()` in `game.js` calling the existing `restart()`, which already runs `resetRace()` then `startCountdown()` — after T005 that restores lives too, so no new reset path is needed (FR-017, FR-018, FR-020, contract C6 G28)
- [x] T024 [US3] Verify in `game.js` that `R` also restarts from game over — feature 002 made `KeyR` inert only on the title screen — and that the `event.repeat` guard means holding `Enter` on the panel starts exactly one race rather than pinning the countdown (contract C6 G29, G31). Expected outcome is no edit; record the confirmation
- [x] T025 [US3] Verify the pointer reappears on the game-over panel: `updateScreens()` toggles `is-playing` on `game.state === 'racing'`, so a non-racing state restores the cursor with no change. Confirm and record (feature 002 FR-027)
- [x] T026 [US3] Add assertions to `<scratchpad>/lives-check.mjs` for L7: after reaching game over, calling `restart()` sets `game.lives` back to `LIVES_START`, `lapsDone` to 0 and both timers to 0, while `game.best` is preserved unchanged

**Checkpoint**: The loop closes. All three stories complete. Ready for quickstart L7.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T027 Static audit of `game.js`, `index.html` and `styles.css`: no new file, dependency, build step, `localStorage`, `sessionStorage` or network call; `game.js` retains its six-section order; and — specifically for this feature — confirm no `document.`, `setText`, `toggleHidden` or `showToast` call is reachable from `update()`, `loseLife()` or `enterGameOver()` (Principle II)
- [x] T028 Re-evaluate all six constitution gates from `.specify/memory/constitution.md` against the final diff and record the result in this file, as feature 002 did
- [x] T029 Update `PROJECT-EXPLANATION.md`: §8 to document the fifth game state and the game-over panel, §9 to note the life-lost and game-over announcements, and the §11 tuning table to include `LIVES_START` and `LIFE_FLASH`
- [x] T030 Write the implementation PHR to `history/prompts/003-player-lives-gameover/` recording what changed, the harness results, and any deviation from this task list
- [ ] T031 Hand off the manual acceptance suite: `quickstart.md` L1–L9, the feature-002 regression list, and the seven-point constitutional gate. L8 (screen reader) and L9 (reduced motion) require a human, as does any judgement about whether the flash reads clearly while driving — these MUST be reported as outstanding, never as passing

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (Phase 1)**: no dependencies — start immediately.
- **Foundational (Phase 2)**: no dependencies; blocks all three stories.
- **US1 (Phase 3)**: depends on Foundational.
- **US2 (Phase 4)**: depends on **US1** — specifically T017 modifies the call site created by T008.
- **US3 (Phase 5)**: depends on **US2** — there is no game-over state to leave until T016 exists.
- **Polish (Phase 6)**: depends on all three stories.

### Within each story

- US1: T006 → T007 → T008 (same region of `update()`, strictly sequential); T009 ∥ T010 (different
  files); T011 → T012 → T013 → T014; T015 last.
- US2: T016 → T017 (T017 changes what T016 introduced); T018 ∥ T019; T020 → T021; T022 last.
- US3: T023 → T024 → T025 → T026, all small and sequential.

### Parallel opportunities

- **T009 (`index.html`) ∥ T010 (`styles.css`)** — the US1 markup and style work.
- **T018 (`index.html`) ∥ T019 (`styles.css`)** — the US2 panel and its styling.
- That is the whole list. Three source files and a chained story order leave very little genuine
  parallelism, and claiming more would be false.

---

## Parallel Example: User Story 1

```bash
# Different files, no shared state — safe together:
Task: "Add the LIVES panel to .hud__row--bottom in index.html"
Task: "Change .hud__row--bottom to space-between in styles.css"
```

## Parallel Example: User Story 2

```bash
Task: "Add #gameoverScreen markup to .screens in index.html"
Task: "Add the .screen__result rule to styles.css"
```

---

## Implementation Strategy

### MVP First (Setup + Foundational + User Story 1)

1. Phase 1 — harness that can drive the real game headlessly.
2. Phase 2 — lives exist and reset correctly, inert.
3. Phase 3 — lives deduct per excursion and are visible.
4. **STOP and VALIDATE**: run the harness (T015), then quickstart L1, L2 and L3 in the browser.
5. This is a coherent increment on its own: the player has a visible resource that depletes when
   they make mistakes. It has no consequence yet, but nothing is broken.

### Incremental Delivery

1. Setup + Foundational → lives exist.
2. US1 → lives deplete and show → **MVP**.
3. US2 → running out ends the race with a result.
4. US3 → the loop closes.
5. Polish → docs, constitution record, PHR, manual handoff.

### Why US1 goes first and alone

It carries all the design risk. "Deduct a life when off the track" read as a per-frame condition
costs three lives in about 50 ms; read as per-second it makes a long slide arbitrarily expensive.
The whole feature depends on the excursion edge being right, and T015 exists to prove it against
the shipped code before anything is built on top.

---

## Notes

### T028 — Constitution re-check against the final diff (2026-07-27)

| Principle | Verdict | Evidence |
|---|---|---|
| I. Zero Dependencies, Zero Build | ✅ PASS | Still three source files; no `import`/`require`, no package manager |
| II. Simulate and Draw Are Separate | ✅ PASS | Grepped the whole `update()` → `isOnTrack` span for `document.`, `setText`, `toggleHidden`, `showToast`, `ctx.` — **no matches**. `loseLife()` sets a counter and a timer; `enterGameOver()` sets one field. All presentation is render-side |
| III. Fixed-Timestep Determinism | ✅ PASS | `lifeFlash` decays from `dt` in `stepGame()` beside `goFlash`; excursion detection is an edge on per-step state. Harness confirms one charge per excursion at 10, 100 and 1000 steps |
| IV. One Definition Per Fact | ✅ PASS | No second off-track flag — `wasOffTrack` is a local read of `game.offTrack`. `LIVES_START` and `LIFE_FLASH` in the constants block. `game.lives` written only in `resetRace()` and `loseLife()` |
| V. Canvas Owns World, DOM Owns Interface | ✅ PASS | `LIVES` panel and `#gameoverScreen` are DOM reusing existing markup; the life cue is a world-space canvas fill |
| VI. Playable by Default | ✅ PASS | Count sits in the HUD's named group; loss and game over announce through the toast live region once per event; the cue is skipped under `REDUCED_MOTION`; `Enter` operates the panel |

**Additional constraints**: no storage, no network (grep clean). Section order intact (CONSTANTS 14 → STATE 101 → INPUT 192 → UPDATE 259 → RENDER 428 → LOOP 680). **No violations.**

### Deviation record

- **T007 and T017 landed together.** `loseLife()` was written in its final form — decrement, arm the flash, call `enterGameOver()` and return `true` on the last life — rather than being written twice. The call site in T008 was written to match. No behavioural difference; it avoids committing an intermediate version that would be rewritten minutes later.
- **T015's L6 test was wrong on first run and was fixed.** The original setup left the car already off-track from the previous excursion (so there was no rising edge) and its movement segment never actually crossed the start line — meaning the FR-015 assertion passed for the wrong reason. Rewritten so the car starts on-track and exits diagonally across the line into the grass, **plus a control** proving the identical crossing does complete a lap when lives remain. Without that control the assertion would still have been vacuous.

### Verification results — `<scratchpad>/lives-check.mjs`, all passing

- Excursions of **1, 120 and 3600 steps each cost exactly one life**; 10 s on-track costs nothing.
- Return-and-leave costs a second life; returning alone costs nothing.
- Pause mid-excursion, 120 paused steps, then resume still off-track: **no second charge**.
- First step of a race never charges.
- 3 excursions → `lives 0`, `state 'gameover'`; 2 never do.
- In game over: car does not move under held throttle, and neither timer advances over **30 simulated seconds**; pause is inert.
- **Control**: the crossing completes a lap with lives to spare. **Real case**: identical crossing on the last life does **not** count the lap (FR-015).
- `Enter` from game over → countdown, lives 3, lap 1, timers 0, **best lap 42.5 preserved**.
- Manual restart mid-race restores 3 lives and preserves best.
- Non-finite recovery guard costs no life and repairs the car.
- Frame-rate independence: one charge per excursion at 10 / 100 / 1000 steps.

Feature 002 regression: `verify-shipped.mjs` and `gate-check.mjs` both still **ALL CHECKS PASSED**.

---

## Notes

- `[P]` marks tasks in different files with no dependency on incomplete work.
- **Reuse, do not reimplement**: `game.offTrack` (excursion state), `resetRace()` (race lifetime),
  `stepGame()`'s state gate (freezing), `togglePause()`'s guards (pause inertness), `goFlash`
  (timed visual event), `lastCountLabel` (render-side memo), `restart()`, `toggleHidden()`,
  `setText()`, `fmtTime()`, `showToast()`, `.screen` markup and styles, `REDUCED_MOTION`.
- **Do not add a second off-track flag.** `game.offTrack` is the single definition; a parallel
  field would need clearing in three reset scopes and is exactly the divergence Principle IV and
  feature 002 exist to prevent.
- **Do not call `showToast()` from the update path.** `completeLap()` already does, which is a
  pre-existing Principle II violation recorded in `research.md` §R6; this feature routes around it
  rather than doubling it. Fixing `completeLap()` is suggested as separate work.
- The harness is deliberately outside the repository; a permanent test file would contradict the
  constitution's no-test-runner stance.
- Commit after each story — each is the meaningful reviewable unit.
- Do not report L8 or L9 as passing without a human running them.

### Outstanding risk carried from feature 002

This feature extends `game.offTrack` and the state machine delivered by `002-fix-known-defects`,
whose manual suite (Q1–Q11) has **not** been run and whose work is **not committed**. Running 002's
Q1, Q7 and Q9 before starting Phase 3 is strongly recommended — otherwise a failure here is
ambiguous between the two features.
