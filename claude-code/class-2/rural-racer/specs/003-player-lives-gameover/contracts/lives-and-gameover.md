# Contract: Lives, Game Over and Starting Again

**Feature**: `003-player-lives-gameover` | **Date**: 2026-07-27
**Covers**: FR-001 … FR-026

> **Why this is not an OpenAPI document.** Rural Racer has no server, no endpoints and no network
> access — the constitution forbids all three. The contracts that matter are the internal ones
> between the update path, the render path and the existing state machine. These are stated in the
> same input / output / guarantee terms an API contract would use. Extends the contracts in
> `specs/002-fix-known-defects/contracts/`.

---

## C1. Excursion detection

Evaluated once per fixed step, inside `update()`, after the world-edge backstop.

**Inputs**: `game.offTrack` (previous step's value, captured before recomputation), the car's
current position.

**Rule**

```
wasOffTrack   = game.offTrack
game.offTrack = !isOnTrack(car.x, car.y)
… off-track penalties …
… world-edge backstop …
if (game.offTrack && !wasOffTrack) → charge one life
```

**Guarantees**

- **G1** — At most one charge per transition onto the grass, whatever the frame rate (FR-004).
- **G2** — Duration and distance off-track are irrelevant to the charge (FR-004).
- **G3** — Returning to the track and leaving again charges again (FR-005).
- **G4** — No parallel excursion flag exists; `game.offTrack` is the single definition
  (Principle IV).
- **G5** — A pause spanning an excursion produces no second charge: a paused game runs no steps,
  so the flag holds and no rising edge occurs on resume.
- **G6** — No charge can occur outside the `racing` state, because `update()` runs only then
  (FR-006).
- **G7** — The first step of a race cannot charge: `placeCarAtGrid()` sets `offTrack = false` and
  spawns on the track.
- **G8** — Existing off-track consequences (drag, speed cap, dust, on-screen cue) are unchanged
  (FR-007).

---

## C2. `loseLife() → boolean`

**Preconditions**: called only from the update path, only on an excursion start.

**Effects**

| Field | Transition |
|---|---|
| `game.lives` | `n → n − 1`, floored at 0 |
| `game.lifeFlash` | `→ LIFE_FLASH` |
| `game.state` | `racing → gameover` **iff** `game.lives` reaches 0 |

**Returns**: `true` iff it entered game over — the caller uses this to `return` from `update()`
immediately.

**Guarantees**

- **G9** — Returns early with no effect if `game.lives` is already 0 (FR-008).
- **G10** — Performs **no DOM write and no canvas call** (Principle II). It sets a counter and
  arms a timer; all presentation is the render path's job.
- **G11** — Does not touch `lapsDone`, `raceTime`, `best`, or the car.
- **G12** — `game.lives === 0` and `game.state === 'gameover'` are set in the same step and are
  therefore always consistent (invariant 2).

---

## C3. Game-over state

**Rule**: `'gameover'` is a fifth value of `game.state`.

**Guarantees**

| Guarantee | Mechanism | Requirement |
|---|---|---|
| **G13** — the car does not move | `stepGame()` already returns early for any non-`racing` state | FR-013 |
| **G14** — lap timer and total race time both stop | both accumulate inside `update()`, which does not run | FR-014 |
| **G15** — pause has no effect | `togglePause()` already acts only on `racing` and `paused` | FR-016 |
| **G16** — the frozen scene stays visible | `render()` continues to run every frame | FR-011 |
| **G17** — an in-progress lap is not counted | `update()` returns before `updateLap()` on the step the race ends | FR-015 |

None of G13–G16 requires new code. They are properties of the state machine that already exists.

---

## C4. Presentation (render path only)

All of the following happen in `updateScreens()` or the canvas draw path. **No new DOM write or
`ctx.*` call is reachable from `update()`.**

| Element | Source | Rule | Requirement |
|---|---|---|---|
| `LIVES` HUD panel | `game.lives` | numeric, tabular figures, reserved width so digits never reflow the layout | FR-002, SC-007 |
| Life-lost cue | `game.lifeFlash > 0` | brief world-space canvas flash; suppressed under `REDUCED_MOTION` | FR-009, FR-026 |
| Life-lost announcement | `game.lives` change | issued through the toast live region, once per change, via a render-side memo (`lastLivesAnnounced`) mirroring the existing `lastCountLabel` pattern | FR-024 |
| `#gameoverScreen` | `game.state === 'gameover'` | shown/hidden by the same `toggleHidden` used for the title and pause screens | FR-011 |
| Panel result | `game.lapsDone`, `game.best` | laps completed and best lap, composed live — no stored snapshot | FR-012 |

**Guarantees**

- **G18** — `updateScreens()` and the draw path mutate no field of `game` (Principle II).
- **G19** — The life count reaches assistive technology through the HUD's existing named group; no
  extra markup and no parallel `aria-label` to maintain (FR-023).
- **G20** — Life loss and game over each announce exactly once per occurrence, not once per frame
  (FR-024, FR-025).
- **G21** — The HUD is not a live region and does not become one.

---

## C5. Reset and restart

**Rule**: `game.lives = LIVES_START` is set in `resetRace()` and nowhere else.

**Guarantees**

- **G22** — Starting again from game over restores three lives, the grid position, lap counter,
  both timers and checkpoint progress — because `restart()` calls `resetRace()` (FR-018).
- **G23** — The manual restart control restores three lives by the same path (FR-021).
- **G24** — The session best lap survives, because `resetRace()` does not touch `best`
  (FR-019).
- **G25** — A new race begins with the usual countdown: `restart()` already calls
  `startCountdown()` (FR-020).
- **G26** — The non-finite recovery guard calls `placeCarAtGrid()`, which does not touch lives —
  repairing a corrupted position never costs a life.
- **G27** — Nothing is written to `localStorage`, `sessionStorage`, cookies or the network
  (FR-022).

---

## C6. Input

**Rule**: `onEnter()` gains one branch.

```
title    → startCountdown()
paused   → resume()
gameover → restart()          ← new
```

**Guarantees**

- **G28** — A single `Enter` press starts a new race from game over (FR-017), the same key the
  title and pause screens already advertise.
- **G29** — `R` also restarts from game over; feature 002 made it inert only on the title screen.
- **G30** — Movement keys still enter the key set in game over but have no effect, because
  `update()` does not run. No new guard is required.
- **G31** — `event.repeat` filtering on lifecycle keys, added in 002, still applies — holding
  `Enter` on the game-over panel starts exactly one race.

---

## Verification hooks

| Contract | Success criterion | Quickstart step |
|---|---|---|
| C1 G1, G2 | SC-001 — 20 excursions, one life each | L1 |
| C1 G3 | SC-001 — leaving twice costs two | L2 |
| C1 G5 | edge case — pause mid-slide | L3 |
| C2, C3 | SC-002, SC-003 — three excursions end the race | L4 |
| C3 G14 | SC-004 — no timer advances for 30 s | L5 |
| C3 G17 | FR-015 — in-progress lap voided | L6 |
| C5 G22–G24 | SC-005, SC-006 — start again, best survives | L7 |
| C4 | SC-008 — screen reader gets count, loss, game over | L8 |
| C4, R8 | FR-026 — reduced motion suppresses the flash | L9 |
