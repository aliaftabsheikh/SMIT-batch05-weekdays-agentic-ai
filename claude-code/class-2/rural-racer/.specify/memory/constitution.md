<!--
SYNC IMPACT REPORT
==================
Version change: (unversioned template) → 1.0.0
Bump rationale: Initial ratification. Every placeholder was unfilled; this is the first
concrete constitution, so MAJOR baseline 1.0.0 applies rather than an increment.

Principles defined (all new — template slots had no prior titles):
  [PRINCIPLE_1_NAME] → I. Zero Dependencies, Zero Build
  [PRINCIPLE_2_NAME] → II. Simulate and Draw Are Separate (NON-NEGOTIABLE)
  [PRINCIPLE_3_NAME] → III. Fixed-Timestep Determinism
  [PRINCIPLE_4_NAME] → IV. One Definition Per Fact
  [PRINCIPLE_5_NAME] → V. Canvas Owns the World, DOM Owns the Interface
  [PRINCIPLE_6_NAME] → VI. Playable by Default

Sections added:
  [SECTION_2_NAME] → Additional Constraints
  [SECTION_3_NAME] → Development Workflow and Quality Gates
  Governance (rules filled)

Sections removed: none

Templates requiring updates:
  ✅ .specify/templates/plan-template.md — Constitution Check gates filled with the six
     principles; Technical Context advisory left intact.
  ✅ .specify/templates/tasks-template.md — Polish phase gained determinism/accessibility
     task types driven by Principles III and VI.
  ✅ .specify/templates/spec-template.md — reviewed; scope/requirements structure already
     compatible, no mandatory section added or removed by this constitution.
  ⚠ .specify/templates/commands/*.md — directory does not exist in this project; nothing
     to reconcile. Re-run this check if command files are added later.
  ✅ PROJECT-EXPLANATION.md — source of derivation; already consistent, no edit needed.
  ⚠ PLAN.md — predates this constitution. Its §5 acceptance checklist is compatible but was
     not re-keyed to principle IDs. Optional follow-up, not blocking.

Deferred TODOs: none. RATIFICATION_DATE set to first adoption (2026-07-27) rather than
deferred, since no prior constitution existed.
-->

# Rural Racer Constitution

## Core Principles

### I. Zero Dependencies, Zero Build

Rural Racer MUST run by opening `index.html` in a browser. No package manager, bundler,
transpiler, framework, CDN link, or build step may be introduced. The shipped artifact is
exactly the source: `index.html`, `styles.css`, `game.js`.

- Any proposed dependency MUST be rejected unless it is removed again before merge.
- Browser APIs are the platform; if a capability is not in the browser, it is out of scope.
- New behaviour MUST be added to the existing three files unless a fourth file is justified
  in the plan's Complexity Tracking table.

**Rationale**: The project's teaching and portability value comes from being readable and
runnable with nothing installed. A build step would make the code unreadable in the browser
and untestable by double-clicking, which is the only distribution mechanism this game has.

### II. Simulate and Draw Are Separate (NON-NEGOTIABLE)

The update path and the render path MUST NOT overlap.

- `update()` and everything it calls MUST NOT invoke any `ctx.*` canvas method, read canvas
  dimensions, or touch the DOM.
- `render()` and everything it calls MUST NOT mutate any field on `game`, on `game.car`, or
  on any other simulation state.
- Cached render-only values (e.g. `lastCountLabel`) MUST live in render-scope module
  variables, never on the `game` object.

**Rationale**: This is what makes running several physics steps per drawn frame possible, and
what keeps the simulation reproducible. A single state mutation inside a draw call silently
couples physics to frame rate and makes every timing bug unreproducible.

### III. Fixed-Timestep Determinism

Physics and timing MUST advance only in exact `STEP` slices via the accumulator in `frame()`.

- No simulation code may use the raw frame delta, wall-clock time, `Date.now()`, or
  `performance.now()` to advance state.
- Every per-frame integration MUST be expressed in terms of the passed `dt`; frame-rate
  decay MUST use exponential forms (`Math.exp(-k * dt)`), never per-frame multipliers.
- The three loop guards — `MAX_FRAME`, `MAX_STEPS`, and dropping leftover accumulator time —
  MUST remain in place. Degrade by slowing down; never freeze, never teleport.
- Lap and race timers MUST be accumulated from `dt` inside `update()`, so pausing stops the
  clock as a consequence of the loop rather than as a special case.

**Rationale**: Lap times are the entire scoring mechanism. If a 144 Hz machine and a 60 Hz
machine simulate differently, times are not comparable and the game has no point.

### IV. One Definition Per Fact

Every fact about the world MUST have exactly one definition, and all consumers — physics,
rendering, and layout — MUST derive from it.

- The track is the centerline path stroked at `TRACK.width`. Collision, drawing, and derived
  geometry (start line, checkpoint gates) MUST all be computed from `TRACK.path`.
- A shape that is *drawn* one way and *tested* another way is a defect, not a shortcut. The
  known `CP_RADIUS` bug — gates rendered as full-width segments but validated as a 55 px
  circle — is the canonical violation of this principle.
- All tuning values MUST live in the section 1 constants block (`CAR`, `TRACK`, `OFFROAD`,
  `CP_INDICES`, `COLOR`, `STEP`). Magic numbers inline in update or render code are
  forbidden.
- The palette is the one permitted duplication, because the canvas 2D API cannot read CSS
  custom properties. `COLOR` in `game.js` and `:root` in `styles.css` MUST be changed
  together, and any change to one without the other is an incomplete change.

**Rationale**: The centerline-path design is the reason this codebase stays small — one
14-point array defines the entire circuit. Divergence between what the player sees and what
the code tests produces bugs that are invisible in review and infuriating in play.

### V. Canvas Owns the World, DOM Owns the Interface

- Everything that moves in world space — grass, track, gates, dust, the car, world-space cues
  — MUST be painted on the canvas.
- Everything that is text or a screen — HUD values, toast, hint, title, pause, countdown —
  MUST be DOM elements styled in `styles.css` and updated through `setText()` /
  `toggleHidden()`.
- All drawing code MUST work in the fixed 900×600 world coordinate space. Device pixel ratio
  and display size are handled once, in `resizeCanvas()`, and nowhere else.
- Overlays MUST set `pointer-events: none` so input reaches the canvas.

**Rationale**: Canvas text is blurry, unstyleable, and inaccessible; CSS text is none of
those. Confining DPI handling to a single `setTransform()` call means no drawing code ever
has to reason about scaling.

### VI. Playable by Default

The game MUST remain usable without configuration, without a mouse, and without sight of
transient animation.

- `prefers-reduced-motion` MUST be honoured in both layers: `game.js` suppresses particle
  effects, `styles.css` suppresses animations and transitions.
- Game state that a sighted player can read MUST be available to assistive technology. Adding
  `aria-hidden` to a live-state element is forbidden; use `pointer-events: none` for
  click-through instead.
- Numeric HUD readouts MUST use tabular figures and reserved `min-width`, so changing digits
  never reflow the layout.
- Input MUST key off `event.code`, not `event.key`, so physical key positions work on every
  keyboard layout.
- Focus loss (`blur`, `visibilitychange`) MUST clear held keys and pause a running race. A
  stuck throttle or a lap time lost to a tab switch is a correctness bug.
- Restart MUST NOT destroy session records, and a defensive recovery path MUST repair only
  what is broken — never reset scoring state as a side effect.

**Rationale**: This is a game played in a browser tab by whoever opens the file. Every
assumption about input device, motion tolerance, keyboard layout, or uninterrupted focus is
an assumption that excludes a real player.

## Additional Constraints

**Performance budget**: 60 fps at 900×600 on integrated graphics. Full-canvas repaint each
frame is the accepted design; dirty-rectangle tracking MUST NOT be introduced without a
measured frame-time regression justifying it. Particle counts MUST stay bounded (current cap:
140).

**File and size discipline**: `game.js` stays a single file organised in its six labelled
sections, read top-to-bottom: CONSTANTS → STATE → INPUT → UPDATE → RENDER → LOOP → Helpers.
New code goes in the section that owns it. Splitting into modules requires an ADR, because
ES modules impose an HTTP-server requirement that breaks Principle I.

**Target platform**: Current evergreen desktop browsers (Chromium, Firefox, Safari). Features
used MUST be baseline-available without polyfills.

**State ownership**: All mutable simulation state lives on the single `game` object. Module-
level `let` is permitted only for the loop driver (`lastTime`, `accumulator`), the canvas
handles, and render-only caches.

**No persistence, no network**: The game stores nothing and contacts nothing. Adding
`localStorage`, analytics, or any network call requires an ADR.

## Development Workflow and Quality Gates

**Specification first**: Behavioural changes are specified before they are implemented.
`PLAN.md` is the existing acceptance spec; new features follow the SpecKit flow
(`/sp.specify` → `/sp.plan` → `/sp.tasks` → `/sp.implement`). Code that implements a
requirement MUST be traceable to the requirement ID it satisfies.

**Smallest viable diff**: Changes are scoped to the requirement. Unrelated refactoring,
reformatting, and opportunistic cleanup MUST be separate changes.

**Verification**: This project has no test runner, so acceptance is manual and MUST be
recorded in the task or PR. The minimum manual gate for any change touching physics, track,
or lap logic:

1. A full clean lap counts, and the lap timer resets to zero.
2. A lap with any checkpoint skipped does NOT count.
3. Crossing the start line backwards does NOT count.
4. Pause freezes both the world and the clock; resume continues from the same time.
5. Alt-tab mid-throttle returns with no key stuck and the race paused.
6. The car behaves identically at 60 Hz and at a throttled/uncapped frame rate.
7. Off-track slows the car without trapping it, and the world edge never pins it.

**Records**: Every user request produces a Prompt History Record under `history/prompts/`,
routed by stage. Architecturally significant decisions — anything that would relax a
principle above — are proposed via `/sp.adr` and require explicit consent; they are never
created automatically.

**Code references**: Review comments, plans, and task descriptions cite code as
`file:line` so claims are checkable.

## Governance

This constitution supersedes ad-hoc practice. Where a plan, task, or review conflicts with it,
the constitution wins until it is formally amended.

**Amendment procedure**: Amendments are proposed as a concrete diff to this file together
with the rationale and the version bump. An amendment that relaxes or removes a principle
MUST cite the ADR that justifies it. On acceptance, the Sync Impact Report at the top of this
file is updated and every dependent template listed there is re-verified in the same change.

**Versioning policy**: Semantic versioning applies to governance, not to the game.

- **MAJOR** — a principle is removed, redefined, or made backward-incompatible.
- **MINOR** — a principle or section is added, or existing guidance is materially expanded.
- **PATCH** — clarification, wording, or typo fixes that do not change meaning.

**Compliance review**: The `/sp.plan` Constitution Check gate MUST be evaluated before Phase 0
research and re-evaluated after Phase 1 design. Any violation MUST either be removed or
recorded in the plan's Complexity Tracking table with the simpler alternative that was
rejected and why. Unjustified violations block the plan.

**Runtime guidance**: `CLAUDE.md` holds the agent operating contract for this project and
`PROJECT-EXPLANATION.md` holds the architectural walkthrough. Neither overrides this file;
when they drift, this file is corrected first and they are updated to match.

**Version**: 1.0.0 | **Ratified**: 2026-07-27 | **Last Amended**: 2026-07-27
