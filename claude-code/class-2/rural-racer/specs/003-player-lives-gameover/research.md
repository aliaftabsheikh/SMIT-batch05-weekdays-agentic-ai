# Phase 0 Research: Player Lives and Game Over

**Feature**: `003-player-lives-gameover` | **Date**: 2026-07-27

The spec carried zero `NEEDS CLARIFICATION` markers and the one ambiguity that mattered — whether
"opponent" meant a rival car — was resolved by the author before planning: *"Mistakenly using
opponent word it's a single user game."* No rival vehicle, race positions or win condition are in
scope.

There are no dependencies or integrations to research; the project has none. What follows is
seven implementation decisions, each recorded with the alternatives rejected.

---

## R1. Detecting an excursion (FR-003, FR-004, FR-005 — US1)

**The problem.** Being off the track is a *continuous* condition. `update()` runs 60 times a
second, so "deduct a life when off the track" read naively costs three lives in 50 ms. The spec
pins the intent — one life per excursion, charged when the car leaves — but the game has no
concept of an excursion.

**Decision**: it already does. `game.offTrack` is recomputed every step and is exactly the
excursion state. An excursion begins on its **rising edge**:

```
wasOffTrack = game.offTrack            // previous step's value
game.offTrack = !isOnTrack(car.x, car.y)
if (game.offTrack && !wasOffTrack) loseLife()
```

**Rationale**:

- **No new state.** Adding a separate `inExcursion` flag would create a second definition of "the
  car is off the track", free to drift from the first — precisely the failure Principle IV exists
  to prevent, and precisely the bug feature 002 spent its effort removing.
- **Pause-mid-excursion falls out for free.** A paused game runs no steps, so `game.offTrack`
  holds its value across the pause and the resume produces no rising edge. The spec's
  pause-mid-slide and tab-switch edge cases need no special handling at all.
- **Race start is safe.** `placeCarAtGrid()` sets `offTrack = false` and spawns the car on the
  track, so the first step of a race can never see a spurious edge.
- **Frame-rate independent.** An edge on per-step state cannot fire more than once per transition,
  whatever the frame rate.
- **The world-boundary bounce is handled correctly by accident.** Being bounced onto the grass is
  simply being off the track; it costs a life like any other excursion, which the spec's edge
  cases already call for.

**Alternatives considered**:

| Alternative | Rejected because |
|---|---|
| Charge per frame while off-track | Ends the race in ~50 ms. Not a reading anyone intended. |
| Charge per second off-track | Makes a long slide arbitrarily expensive and turns lives into a stopwatch. The spec explicitly requires one life per excursion regardless of duration. |
| Separate `game.inExcursion` flag | Second definition of one fact (Principle IV). It would also need clearing in three reset scopes, giving three more places to get it wrong. |
| Require the car to be off-track for N ms before charging | A grace period is defensible design, but it is not what was asked for, and it introduces a duration threshold with no stated value. Deferred as a possible future tuning, not built. |
| Deduct on *return* to the track rather than on leaving | A player who never returns would never be charged, so the last life could never be spent by driving into the grass and staying there. |

---

## R2. Where the game-over state lives (FR-010, FR-013, FR-014, FR-016 — US2)

**Decision**: add `'gameover'` as a fifth value of `game.state`, alongside `title`, `countdown`,
`racing` and `paused`.

**Rationale**: `stepGame()` already reads

```
if (game.state !== 'racing') return;   // title / paused: freeze the world
```

so a new non-`racing` state freezes the car (FR-013) and stops both timers (FR-014) with **no new
code**. `togglePause()` already acts only on `racing` and `paused`, so pause is inert in game over
(FR-016) with no new code either. `render()` continues to run, so the frozen scene stays on screen
behind the panel. Three requirements are satisfied by the state machine that already exists.

**Alternatives considered**: a boolean `game.over` alongside the state — rejected, it creates two
sources of truth for "is the game running" and every existing state guard would need a second
condition; reusing `'paused'` with a flag — rejected, pause is resumable and game over is not.

---

## R3. When the last life is charged, relative to lap completion (FR-015 — US2)

**The subtlety.** The finish-line test in `updateLap()` does **not** require the car to be
on-track — only checkpoint registration does. So a car with every checkpoint cleared could, in the
same step, drift a pixel off the track next to the start line, lose its last life, and cross the
line. The spec says that lap must not count.

**Decision**: charge the excursion **after** the world-edge backstop and **before**
`updateLap()`, and return early from `update()` when the charge ends the race.

```
… integrate position …
… off-track penalties (sets game.offTrack) …
… world-edge backstop …
if (game.offTrack && !wasOffTrack && loseLife()) return;   // last life — race over
updateLap(car);
```

`loseLife()` returns `true` only when it triggered game over.

**Rationale**: placing the charge before `updateLap()` and returning is the smallest change that
makes FR-015 structurally true rather than incidentally true — the lap-completion code simply does
not run on the step the race ends. Placing it after the backstop means the bounce-onto-grass case
is already reflected in `game.offTrack` before it is read. Skipping the remaining tail of
`update()` (dust ageing, the finiteness guard) is harmless because the world is about to freeze,
and `game.prev` going stale for one step does not matter: the next `update()` can only happen
after a restart, which repositions the car and resets `prev`.

**Alternatives considered**: letting the step finish and voiding the lap afterwards — rejected as
an "undo" that has to know what to undo; checking `game.lives > 0` inside `completeLap()` —
rejected, it puts lap logic in charge of a rule that is not about laps.

---

## R4. Lives ownership and lifetime (FR-001, FR-018, FR-021, FR-022)

**Decision**: `game.lives` is **race-lifetime** state, set to `LIVES_START` (3) inside
`resetRace()`.

**Rationale**: feature 002 established three reset scopes — `placeCarAtGrid()` (car),
`resetRace()` (race), `resetSession()` (page) — with the rule that an operation clears its own
lifetime and nothing wider. Lives are per-race by definition, so a single line in `resetRace()`
satisfies FR-018 (start again restores three) and FR-021 (manual restart restores three)
simultaneously, and `resetSession()` inherits it. Nothing is written to storage, so FR-022 holds
by construction.

Placing lives correctly also keeps the recovery path correct for free: the non-finite guard calls
`placeCarAtGrid()`, which does not touch lives — repairing a corrupted car position should not
cost the player a life, and does not.

**Alternatives considered**: session-lifetime lives (carried across restarts) — rejected, it
contradicts FR-018 and makes restart pointless; a separate `resetLives()` — rejected, a fourth
scope for a single field.

---

## R5. Presenting the life count (FR-002, FR-009, FR-023, SC-007)

**Decision**: a numeric `LIVES` panel in the HUD's bottom row, matching every other readout, with
the bottom row rebalanced to `space-between` so LIVES sits left and SPEED right. Losing a life is
signalled by a brief red canvas flash driven by `game.lifeFlash`, plus an announcement through the
existing toast live region.

**Rationale**: the top row already carries four panels after feature 002 and a fifth would crowd
it; the bottom row carries one and is visually unbalanced. Putting lives bottom-left costs one
CSS property and gives the count its own uncluttered position. Numeric presentation matches the
established HUD language, inherits `font-variant-numeric: tabular-nums` and a reserved width so
the layout cannot shift (SC-007), and is read correctly by assistive technology from the HUD's
named group with no extra markup (FR-023).

**Alternatives considered**:

| Alternative | Rejected because |
|---|---|
| Three heart glyphs, spent ones dimmed | More glanceable, but it encodes the same fact twice (glyph state *and* count) and needs an `aria-label` maintained in parallel with the visual — a second definition and an accessibility trap, for a marginal gain over a single digit beside a `LIVES` label. |
| Fifth panel in the top row | Five panels overflow a narrow stage; the bottom row is right there and empty. |
| Drawing lives on the canvas | Forbidden by Principle V. |
| Flashing the HUD panel itself | The player is looking at the track, not the HUD, at the moment they go off. A world-space flash is where their eyes already are. |

---

## R6. Where the DOM writes go — and a pre-existing violation this does not extend

**The problem.** This feature adds two player-visible events, and the file's existing event path
is `completeLap()` → `showToast()`, which does `document.getElementById(...)` and writes
`innerHTML`. `completeLap()` is called from `updateLap()`, which is called from `update()`.
**That is a DOM write from the update path, which Principle II forbids.** It is pre-existing, and
it is not this feature's job to fix — but copying it would double the violation.

**Decision**: all new DOM writes happen on the render side.

- `enterGameOver()` sets `game.state = 'gameover'` and nothing else.
- `loseLife()` decrements `game.lives` and arms `game.lifeFlash`, a seconds-remaining timer.
- `updateScreens()` shows and hides `#gameoverScreen`, writes its result text, and issues the
  life-lost announcement, using a render-side memo (`lastLivesAnnounced`) to fire once per change
  — exactly the `lastCountLabel` pattern already used for the countdown in that same function.
- The flash itself is drawn on the canvas from `game.lifeFlash`, mirroring `goFlash`.

**Rationale**: every mechanism needed already exists in the file as a working precedent, so being
correct here costs nothing. `goFlash` shows how a timed visual event is carried from update to
render; `lastCountLabel` shows how a render-side memo turns a value into an edge.

**Observation for a future change, not this one**: `completeLap()`'s toast call should move to the
same render-side memo, which would close the pre-existing violation. Suggested as separate work so
this feature's diff stays scoped to its own requirements.

---

## R7. Starting again (FR-017, FR-020 — US3)

**Decision**: `Enter` from the game-over panel calls the existing `restart()`, which already runs
`resetRace()` then `startCountdown()`. `onEnter()` gains one branch.

**Rationale**: `Enter` is what the title and pause screens already advertise, so the panel teaches
nothing new. `restart()` already does precisely what FR-018 and FR-020 require — grid, cleared
race state, countdown — and after R4 it restores lives too, so no new reset path is needed.
`R` also continues to work, since feature 002 made it inert only on the title screen.

**Alternatives considered**: auto-restart on a timer — rejected, it takes control away exactly
when the player wants to read their result, and the spec calls for a key press; a clickable
button — rejected, the game is keyboard-only and overlays are `pointer-events: none`.

---

## R8. Reduced motion (FR-026)

**Decision**: the life-lost flash is suppressed when `REDUCED_MOTION` is set, exactly as dust
already is. The count still changes and the announcement still fires, so no information is lost —
only the animation.

**Rationale**: `REDUCED_MOTION` is already read once at load and already gates particle spawning;
this is one more condition on an existing constant. The game-over panel reuses `.screen`, whose
backdrop blur is already disabled under reduced motion in `styles.css`.

---

## Cross-cutting confirmations

- **No dependency, build step, storage or network** is introduced by any decision above.
- **No decision puts a canvas call or DOM write in the update path**, and none puts a state
  mutation in the render path (R6).
- **No decision introduces a wall-clock read**; `lifeFlash` decays from the fixed `dt` (R8, and
  `goFlash` precedent).
- **`game.offTrack` remains the single definition** of the car being off the track (R1).
- Every decision above is covered by at least one success criterion and one step in
  [quickstart.md](./quickstart.md).
