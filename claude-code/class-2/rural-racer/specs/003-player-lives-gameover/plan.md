# Implementation Plan: Player Lives and Game Over

**Branch**: `003-player-lives-gameover` | **Date**: 2026-07-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/003-player-lives-gameover/spec.md`

## Summary

Give the single-player car three lives, charge one per off-track excursion, and end the race with
a game-over panel when they run out. Confirmed by the author: the word "opponent" in the original
request was a slip — this is a single-user game and no rival vehicle is in scope.

Almost all of this falls out of state the game already keeps. `game.offTrack` is already
maintained every step, so an *excursion* is simply its rising edge — no new tracking, and pausing
mid-slide costs nothing extra because a paused game runs no steps and the flag holds its value.
`stepGame()` already freezes the world in any non-`racing` state, so adding `'gameover'` to the
state machine freezes the car and both timers with no new code. `resetRace()` already owns exactly
the race-lifetime fields lives belong with, so restoring three lives on restart is one line.

The only real design work is where the DOM writes go. `enterGameOver()` runs inside `update()`,
so it may set state and nothing else — the panel, its result text and the life-lost announcement
are all produced on the render side, following the `goFlash` / `lastCountLabel` patterns already
in the file.

## Technical Context

**Language/Version**: JavaScript (ES2020, no transpilation), HTML5, CSS3
**Primary Dependencies**: None — browser platform only.
**Storage**: N/A — in-memory only. Lives, results and history are never persisted (FR-022).
**Testing**: Manual. No test runner. Verification is the constitution's seven-point gate plus this
feature's [quickstart.md](./quickstart.md) L1–L9.
**Target Platform**: Evergreen desktop browsers, opened from the filesystem with no server.
**Project Type**: Single — three static source files, no source tree.
**Performance Goals**: 60 fps at 900×600 on integrated graphics, unchanged (SC-009).
**Constraints**: Zero build, zero dependencies, zero network, zero storage. `game.js` stays one
file in its six-section order. New tuning values enter the section 1 constants block.
**Scale/Scope**: 3 user stories, 26 functional requirements. Estimated diff under 90 changed
lines across the three existing files.

No `NEEDS CLARIFICATION` items. The spec carried none, and the single ambiguity that mattered —
whether "opponent" meant a rival car — was resolved directly by the author before planning began.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Gates from `.specify/memory/constitution.md` v1.0.0.

**Initial evaluation (pre-research)** — all PASS. One risk flagged for Phase 0: this feature adds
two player-visible *events* (life lost, game over), and the file's existing event → toast path
writes to the DOM from inside `update()`, which Principle II forbids.

**Post-design re-evaluation (after Phase 1)** — all PASS:

- [x] **I. Zero Dependencies, Zero Build** — all changes land in the three existing files. No
      package manager, bundler, framework or CDN link. Still opens by double-clicking.
- [x] **II. Simulate and Draw Are Separate** — the risk above is resolved rather than repeated.
      `enterGameOver()` sets `game.state` and nothing else; `loseLife()` decrements a counter and
      arms a `lifeFlash` timer. Every DOM write — the panel, its result text, the life-lost
      announcement — happens in `updateScreens()`, using the `lastCountLabel` render-memo pattern
      already in the file. No new `ctx.*` call is reachable from `update()`; no new mutation of
      `game` is reachable from `render()`. See research §R6 for the pre-existing violation this
      deliberately does **not** extend.
- [x] **III. Fixed-Timestep Determinism** — `lifeFlash` decays from the fixed `dt` in
      `stepGame()`, exactly as `goFlash` already does. No wall-clock read. Excursion detection is
      an edge on per-step state, so it is frame-rate independent by construction.
- [x] **IV. One Definition Per Fact** — `game.offTrack` remains the *single* definition of "the
      car is off the track"; the excursion edge is derived from it rather than duplicated into a
      parallel flag. `LIVES_START` and `LIFE_FLASH` go in the constants block. The life count has
      one owner (`game.lives`) and one lifetime (race).
- [x] **V. Canvas Owns the World, DOM Owns the Interface** — the LIVES readout and the game-over
      panel are DOM, reusing the existing `.hud__panel` and `.screen` markup. The life-lost flash
      is a world-space canvas effect. No canvas text is added.
- [x] **VI. Playable by Default** — the life count sits inside the HUD's existing named group so
      assistive technology can query it; life loss and game over both announce through the toast
      live region added in 002; the flash is suppressed under `prefers-reduced-motion`; the panel
      is keyboard-operable with the same `Enter` used by the title and pause screens.

**Additional constraints**: 60 fps budget held (one boolean comparison per step, one extra DOM
text write per frame). Section order preserved. No persistence, no network.

**Result: no violations. Complexity Tracking is empty.**

## Project Structure

### Documentation (this feature)

```text
specs/003-player-lives-gameover/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 — excursion edge, state placement, DOM-write placement
├── data-model.md        # Phase 1 — lives ownership, lifetimes, state machine
├── quickstart.md        # Phase 1 — L1–L9 verification procedure
├── contracts/
│   └── lives-and-gameover.md
├── checklists/
│   └── requirements.md  # Spec quality checklist (complete)
└── tasks.md             # Phase 2 output (/sp.tasks — NOT created by /sp.plan)
```

### Source Code (repository root)

```text
claude-code/class-2/rural-racer/
├── index.html           # LIVES panel; #gameoverScreen
├── styles.css           # bottom HUD row balance; game-over result styling
├── game.js              # constants, state, excursion edge, game-over state, HUD, panel, flash
└── .specify/memory/constitution.md
```

**Structure Decision**: Unchanged from feature 002 — a single static project with no source tree
and no build. Every change lands in the three existing files, in the sections that already own
each concern.

### Change map

| Requirement group | File | Section / selector |
|---|---|---|
| `LIVES_START`, `LIFE_FLASH` | `game.js` | section 1 constants |
| `game.lives`, `game.lifeFlash`; `resetRace()` | `game.js` | section 2 STATE |
| `onEnter()` handles game over | `game.js` | section 3 INPUT |
| Excursion edge, `loseLife()`, `enterGameOver()` | `game.js` | section 4 UPDATE |
| Life-lost flash; LIVES readout; game-over panel + result | `game.js` | section 5 RENDER |
| `lifeFlash` decay | `game.js` | section 6 LOOP (`stepGame`) |
| LIVES panel, `#gameoverScreen` | `index.html` | `.hud__row--bottom`, `.screens` |
| Bottom-row balance, result line | `styles.css` | `.hud__row--bottom`, `.screen__result` |

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. The feature adds one state, one counter and one timer; it introduces no new
concept that the file did not already have a pattern for.

## Phase 2 Notes (for `/sp.tasks`)

- **US1 is the MVP and carries all the risk.** The excursion edge is the one place a wrong reading
  ends a race in a twentieth of a second. It should land and be verified alone.
- US2 depends on US1 (game over is triggered by the third deduction). US3 depends on US2.
  Unusually for this project the three stories are a strict chain, not independent — worth saying
  plainly in `tasks.md` rather than pretending to parallelism that does not exist.
- Within stories, `index.html` and `styles.css` work can proceed in parallel with `game.js` work.
- `PROJECT-EXPLANATION.md` §8 (game states) and the §11 tuning table need updating as a final
  task, as in 002.

## Outstanding risk carried from feature 002

This feature extends `game.offTrack` and the state machine, both delivered by
`002-fix-known-defects`, whose manual acceptance suite (`quickstart.md` Q1–Q11) **has not been
run**. That code is proven numerically but not by hand, and none of it is committed. Running Q1,
Q7 and Q9 before building on it remains the recommendation.

## Architectural decisions surfaced

None meeting the three-part test. Every decision here is local: it reuses an existing pattern in
the file (`goFlash`, `lastCountLabel`, `.screen`, `resetRace`), has one obvious right answer given
the constitution, and changes nothing cross-cutting. Recording them in `research.md` is
sufficient; no ADR is warranted.
