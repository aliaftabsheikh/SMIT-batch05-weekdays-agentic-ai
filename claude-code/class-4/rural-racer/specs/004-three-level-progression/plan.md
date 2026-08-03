# Implementation Plan: Three-Level Progression

**Branch**: `004-three-level-progression` | **Date**: 2026-07-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-three-level-progression/spec.md`

## Summary

Turn a single endless circuit into three levels of three laps each, ending in victory. The level
rules are small; the work is that **the track is currently a compile-time singleton**. `TRACK`
(`game.js:42`), `CP_INDICES` (`:65`) and the derived `HALF_W` (`:61`) are `const`s read directly by
eleven call sites across collision, lap validation, spawning and rendering.

The approach: `TRACKS` becomes an array of three track definitions, `game.level` becomes the only
new source of truth, and `track()` / `halfW()` accessors replace the constants — so the active
track stays *derived*, never a reassigned module-level `let`, which the constitution's State
ownership rule forbids. `start` and `CP_GATES` remain exactly what they are today: derived caches,
rebuilt by the existing `buildStart()` / `buildGates()` at each level change.

**Track geometry is already settled and machine-verified** — see [research.md](./research.md) §R7.
All three paths pass 51 geometric checks, including the feature-002 corridor-containment property
at every checkpoint on every track.

## Technical Context

**Language/Version**: ES2020 JavaScript, `'use strict'`, single script tag. No modules — ES modules
would impose an HTTP server and break Principle I.
**Primary Dependencies**: None. Canvas 2D and the DOM are the entire platform.
**Storage**: None, and none may be added (constitution: *No persistence, no network*).
**Testing**: No test runner. Verification is (a) throwaway Node harnesses in the scratchpad, outside
the repository, that load the real `game.js` with a stubbed browser, and (b) the manual procedure in
[quickstart.md](./quickstart.md).
**Target Platform**: Current evergreen desktop browsers, opened from the file system.
**Project Type**: Single static page — three source files, no build.
**Performance Goals**: 60 fps at 900×600 on integrated graphics, unchanged. `halfW()` lands in the
hot path (`isOnTrack` → every step) and must not measurably cost anything.
**Constraints**: Fixed `STEP = 1/60` accumulator; `game.js` keeps its six labelled sections; all new
tuning values in the section 1 constants block.
**Scale/Scope**: 3 tracks, 9 laps per run, 2 new game states, ~40 functional requirements.

## Constitution Check

*GATE: evaluated before Phase 0, re-evaluated after Phase 1 design.*

| Principle | Pre-design | Post-design | Notes |
|---|---|---|---|
| **I. Zero Dependencies, Zero Build** | PASS | PASS | Still three files. Two new tracks are data in the constants block, not new files. |
| **II. Simulate and Draw Are Separate** | PASS | PASS | `completeLap()` sets `game.state` and nothing else. Both new announcements go through render-side memos. **This feature also removes the file's one existing violation** — see R5. |
| **III. Fixed-Timestep Determinism** | PASS | PASS | No new time-dependent code at all. `raceTime` already integrates from `dt`; spanning levels changes only when it is reset. |
| **IV. One Definition Per Fact** | ⚠ see below | PASS | The constitution *names* `TRACK` and `CP_INDICES` in Principle IV (`:96`, `:100`). The principle is upheld — one definition, all consumers derive — but its wording must be amended to the new names in the same change. Recorded in Complexity Tracking. |
| **V. Canvas Owns the World, DOM Owns the Interface** | PASS | PASS | Two new screens are DOM. Track names are DOM text. Nothing new is painted. |
| **VI. Playable by Default** | PASS | PASS | New readouts inherit tabular figures and reserved widths; new screens reuse `.screen`, already reduced-motion aware; announcements ride the existing `role="status"` toast. |

**Additional constraints**: 60 fps budget held (R6); `game.js` section ordering preserved; no
persistence or network introduced.

**Gate result: PASS**, with one wording amendment tracked below. No principle is relaxed.

## Design decisions

Full reasoning and rejected alternatives are in [research.md](./research.md). The eight decisions:

| # | Decision |
|---|---|
| R1 | The active track is **derived from `game.level`** via `track()` / `halfW()` accessors — not a reassigned `let TRACK`. |
| R2 | A **fourth reset scope**: car → **level** → run → session. `lives` moves into `resetLevel()`, which is the entire "refill each level" rule. |
| R3 | Two new states, `'levelup'` and `'finished'`. Freezing, timer stop and pause-inertness all come free from `stepGame()` and `togglePause()` as they already are. |
| R4 | **Three per-level bests on the session lifetime** (`game.bests[3]`), resolving the collision between "best for the current level" and Principle VI. |
| R5 | All announcements move to `updateScreens()` behind memos, **closing the pre-existing `completeLap()` → `showToast()` violation** rather than tripling it. |
| R6 | `halfW()` in the hot path is one property read and a divide against `distToPath()`'s 14–19 segment tests — measured, not assumed. |
| R7 | **Track geometry authored against a harness, not by eye**: seven machine-checked constraints, 51 assertions, level 1 as the control. |
| R8 | The HUD gains a `LEVEL` panel; `LAP` becomes `n/3`; `BEST` indexes the current level. |

## Project Structure

### Documentation (this feature)

```text
specs/004-three-level-progression/
├── spec.md                          # /sp.specify output
├── plan.md                          # This file
├── research.md                      # Phase 0 — eight decisions, alternatives rejected
├── data-model.md                    # Phase 1 — state, lifetimes, transitions
├── contracts/
│   └── level-progression.md         # Phase 1 — the behavioural contract
├── quickstart.md                    # Phase 1 — manual acceptance procedure
├── checklists/requirements.md       # /sp.specify output — 16/16
└── tasks.md                         # /sp.tasks output — NOT created here
```

### Source Code

```text
claude-code/class-2/rural-racer/
├── index.html      # LEVEL panel; #levelScreen; #winScreen
├── styles.css      # at most one rule (track-name subtitle)
├── game.js         # all logic — six sections, order preserved
└── .specify/memory/constitution.md   # PATCH 1.0.0 → 1.0.1 (Principle IV wording)
```

**Structure Decision**: unchanged. The constitution requires new behaviour to live in the existing
three files unless a fourth is justified here; nothing about this feature justifies one. Two new
track definitions are ~35 lines of data in the section 1 constants block, where `TRACK` already
lives.

### Changes by file

**`game.js`** — every change lands in the section that already owns it:

| Section | Change |
|---|---|
| 1 CONSTANTS | `TRACK` → `TRACKS` (3 entries, each `{ name, width, path, checkpoints }`); delete `HALF_W` and `CP_INDICES`; add `LAPS_PER_LEVEL = 3` |
| 2 STATE | `game.level`, `game.runLaps`, `game.bests`; `'levelup'`/`'finished'` in the state comment; `resetLevel()` and `enterLevel()`; `lives` moves out of `resetRace()` |
| 3 INPUT | `onEnter()` gains two branches |
| 4 UPDATE | `isOnTrack`/`distToPath`/`updateLap` read `track()`/`halfW()`; `completeLap()` advances the level and drops its `showToast()` call |
| 5 RENDER | `tracePath`/`drawTrack`/`drawStartLine` read `track()`; `updateHud` LAP `n/3`, LEVEL, per-level BEST; `updateScreens` two screens + announcement chain + memos |
| Helpers | `track()`, `halfW()`; `tangentAt`/`gateAt`/`buildStart`/`buildGates`/`placeCarAtGrid` read the accessors. **`gateAt()`'s maths is not touched.** |

**`index.html`** — `LEVEL` panel in `.hud__row--bottom` between `LIVES` and `SPEED`;
`#levelScreen`; `#winScreen`. Both new screens follow `#gameoverScreen`'s markup exactly.

**`styles.css`** — expected to need nothing. `.hud__row--bottom` is already `space-between`, which
lays out three panels as left/centre/right. One rule may be needed for the track-name subtitle.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Constitution Principle IV names `TRACK` and `CP_INDICES` directly (`constitution.md:96,100`); this feature renames them. Requires a PATCH amendment 1.0.0 → 1.0.1 in the same change. | The principle is about *one definition per fact*, which is upheld — the amendment is to its examples, not its rule. Leaving the wording stale would make the governing document describe symbols that no longer exist. | Keeping the name `TRACK` for the array was rejected: `TRACK.path` would no longer be a path, so every call site would read as a type error. Keeping a singleton `TRACK` alias alongside `TRACKS` was rejected outright — two definitions of the active track is exactly what Principle IV forbids. |

No other violation. In particular this feature **removes** a standing Principle II violation rather
than adding one.

## Verification strategy

1. **`tracks-check.mjs`** — geometry, already run at planning time. 51 assertions across seven
   constraints for all three tracks. **Currently ALL PASSED.** Level 1 is the control.
2. **`levels-check.mjs`** — behaviour, to be written at `/sp.implement`, driving the shipped
   `game.js` headlessly as `lives-check.mjs` does.
3. **Regression** — `lives-check.mjs` and `verify-shipped.mjs` export `TRACK`, `HALF_W` and
   `CP_INDICES` from their loaders and must be repointed; their hard-coded on/off track points stay
   valid because level 1's path is untouched. `gate-check.mjs` is superseded by `tracks-check.mjs`.
4. **Static audit** — no `document.`/`setText`/`toggleHidden`/`showToast`/`ctx.` reachable from
   `update()`; six-section order intact; three source files; no dependency, build, storage, network.
5. **Constitution gate** — six principles re-checked post-implementation, plus the seven-point
   manual gate at `constitution.md:185-191`.
6. **Manual** — [quickstart.md](./quickstart.md). **FR-020 (each level harder) can only be closed
   by SC-008, which needs a human across repeated trials.** The geometry harness measures the
   difficulty ladder; it does not judge it. This must never be reported as passing on the strength
   of a narrower corridor.

## Risks

- **A stale derived cache after a level change** is the failure this design exists to prevent, and
  the one that would be least visible: lap validation silently testing level 1's gates on level 2's
  track. `enterLevel()` rebuilds both caches in a fixed order before the car is placed, and
  `levels-check.mjs` carries a dedicated negative control for it.
- **Level 3 at width 62 with `CAR.W = 34`** leaves a corridor/car ratio of 1.82 against level 1's
  2.41. It is machine-proven *completable*; whether it is *fair* is a human judgement, and width is
  a single number per track if it needs to change.
- **The accessor rename touches eleven call sites**, one of which runs 60 times a second. Mechanical
  but wide; a missed site is a silent cross-track bug rather than a crash.
