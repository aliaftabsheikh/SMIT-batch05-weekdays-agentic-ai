---
description: "Task list for 004-three-level-progression"
---

# Tasks: Three-Level Progression

**Input**: Design documents from `/specs/004-three-level-progression/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/level-progression.md](./contracts/level-progression.md),
[quickstart.md](./quickstart.md)

**Tests**: This project has **no test runner**, and the constitution takes that stance deliberately
(`constitution.md:181`). Verification is (a) throwaway Node harnesses in the scratchpad — **outside
the repository** — that load the real `game.js` with a stubbed browser, and (b) the manual procedure
in `quickstart.md`. Harness tasks below are verification tasks, not TDD tests, and no harness file
may be added to the repo.

**Organization**: grouped by user story. Each story is independently demonstrable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelisable — different file, no dependency on incomplete work.
- **[Story]**: `[US1]`, `[US2]`, `[US3]`. Setup, Foundational and Polish carry no story label.

> **Why [P] is rare here.** Almost every task edits the single file `game.js`, which the
> constitution requires to stay one file in six labelled sections (`constitution.md:156`).
> Marking same-file tasks `[P]` would be false. `[P]` appears only where the file genuinely differs
> (`index.html`, `styles.css`, scratchpad harnesses, spec artifacts).

## Path Conventions

Single static page at `claude-code/class-2/rural-racer/`. Three source files: `index.html`,
`styles.css`, `game.js`. Harnesses live at
`<scratchpad>/` = `C:\Users\Lenovo\AppData\Local\Temp\claude\D--Teaching-SMIT-SMIT-batch05-weekdays-agentic-ai-claude-code-class-2-rural-racer\cc898abb-460d-493e-85ff-d271dc78f5d8\scratchpad\`.

---

## Phase 1: Setup

**Purpose**: establish a known-green baseline before anything is touched, so any later failure is
attributable to this feature.

- [ ] T001 [P] Re-run `<scratchpad>/tracks-check.mjs` and confirm **51 assertions, ALL PASSED** across all three tracks. This file already exists from `/sp.plan`; it is the source of truth for the level 2 and level 3 coordinates used in T003.
- [ ] T002 [P] Run the inherited harnesses `<scratchpad>/lives-check.mjs`, `<scratchpad>/verify-shipped.mjs` and `<scratchpad>/gate-check.mjs` against the current `game.js` and record that all three are green **before** any edit. Note in this file if any is already failing — that would be a pre-existing defect, not one this feature introduced.
- [ ] T003 Run `node --check claude-code/class-2/rural-racer/game.js` to confirm a clean parse baseline.

**Checkpoint**: baseline recorded. Any red from here is this feature's fault.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: convert the track from a compile-time singleton into selectable state. **Every user
story depends on this and none can begin until it is done.**

**⚠️ This phase must leave the game fully playable and behaviourally identical to today**, on level 1
only, with no level progression yet. That is what makes it verifiable on its own.

- [ ] T004 In `game.js` section 1, replace the `TRACK` const with `TRACKS` — an array of three `{ name, width, path, checkpoints }` objects. Level 1 = `Meadow Loop`, width `82`, checkpoints `[3,6,9,12]`, **path byte-for-byte unchanged from today** so it stays the control. Levels 2 and 3 = `Mill Creek` (width 72) and `Quarry Ridge` (width 62), coordinates copied exactly from `<scratchpad>/tracks-check.mjs`. Add `const LAPS_PER_LEVEL = 3;`. Delete `HALF_W` (`:61`) and `CP_INDICES` (`:65`).
- [ ] T005 In `game.js` Helpers, add the two pure accessors `track()` and `halfW()` per data-model.md §1. Neither may mutate anything; both must be safe to call from `update()` and `render()`.
- [ ] T006 In `game.js` section 2, add `game.level` (init `0`), `game.runLaps` (init `0`) and `game.bests` (init `[null, null, null]`); **remove `game.best`**; extend the `state` comment to list `'levelup'` and `'finished'`.
- [ ] T007 Repoint all eleven `TRACK` / `HALF_W` / `CP_INDICES` call sites to `track()`, `halfW()` and `track().checkpoints`: `distToPath`, `isOnTrack`, `tangentAt`, `gateAt`, `buildStart`, `buildGates`, `placeCarAtGrid`, `updateLap`, `tracePath`, `drawTrack`, `drawStartLine`. **`gateAt()`'s maths must not change** — it was proven correct in feature 002 and re-proven on two new tracks; only its reads of `HALF_W` and `TRACK.path` change. Confirm by grep that no identifier `TRACK`, `HALF_W` or `CP_INDICES` survives.
- [ ] T008 Repoint every reader of the removed `game.best` to `game.bests[game.level]`: `completeLap()`'s strict-improvement guard, `updateHud()`'s `BEST` panel, and `updateScreens()`'s `goBest`. **This lands here rather than in US3 because the file does not run otherwise** — US3 adds the presentation and the per-level verification, this task only keeps the game working.
- [ ] T009 In `game.js` section 2, add `resetLevel()` and `enterLevel(i)` per data-model.md §3. Move the `game.lives = LIVES_START` line **out of `resetRace()` and into `resetLevel()`** — that single move is the whole "refill each level" rule (FR-009, FR-027). Rewire `resetRace()` to clear `raceTime` and `runLaps` then call `enterLevel(0)`; `resetSession()` to call `resetRace()` then clear `bests`. **`enterLevel()`'s internal order is load-bearing**: `game.level = i` → `buildStart()` → `buildGates()` → `resetLevel()`, because `placeCarAtGrid()` reads `start.dir`.
- [ ] T010 In `game.js` `init()`, remove the now-redundant standalone `buildStart()` / `buildGates()` calls if `resetSession()` already reaches them through `enterLevel(0)`, so the caches have exactly one construction path. Verify `init()` still leaves `game.state === 'title'`.
- [ ] T011 [P] Update the loader export lists in `<scratchpad>/lives-check.mjs` and `<scratchpad>/verify-shipped.mjs`: they export `TRACK`, `HALF_W` and `CP_INDICES`, which no longer exist. Export `TRACKS`, `track`, `halfW`, `enterLevel`, `resetLevel`, `LAPS_PER_LEVEL` instead. Their hard-coded on/off-track points `(400,500)` and `(400,380)` stay valid because level 1's path is unchanged.
- [ ] T012 Run `node --check game.js`, then `lives-check.mjs` and `verify-shipped.mjs`. **Both must pass unchanged.** Retire `gate-check.mjs` — `tracks-check.mjs` supersedes it and covers all three tracks rather than one.

**Checkpoint**: the game plays exactly as it did before, on level 1, with the track now selectable.
No progression yet. All inherited behaviour green.

---

## Phase 3: User Story 1 — Three laps clears a level (Priority: P1) 🎯 MVP

**Goal**: completing three valid laps stops the race, announces the level cleared, and — on the
player's key press — loads the next track with its own gates, its own grid and three fresh lives.

**Independent Test**: drive three valid laps; confirm the race stops and a panel names the level;
press Enter; confirm a visibly different track, lap `1/3`, lives `3`, and that lap validation works
on the new track (a clean lap counts, a skipped checkpoint does not).

### Verification harness for US1

> Written **before** the implementation it checks. Per plan.md's flywheel note, **the negative
> control (T013) comes first**: the stale-cache bug this feature is most likely to introduce is
> invisible to a positive test, and feature 003 already proved a positive-only assertion can pass
> for the wrong reason.

- [ ] T013 [P] [US1] Create `<scratchpad>/levels-check.mjs` following `lives-check.mjs`'s loader pattern (real `game.js`, stubbed `window`/`document`, `readyState: 'loading'` so `init()` never fires). Implement **L-E first** — the C-3 negative control: pick a point that is on-track on level 1 and off-track on level 2, advance to level 2, and assert `isOnTrack` now reports `false`. Assert it also fails if the caches are *not* rebuilt, so the test is proven capable of catching the bug.
- [ ] T014 [US1] Add to `levels-check.mjs`: **L-A** (C-1 — third valid lap sets `lapsDone = K`, increments `runLaps`, sets `state = 'levelup'`, leaves `level` unchanged), **L-B** (C-2 — `onEnter` advances `level`, restores `lives` to 3 from any value, zeroes `lapsDone`/`nextCp`/`lapTime`, leaves `raceTime`/`runLaps`/`bests` untouched), **L-C** (car spawns on-track on the new level, `offTrack === false`), **L-D** (C-3 positive — a valid lap on level 2 registers, and one with a checkpoint skipped does not).

### Implementation for US1

- [ ] T015 [US1] In `game.js` `completeLap()`, after the existing `nextCp = 0`, add `game.runLaps++` and the level-advance branch: `if (game.lapsDone >= LAPS_PER_LEVEL) game.state = game.level < TRACKS.length - 1 ? 'levelup' : 'finished';`. **Remove the `showToast(...)` call entirely** — R5. After this task `completeLap()` must contain no DOM call at all.
- [ ] T016 [US1] In `game.js` `onEnter()`, add the `levelup` branch: `enterLevel(game.level + 1); startCountdown();`.
- [ ] T017 [P] [US1] In `index.html`, add `#levelScreen` inside `.screens`, modelled exactly on `#gameoverScreen`: `.screen__title` for `LEVEL n CLEARED`, a `.screen__result` line with `id="lvlName"` (next track's name) and `id="lvlBest"` (this level's best lap), and a `.screen__cta` naming <kbd>Enter</kbd>. Start it `is-hidden`. **Do not add `aria-hidden`** (Principle VI).
- [ ] T018 [US1] In `game.js` `updateScreens()`, add `toggleHidden('levelScreen', game.state !== 'levelup')`, populate its result text when `state === 'levelup'`, and add the render-side memo `lastRunLapsAnnounced` alongside the existing three. Build the single-slot announcement chain in the C-9 order: `finished → levelup → gameover → lap completed → life lost`. The lap toast (`LAP n · time`, with the NEW BEST flourish) now lives **here**, not in `completeLap()` — keyed on `game.runLaps` changing, which is monotonic across a run where `lapsDone` is not.
- [ ] T019 [US1] Run `levels-check.mjs`. All L-A…L-E must pass. If any fails, **establish whether the code or the test is wrong before changing either** — twice in this project the test has been at fault.

**Checkpoint**: three laps clears a level and loads the next track correctly. US1 is demonstrable on
its own; levels 2 and 3 are reachable and playable even though clearing level 3 does nothing useful
yet.

---

## Phase 4: User Story 2 — Clearing all three levels wins the run (Priority: P2)

**Goal**: clearing level 3 ends the run in victory with a report of the whole run, and running out
of lives ends it without one.

**Independent Test**: clear all three levels; confirm a victory panel rather than a fourth track,
reporting total run time and all three best laps, and that Enter starts a fresh run at level 1.

### Implementation for US2

- [ ] T020 [P] [US2] In `index.html`, add `#winScreen` inside `.screens`, modelled on `#gameoverScreen`: title `COURSE COMPLETE`, a `.screen__result` reporting total run time (`id="winTime"`) and all three level bests (`id="winB1"`, `id="winB2"`, `id="winB3"`) each labelled with its track name, and a `.screen__cta` naming <kbd>Enter</kbd>. Start it `is-hidden`, no `aria-hidden`.
- [ ] T021 [US2] In `game.js` `onEnter()`, add the `finished` branch → `restart()`. Confirm `restart()` already does the right thing: `resetRace()` clears `raceTime` and `runLaps` and calls `enterLevel(0)`, and `bests` survives because it is session-lifetime.
- [ ] T022 [US2] In `game.js` `updateScreens()`, add `toggleHidden('winScreen', game.state !== 'finished')` and populate its four result fields when `state === 'finished'`, using `fmtTime()` and `TRACKS[i].name`.
- [ ] T023 [US2] In `game.js` `updateScreens()`, change the game-over panel to report the **run**, not the level: `goLaps` reads `game.runLaps` (FR-017), and add the level reached. Update the `GAME OVER` toast text to match.
- [ ] T024 [US2] Add to `levels-check.mjs`: **L-F** (C-4 — nine valid laps reach `state === 'finished'` and `level` never exceeds 2), **L-G** (Enter from `finished` gives `level 0`, `raceTime 0`, `runLaps 0`, `lives 3`, `bests` preserved), **L-H** (C-5 — over 1800 steps in each of `levelup`, `finished` and `gameover` with the throttle held, the car does not move and neither timer advances; `togglePause()` is inert).
- [ ] T025 [US2] Add to `levels-check.mjs` the **C-6 precedence pair**: **L-I** the positive control — a movement segment that genuinely crosses the finish line with every checkpoint cleared **does** complete a lap when lives remain — and **L-J** the real assertion — the identical crossing on the last life yields `state === 'gameover'` with `lapsDone` and `runLaps` unchanged. **L-I must be written and shown to pass first**; without it L-J proves nothing. Note that on a start line every point is on-track by construction, so the crossing must be a diagonal that begins on the track and exits into the grass.
- [ ] T026 [US2] Run `levels-check.mjs`. All L-A…L-J must pass.

**Checkpoint**: the game has an ending. US1 and US2 both work independently.

---

## Phase 5: User Story 3 — Knowing where you are in the run (Priority: P3)

**Goal**: level, lap-within-level and the current level's best lap are all readable at a glance while
driving.

**Independent Test**: read the level and lap readouts through a nine-lap run and confirm they match
reality at every point; set a best on level 1, advance, and confirm level 2 shows its own.

### Implementation for US3

- [ ] T027 [P] [US3] In `index.html`, add a `LEVEL` panel to `.hud__row--bottom` **between** the existing `LIVES` and `SPEED` panels, with `id="level"`. The row is already `justify-content: space-between`, so three panels lay out left/centre/right with no CSS change.
- [ ] T028 [US3] In `game.js` `updateHud()`, set `level` to `` `${game.level + 1}/${TRACKS.length}` `` and change the `lap` panel to `` `${game.lap}/${LAPS_PER_LEVEL}` ``. Confirm `BEST` reads `game.bests[game.level]` (done in T008) so it shows the placeholder on a level with no lap yet.
- [ ] T029 [US3] Verify FR-040: `.hud__value` already carries `min-width: 3ch` and `font-variant-numeric: tabular-nums`, so `1/3` occupies exactly the reserved width and no digit change reflows the row. **Only add CSS if this is observably false** — record either way, and record any addition as a deviation.
- [ ] T030 [US3] Confirm the level name reaches the player at the level change (FR-036): `#levelScreen`'s `lvlName` from T017 plus the `levelup` toast from T018. If the toast does not include the name, add it there — not in a new element.
- [ ] T031 [US3] Add to `levels-check.mjs`: **L-K** (C-7 — a lap on level `L` writes only `bests[L]`; a slower lap never replaces a faster one; `restart()` preserves all three slots; `resetSession()` clears all three), **L-L** (C-9 — on the third lap of a level the `levelup` announcement wins over the lap announcement, and only one fires).
- [ ] T032 [US3] Run `levels-check.mjs`. All L-A…L-L must pass.

**Checkpoint**: all three user stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T033 Amend `.specify/memory/constitution.md` **1.0.0 → 1.0.1 (PATCH)**. Principle IV names `TRACK` (`:96`) and `CP_INDICES` (`:100`) directly; rename to `TRACKS` and per-track `checkpoints`. **Meaning is unchanged — this is a wording fix, not a relaxation.** Update the Sync Impact Report at the top of the file and the `Last Amended` date. This is the single item in plan.md's Complexity Tracking table.
- [ ] T034 [P] Update `PROJECT-EXPLANATION.md`: §6 (lap validation is now per level), §8 (the state machine has seven states; describe the level/run/session lifetimes), §11 (tuning table gains `TRACKS`, `LAPS_PER_LEVEL`; loses `HALF_W`, `CP_INDICES`).
- [ ] T035 **Single-definition audit (Principle IV)**: confirm `game.level` is the only definition of the active track; no `TRACK`/`HALF_W`/`CP_INDICES` identifier survives; `CP_GATES` and `start` have exactly one construction path (`enterLevel`); the gate drawn by `drawCheckpoints()` is the same object `updateLap()` tests; every new tuning value sits in the section 1 constants block.
- [ ] T036 **Update/render separation audit (Principle II)**: grep the whole `update()` call graph for `document.`, `setText`, `toggleHidden`, `showToast` and `ctx.`. Expected result: **zero matches — including from `completeLap()`**. Confirm the four render memos are module-level and none is a field on `game`. Record the count of Principle II exceptions in `game.js` as **0**, down from 1.
- [ ] T037 **Determinism check (Principle III)**: confirm no new wall-clock read and no new per-frame multiplier; `raceTime` still accumulates from the fixed `dt`; the three loop guards (`MAX_FRAME`, `MAX_STEPS`, leftover-accumulator drop) are untouched. Add a frame-rate independence assertion to `levels-check.mjs`: nine laps driven at 10, 100 and 1000 steps per chunk produce identical `level`, `runLaps` and `state`.
- [ ] T038 **Accessibility pass (Principle VI)**: no `aria-hidden` on `#levelScreen` or `#winScreen`; the `LEVEL` panel sits inside the HUD's named `role="group"`; both new announcements ride the existing `role="status"` toast; no new animation is introduced, so `prefers-reduced-motion` needs no new branch — **verify that claim rather than asserting it**.
- [ ] T039 **Section-order audit**: `game.js` still reads CONSTANTS → STATE → INPUT → UPDATE → RENDER → LOOP → Helpers, with every new function in the section that owns it. Record the line number of each section header.
- [ ] T040 **Zero-dependency audit (Principle I)**: still exactly three source files; no package manager, bundler or CDN link; no `localStorage`/`sessionStorage`/cookie/network call anywhere; the page opens by double-clicking `index.html`.
- [ ] T041 Full regression: run `tracks-check.mjs`, `levels-check.mjs`, `lives-check.mjs`, `verify-shipped.mjs` and `node --check game.js`. **All must be green.** Record the assertion counts.
- [ ] T042 Record the post-implementation Constitution Check re-evaluation as a six-row PASS/FAIL table in this file, matching plan.md's pre-design gate. Record any deviation from the plan with its reason, as features 002 and 003 did.
- [ ] T043 **Hand off the manual acceptance suite**: `quickstart.md` **L1–L17**. Steps **L6, L10, L12, L13, L14, L15** require a human and MUST be reported as outstanding, never as passing. **L13 in particular** — FR-020's difficulty ordering is the feature's headline claim, and the only evidence available before someone plays it is two monotonic measurements (corridor ÷ car `2.41 → 2.12 → 1.82`, corners under 120° `6 → 8 → 12`). Measurements are not a verdict. Also hand over the still-outstanding feature 002 (Q1–Q11) and feature 003 (L1–L9) suites.

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1 Setup** — no dependencies.
- **Phase 2 Foundational** — depends on Phase 1. **Blocks all three user stories.** This is not
  boilerplate: it is the track-singleton conversion, and no story can be written against a fixed
  track.
- **Phase 3 US1 (P1)** — depends on Phase 2.
- **Phase 4 US2 (P2)** — depends on Phase 2. Shares `updateScreens()` and `onEnter()` with US1, so
  in practice it follows US1 rather than running beside it.
- **Phase 5 US3 (P3)** — depends on Phase 2 only. Genuinely independent of US1/US2: it is HUD
  presentation over state that Phase 2 already created.
- **Phase 6 Polish** — depends on all stories.

### Within Phase 2 (strictly ordered)

`T004 → T005 → T006 → T007 → T008 → T009 → T010 → T011 → T012`

T007 cannot run before T005 (the accessors must exist). T009 cannot run before T006 (`game.level`
must exist). T012 is the gate that proves the conversion changed nothing observable.

### Parallel opportunities

Sparse by construction — see the note at the top.

- T001, T002 (different harnesses)
- T011 (scratchpad) alongside T004–T010 (`game.js`)
- T013 (scratchpad) alongside T015–T018 (`game.js`)
- T017, T020, T027 (`index.html`) each alongside the `game.js` task beside them
- T034 (`PROJECT-EXPLANATION.md`) alongside T033 (`constitution.md`)

---

## Implementation Strategy

### MVP

Phase 1 → Phase 2 → Phase 3 (US1). At that point the game has three levels that advance correctly —
the literal request. **Stop and validate before Phase 4.**

The Phase 2 checkpoint is itself worth stopping at: the game should be *indistinguishable* from
today. If it is not, the conversion is wrong and no amount of level logic on top will fix it.

### Incremental delivery

1. Phase 2 → track is selectable, nothing else changed → verify by regression
2. + US1 → levels advance → **MVP**
3. + US2 → the game has an ending
4. + US3 → the player can see where they are
5. + Polish → constitution, docs, audits, handoff

### Risk order

The two tasks most likely to hide a defect are **T007** (eleven mechanical call-site renames, where
a missed site is a silent cross-track bug rather than a crash) and **T009** (`enterLevel()`'s
ordering, where a stale cache means lap validation silently tests the previous level's gates).
T013's negative control exists specifically for the second, and T012's regression for the first.

---

## Notes

- `[P]` = different file, no dependency on incomplete work.
- No harness file may be committed to the repository; all live in the scratchpad.
- `gateAt()` is not to be touched. It was proven correct in feature 002 and re-proven on two new
  tracks in `/sp.plan`; any "simplification" re-opens that defect.
- Level 1's path must stay byte-for-byte identical. It is the control for every regression in this
  feature.
- Commit after each phase checkpoint, not after each task.
- **If a harness fails, determine whether the code or the test is wrong before changing either.**
  Twice in this project the test has been at fault — feature 003's vacuous FR-015 assertion, and
  this feature's C2 containment check during `/sp.plan`.
