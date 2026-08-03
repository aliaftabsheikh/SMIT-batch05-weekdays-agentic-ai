# Contract: Level Progression

**Feature**: `004-three-level-progression` | **Date**: 2026-07-31

This project has no network API, so "contract" means the **observable behavioural guarantees** the
implementation must satisfy. Each is stated so it can be checked by `levels-check.mjs` driving the
real `game.js`, or by a human following [quickstart.md](../quickstart.md).

Notation: `L` = `game.level` (0-based), `N` = `TRACKS.length` = 3, `K` = `LAPS_PER_LEVEL` = 3.

---

## C-1 · Clearing a level

**Given** `state = 'racing'` and `lapsDone = K - 1`
**When** a valid lap completes
**Then**

| | |
|---|---|
| `lapsDone` | `K` |
| `runLaps` | incremented |
| `state` | `'levelup'` if `L < N-1`, else `'finished'` |
| `level` | **unchanged** — advancing is the player's action, not the lap's |
| `car`, `raceTime`, `lapTime` | unchanged on this step |

*Satisfies FR-003, FR-005, FR-012. Verified by `levels-check.mjs` L-A.*

---

## C-2 · Advancing

**Given** `state = 'levelup'` with level `L`
**When** `onEnter()` is called
**Then**

| | |
|---|---|
| `level` | `L + 1` |
| `state` | `'countdown'` |
| `lives` | `LIVES_START` (3) — **regardless of the value it had** |
| `lapsDone`, `nextCp`, `lapTime` | `0` |
| `lap` | `1` |
| `started` | `false` |
| `raceTime`, `runLaps` | **unchanged** — run lifetime, not level lifetime |
| `bests` | **unchanged** — session lifetime |
| `start`, `CP_GATES` | rebuilt for `TRACKS[L+1]` |
| car position | on `TRACKS[L+1]`'s starting grid, `isOnTrack` true |
| `offTrack` | `false` |

*Satisfies FR-006 – FR-010, FR-027, FR-029. Verified by `levels-check.mjs` L-B, L-C.*

---

## C-3 · No cross-track carry-over — **the dangerous one**

**Given** the player has advanced from level `L` to level `L+1`
**Then** for every geometric question the game asks:

| Question | Answered by |
|---|---|
| Is the car on the track? | `TRACKS[L+1].path` and `TRACKS[L+1].width` |
| Has a checkpoint been crossed? | `CP_GATES` built from `TRACKS[L+1]` |
| Has the start line been crossed? | `start` built from `TRACKS[L+1]` |
| What is drawn? | `TRACKS[L+1].path` |

**No value derived from `TRACKS[L]` may survive the transition.**

This is the failure mode that would be least visible in play — a lap silently refusing to validate
because the previous level's gates are still loaded. It requires a **negative control**: assert not
only that level 2 validates correctly, but that a point which is on-track on level 1 and off-track
on level 2 reports `false` after the transition.

*Satisfies FR-010. Verified by `levels-check.mjs` L-D (positive) and L-E (negative control).*

---

## C-4 · Winning

**Given** `state = 'racing'`, `level = N-1`, `lapsDone = K-1`
**When** a valid lap completes
**Then** `state = 'finished'`, and **no level `N` is entered**.

**Given** `state = 'finished'`
**Then** the victory panel reports `raceTime` (whole run) and all three of `bests`.
**When** `onEnter()` is called → `restart()`: `level = 0`, `raceTime = 0`, `runLaps = 0`,
`lives = 3`, `bests` **preserved**.

*Satisfies FR-012 – FR-016, FR-035. Verified by `levels-check.mjs` L-F, L-G.*

---

## C-5 · Frozen states

For `state ∈ { 'levelup', 'finished', 'gameover' }`, over any number of `stepGame()` calls with any
keys held:

- `car.x`, `car.y`, `car.speed`, `car.heading` unchanged
- `lapTime` and `raceTime` unchanged
- `togglePause()` leaves `state` unchanged

*Satisfies FR-011, FR-015. Verified by `levels-check.mjs` L-H.*

---

## C-6 · Precedence — last life on the last lap

**Given** `lives = 1` and `lapsDone = K-1`
**When** in a single step the car leaves the track **and** its movement segment crosses the finish
line having cleared every checkpoint
**Then** `state = 'gameover'`, `lapsDone` unchanged, `runLaps` unchanged. **Not `levelup`, and not
a completed lap.**

Structural, not a special case: `update()` returns early when `loseLife()` ends the race, so
`updateLap()` does not run on that step.

**This assertion requires a positive control.** Feature 003 learned this the hard way — the
equivalent check passed vacuously for weeks because its setup could never have completed a lap in
the first place. The same crossing must be shown to *succeed* when lives remain.

*Satisfies FR-017 and the spec's first edge case. Verified by `levels-check.mjs` L-I (control) and
L-J (real case).*

---

## C-7 · Per-level bests

| Given | Then |
|---|---|
| a valid lap of time `t` completes on level `L` | `bests[L] = min(bests[L] ?? ∞, t)`; `bests[j≠L]` untouched |
| the HUD is read on level `L` | `BEST` shows `bests[L]`, or the placeholder if `null` |
| `restart()` is called | `bests` unchanged in all three slots |
| the page is reloaded | `bests = [null, null, null]` |

*Satisfies FR-033 – FR-035. Verified by `levels-check.mjs` L-K.*

---

## C-8 · Update/render separation

Static, checkable by grep over the `update()` call graph:

- No `document.`, `setText`, `toggleHidden`, `showToast` or `ctx.` reachable from `update()`.
- **This includes `completeLap()`, which currently violates it.** After this feature the count of
  Principle II exceptions in `game.js` is **zero**.
- `render()` and everything it calls mutate no field on `game` or `game.car`. The four render memos
  (`lastCountLabel`, `lastLivesAnnounced`, `lastStateAnnounced`, `lastRunLapsAnnounced`) are
  module-level, never on `game`.

*Satisfies constitution Principle II. Verified by static audit.*

---

## C-9 · Announcement precedence

The toast is a single slot. At most one announcement per render, in this order:

```
finished  →  levelup  →  gameover  →  lap completed  →  life lost
```

On the third lap of a level both "lap completed" and "level cleared" are true; the level event wins.

*Satisfies FR-036, FR-038. Verified by `levels-check.mjs` L-L.*

---

## C-10 · Track admissibility

Every entry in `TRACKS` satisfies, and `tracks-check.mjs` asserts:

| | Constraint |
|---|---|
| C1 | every checkpoint vertex has interior angle ≥ 85° |
| C2 | every checkpoint gate spans the full corridor at its vertex |
| C3 | the spawn point is on-track with the car's half-length of margin |
| C4 | every vertex ≥ `width/2 + 8` from all four world edges; every gate drawn inside the play area |
| C5 | points > 18% of the lap apart stay > `width` apart in the plane |
| C6 | exactly 4 checkpoints, smallest gap ≥ 12% of the lap |
| C7 | no corner tighter than 70° |

**Level 1 is the control** — it is the shipped circuit, so a constraint it fails is a wrong
constraint, not a wrong track.

*Satisfies FR-018 – FR-024. Currently 51 assertions, ALL PASSED.*

**FR-020 is the exception.** "Each level is harder than the last" is *supported* by two monotonic
measures — corridor ÷ car 2.41 → 2.12 → 1.82, and corners under 120° 6 → 8 → 12 — but the single
tightest corner is **not** monotonic (77.6° → 75.4° → 78.9°) and no claim is made that it is.
FR-020 is closed only by SC-008, which requires a human across repeated trials. It MUST NOT be
reported as passing on the strength of a narrower corridor.
