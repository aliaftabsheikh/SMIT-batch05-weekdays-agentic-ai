# Implementation Plan: Fix Known Defects

**Branch**: `002-fix-known-defects` | **Date**: 2026-07-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/002-fix-known-defects/spec.md`

## Summary

Remediate the eight known defects in Rural Racer without adding a dependency, a build step, or
a fourth source file. Five are correctness fixes (lap validity, restart destroying records,
world-edge pinning, restart key repeat, missing total timer), three are polish and
accessibility fixes (shadow direction, assistive-technology exposure, pointer hiding).

The load-bearing change is checkpoint validation. Today a checkpoint is *drawn* as a
track-width segment and *tested* as a 55 px circle, and the two disagree. Research (Phase 0)
established that the naive repair — test against the segment already drawn — would make the
defect **worse**, because the drawn segment reaches only 41 px either side of the vertex while
the on-track corridor at a corner reaches up to 59.6 px on the inside. Both shapes are wrong.
The fix is to derive one gate segment that exactly spans the corridor cross-section at the
vertex, and use that single definition for both drawing and testing.

Everything else is local and independent: `reset()` splits into three narrower functions so
restart and crash-recovery each clear only what they own; the world-edge backstop reflects
heading instead of zeroing speed; lifecycle keys ignore auto-repeat; `raceTime` gains a HUD
panel; the shadow offset moves outside the rotation; `aria-hidden` comes off live state and
the toast becomes a live region; a state-driven class hides the pointer during play.

## Technical Context

**Language/Version**: JavaScript (ES2020, no transpilation), HTML5, CSS3
**Primary Dependencies**: None — browser platform only. No package manager, no bundler.
**Storage**: N/A — in-memory only. Persistence is forbidden by Constitution §Additional
Constraints without an ADR, and the spec confirms session-only records (FR-012).
**Testing**: Manual. No test runner exists. Verification is the constitution's seven-point
manual acceptance gate plus the spec's eleven success criteria (SC-001…SC-011), recorded in
[quickstart.md](./quickstart.md).
**Target Platform**: Evergreen desktop browsers (Chromium, Firefox, Safari), opened from the
filesystem with no server.
**Project Type**: Single — three static source files, no source tree.
**Performance Goals**: 60 fps at 900×600 on integrated graphics; full-canvas repaint per frame
retained.
**Constraints**: Zero build, zero dependencies, zero network, zero storage. `game.js` remains
one file in its six-section order. All new tuning values enter the section 1 constants block.
**Scale/Scope**: ~680 lines in `game.js`, ~70 in `index.html`, ~240 in `styles.css`. Eight
defects across six user stories; estimated diff under 120 changed lines.

No `NEEDS CLARIFICATION` items remain. The spec carried zero clarification markers, and Phase
0 resolved the one genuine open question (what shape a checkpoint gate should be) by
derivation rather than assumption.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Gates derived from `.specify/memory/constitution.md` v1.0.0.

**Initial evaluation (pre-research)** — all PASS, no violations anticipated.

**Post-design re-evaluation (after Phase 1)** — all PASS:

- [x] **I. Zero Dependencies, Zero Build** — every change lands in the three existing files.
      No package manager, bundler, framework, or CDN link. The game still runs by opening
      `index.html` directly. No fourth source file is introduced.
- [x] **II. Simulate and Draw Are Separate** — the new `gateAt(i)` helper is a pure function
      of `TRACK` returning geometry; it calls no canvas method and mutates nothing, so it is
      safe to call from both `updateLap()` (update) and `drawCheckpoints()` (render). The new
      `is-playing` class toggle is a DOM write made from `updateScreens()`, which is already
      the render-side DOM writer. No new state mutation is reachable from `render()`.
- [x] **III. Fixed-Timestep Determinism** — the total-race-time display reads the existing
      `dt`-accumulated `raceTime`; no new time source. The wall-reflection response is a pure
      function of position and heading, evaluated inside the fixed step. `event.repeat` is an
      input-event property consumed on the keydown edge, outside the simulation, so it cannot
      make physics frame-rate dependent.
- [x] **IV. One Definition Per Fact** — this gate is the point of the feature. `gateAt(i)`
      becomes the single definition of a checkpoint gate, consumed by drawing and testing
      alike, closing the divergence class rather than the instance (FR-003). New tuning values
      (`WALL_RESTITUTION`) go in the section 1 constants block. Geometry continues to derive
      from `TRACK.path`. `CP_RADIUS` is deleted rather than left orphaned.
- [x] **V. Canvas Owns the World, DOM Owns the Interface** — the total race timer is a DOM
      panel matching the existing HUD markup, not canvas text. Gate rendering stays on the
      canvas in 900×600 world coordinates. No new DPI handling.
- [x] **VI. Playable by Default** — five of the six user stories are this principle. Reduced
      motion is untouched and still honoured; `aria-hidden` is removed from live state and the
      toast becomes a polite live region; `pointer-events: none` is retained so overlays never
      swallow clicks; input still keys off `event.code`; focus-loss handling is unchanged.

**Additional constraints**: 60 fps budget held (the gate test replaces a `Math.hypot` with one
segment intersection per step — arithmetically comparable, and `gateAt` results are computed
once at init, not per frame). `game.js` section ordering preserved. No persistence or network
introduced.

**Result: no violations. Complexity Tracking is empty.**

## Project Structure

### Documentation (this feature)

```text
specs/002-fix-known-defects/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output — gate geometry derivation, fix decisions
├── data-model.md        # Phase 1 output — state entities and ownership
├── quickstart.md        # Phase 1 output — run + verification procedure
├── contracts/
│   ├── lap-validation.md    # The rules a lap must satisfy to count
│   └── game-state.md        # State machine, reset scopes, HUD contract
├── checklists/
│   └── requirements.md  # Spec quality checklist (complete)
└── tasks.md             # Phase 2 output (/sp.tasks — NOT created by /sp.plan)
```

### Source Code (repository root)

```text
claude-code/class-2/rural-racer/
├── index.html           # HUD panel added; aria-hidden removed from live regions
├── styles.css           # cursor rule added; HUD row accommodates a fourth panel
├── game.js              # all logic changes
├── PLAN.md              # original design brief (unchanged)
├── PROJECT-EXPLANATION.md  # architecture walkthrough (updated at the end of the feature)
└── .specify/memory/constitution.md
```

**Structure Decision**: Single static project with no source tree. There is no `src/` or
`tests/` directory and none will be created — Constitution Principle I makes the shipped
artifact identical to the source, and splitting `game.js` into modules would impose an HTTP
server requirement that breaks "open `index.html` and it runs". All work happens in the three
existing files, in the sections that already own each concern.

### Change map

| Defect | Story | File | Section / selector |
|---|---|---|---|
| Checkpoint gate geometry | US1 | `game.js` | constants, `updateLap`, `drawCheckpoints`, helpers |
| Restart destroys best | US2 | `game.js` | `reset` → three functions; `restart`, `init`, `update` guard |
| Total race time hidden | US3 | `index.html`, `styles.css`, `game.js` | HUD row, `updateHud` |
| World-edge pinning | US4 | `game.js` | constants, `update` backstop |
| Restart key auto-repeat | US4 | `game.js` | keydown handler |
| Assistive-tech blackout | US5 | `index.html` | `.hud`, `#toast`, `#hint` |
| Shadow rotates with car | US6 | `game.js` | `drawCar` |
| Pointer never hidden | US6 | `styles.css`, `game.js` | `#game`, `updateScreens` |

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. This feature removes complexity on balance: one derived helper replaces two
divergent shape definitions, and `CP_RADIUS` is deleted.

## Phase 2 Notes (for `/sp.tasks`)

- US1 is the only story with real design content; it is also the only one that changes
  gameplay-visible geometry, so it should be implemented and verified first and alone.
- US2, US3, US4, US5, US6 touch disjoint code and can proceed in parallel after US1.
- The `reset()` split (US2) must land before or with the world-edge change (US4), because the
  non-finite guard currently calls `reset()` and both stories touch the recovery path.
- `PROJECT-EXPLANATION.md` §10 (Known issues) must be rewritten as the final task; leaving it
  describing fixed defects would violate the constitution's runtime-guidance clause.

## Architectural decision surfaced

📋 Architectural decision detected: replacing proximity-radius checkpoint validation with
corridor-spanning gate-crossing validation, and making one derived definition serve both
rendering and physics — Document reasoning and tradeoffs? Run
`/sp.adr checkpoint-gate-crossing-validation`
