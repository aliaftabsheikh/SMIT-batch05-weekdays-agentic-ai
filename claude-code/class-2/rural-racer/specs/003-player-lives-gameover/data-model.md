# Phase 1 Data Model: Player Lives and Game Over

**Feature**: `003-player-lives-gameover` | **Date**: 2026-07-27

No database, no schema, no persistence. This describes the additions to the in-memory `game`
object, which lifetime each belongs to, and how the state machine grows. It extends the lifetime
model established in `002-fix-known-defects`.

---

## Lifetimes (unchanged model, one new tenant)

| Lifetime | Begins | Ends | Cleared by |
|---|---|---|---|
| **Page** | page load | reload | `resetSession()` |
| **Race** | countdown start | restart / game over → restart | `resetRace()` |
| **Lap** | lap start | lap completion, restart, recovery | `completeLap()`, `resetRace()`, recovery |
| **Frame** | each step | each step | recomputed every step |

**The rule, unchanged**: an operation clears its own lifetime and narrower, never wider.

**Lives are Race-lifetime.** That single placement satisfies FR-001, FR-018 and FR-021 at once,
and keeps the recovery path correct for free — the non-finite guard calls `placeCarAtGrid()`,
which does not touch lives, so repairing a corrupted car position cannot cost the player a life.

---

## New fields

### `game.lives` — *Race lifetime*

| Property | Value |
|---|---|
| Type | integer |
| Initial | `LIVES_START` (3) |
| Range | `0 … LIVES_START` |
| Set by | `resetRace()` (to 3), `loseLife()` (decrement) |
| Read by | `updateHud()`, `loseLife()` |

**Rules**

- MUST be exactly `LIVES_START` at the start of every race (FR-001).
- Decremented by exactly one per excursion, at its start (FR-003, FR-004).
- MUST never fall below zero (FR-008). `loseLife()` returns early if already zero.
- Reaching zero transitions the game to `gameover` (FR-010).
- Never written to storage (FR-022).

**Transitions**: `3 → 2 → 1 → 0` — one step per excursion · `n → 3` on `resetRace()`.

---

### `game.lifeFlash` — *Frame lifetime*

| Property | Value |
|---|---|
| Type | number (seconds remaining) |
| Initial | `0` |
| Set by | `loseLife()` (to `LIFE_FLASH`), `stepGame()` (decay) |
| Read by | the render path only |

**Rules**

- Armed to `LIFE_FLASH` when a life is lost; decays by the fixed `dt` in `stepGame()`, exactly as
  `goFlash` already does (Principle III — no wall-clock read).
- Read only by rendering, which draws a brief world-space cue while it is positive.
- Suppressed entirely under `REDUCED_MOTION` (FR-026). The count and the announcement are
  unaffected, so no information depends on the animation.
- Carries no meaning beyond "flash now" — it is a presentation timer, not game state.

---

### `game.state` — *extended enum*

Gains a fifth value, `'gameover'`.

```
        Enter                countdown ≤ 0
title ─────────→ countdown ──────────────→ racing
                     ↑                     │  ↕  P / Esc / blur / tab hidden
                     │                     │  paused
                     │        lives reach 0 │
                     │                     ↓
                     └──── Enter / R ── gameover
```

**Why this is nearly free**: `stepGame()` already returns early for any state that is not
`racing`, so `gameover` freezes the car (FR-013) and stops the lap and total timers (FR-014) with
no new code. `togglePause()` already acts only on `racing` and `paused`, so pause is inert in
game over (FR-016) with no new code. `render()` keeps running, so the frozen scene stays visible
behind the panel.

---

## Derived, not stored

### Excursion

**Not a field.** An excursion is the interval during which `game.offTrack` is true; its start is
that flag's rising edge, detected by comparing the value before and after the per-step
recomputation.

| Property | Source |
|---|---|
| In progress | `game.offTrack` |
| Started this step | `game.offTrack && !wasOffTrack` |
| Ended this step | `!game.offTrack && wasOffTrack` (not needed by any requirement) |

**Rules**

- MUST NOT be duplicated into a separate flag. `game.offTrack` is the single definition of the car
  being off the track (Principle IV), and a parallel field would need clearing in three reset
  scopes — three more places to get it wrong.
- Exactly one life is charged per excursion, at its start (FR-004), so duration is irrelevant.
- A pause spans an excursion without ending it: a paused game runs no steps, `game.offTrack` holds
  its value, and the resume produces no rising edge. The spec's pause-mid-slide and tab-switch
  edge cases require no code.
- `placeCarAtGrid()` sets `offTrack = false` and spawns the car on the track, so the first step of
  any race cannot produce a spurious edge.

### Race Result

**Not stored.** The game-over panel reports values that already exist:

| Shown | Source |
|---|---|
| Laps completed | `game.lapsDone` |
| Best lap | `game.best` via `fmtTime()` |

Composed in `updateScreens()` on the render side while the state is `gameover` (FR-012). Storing a
result snapshot would duplicate live state for no benefit — nothing mutates it once the world is
frozen.

---

## Ordering within a step

The excursion charge sits between the world-edge backstop and `updateLap()`:

```
integrate position
  ↓
off-track penalties          → sets game.offTrack
  ↓
world-edge backstop          → bounce may put the car on grass, already reflected above
  ↓
excursion charge             → if this ends the race, return from update() now
  ↓
updateLap()                  → therefore cannot run on the step the race ends  (FR-015)
```

Returning early is what makes FR-015 structurally true rather than incidentally true: the
lap-completion code does not execute on the final step, so an in-progress lap cannot be counted
by a car that drifted off-track beside the start line on its last life.

---

## Invariants

Existing invariants from feature 002 all still hold. Added:

1. `0 ≤ game.lives ≤ LIVES_START` at all times.
2. `game.lives === 0` **iff** `game.state === 'gameover'` — the two are set together and cleared
   together by `resetRace()`.
3. `game.lifeFlash ≥ 0`, and is non-zero only within `LIFE_FLASH` seconds of a deduction.
4. `game.offTrack === false` immediately after `placeCarAtGrid()`.
5. No step both charges the last life and completes a lap.
6. `game.lives` is never read or written outside `resetRace()`, `loseLife()` and `updateHud()`.
