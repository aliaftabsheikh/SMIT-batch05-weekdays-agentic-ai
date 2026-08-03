# Phase 1 Data Model: Three-Level Progression

**Feature**: `004-three-level-progression` | **Date**: 2026-07-31

All mutable simulation state lives on the single `game` object (`constitution.md:164`). Everything
below is either a field on `game`, a `const` in section 1, or a derived cache that already exists.

---

## 1. Track definitions (constants, section 1)

`TRACK` becomes `TRACKS` — a frozen-by-convention array of three definitions. `HALF_W` and
`CP_INDICES` are **deleted**; both are now per-track.

```js
const LAPS_PER_LEVEL = 3;

const TRACKS = [
  { name: 'Meadow Loop',  width: 82, checkpoints: [3, 6, 9, 12],   path: [ /* 14 points */ ] },
  { name: 'Mill Creek',   width: 72, checkpoints: [3, 6, 9, 12],   path: [ /* 14 points */ ] },
  { name: 'Quarry Ridge', width: 62, checkpoints: [6, 10, 13, 17], path: [ /* 19 points */ ] },
];
```

| Field | Type | Meaning | Validation (enforced by `tracks-check.mjs`) |
|---|---|---|---|
| `name` | string | Shown on the level-cleared and victory panels (FR-025, FR-036) | non-empty |
| `width` | number | Corridor width in world px; `isOnTrack` ⇔ distance to path ≤ `width/2` | 62–82; corridor must exceed the car |
| `path` | `{x,y}[]` | Closed centerline. `path[0]` is start/finish; `path[0]→path[1]` is the racing direction | ≥ 14 points; every point ≥ `width/2 + 8` from all four world edges (C4); no two points far apart along the loop closer than `width` in the plane (C5); no corner < 70° (C7) |
| `checkpoints` | `number[]` | Indices into `path` that must be crossed in order | exactly 4 (C6); smallest gap ≥ 12% of the lap (C6); interior angle ≥ 85° at each (C1); gate must span the corridor (C2) |

**Measured properties of the three tracks** (from `tracks-check.mjs`, all constraints passing):

| Level | Name | Width | Vertices | Corners < 120° | Tightest | Lap | Corridor ÷ car |
|---|---|---|---|---|---|---|---|
| 1 | Meadow Loop | 82 | 14 | 6 | 77.6° | 2072 px | 2.41 |
| 2 | Mill Creek | 72 | 14 | 8 | 75.4° | 2158 px | 2.12 |
| 3 | Quarry Ridge | 62 | 19 | 12 | 78.9° | 2395 px | 1.82 |

### Derived accessors (Helpers section, pure)

```js
function track() { return TRACKS[game.level]; }
function halfW() { return track().width / 2; }
```

Neither mutates. Both are safe to call from `update()` and from `render()`.

---

## 2. New and changed fields on `game`

| Field | Type | Lifetime | Initial | Meaning |
|---|---|---|---|---|
| `level` | 0 \| 1 \| 2 | **run** | `0` | Index of the track being played. **The single source of truth for which track is active** — every geometric fact derives from it. Displayed as `level + 1`. |
| `runLaps` | integer ≥ 0 | **run** | `0` | Valid laps completed across the whole run. Monotonic within a run. Reported by the game-over and victory panels (FR-017) and used as the render-side memo key for the lap toast (R5). |
| `bests` | `(number \| null)[3]` | **session** | `[null,null,null]` | Best valid lap per level, in seconds. `bests[level]` is what `BEST` shows. A slot is only ever replaced by a **faster** time on that same level. |
| `lapsDone` | integer 0–3 | **level** ⟵ *changed* | `0` | Was "laps completed this race"; now **laps completed on the current level**. Reaching `LAPS_PER_LEVEL` clears the level. |
| `lives` | integer 0–3 | **level** ⟵ *changed* | `3` | Unchanged in meaning; its reset moves from `resetRace()` to `resetLevel()`. That move is the entire "refill each level" rule (FR-009, FR-027). |
| `raceTime` | seconds ≥ 0 | **run** ⟵ *clarified* | `0` | Now explicitly spans all three levels (FR-029). Not reset at a level change. |
| `best` | — | — | — | **Removed.** Superseded by `bests`. |
| `state` | string | page | `'title'` | Gains `'levelup'` and `'finished'`. |

Unchanged: `car`, `dust`, `offTrack`, `started`, `lifeFlash`, `lap`, `nextCp`, `lapTime`,
`lastLap`, `prev`, `countdown`, `goFlash`.

---

## 3. Reset scopes — four lifetimes

The rule from features 002/003 holds: **an operation clears its own lifetime and narrower, never
wider.** Levels insert a new scope between car and run.

```
placeCarAtGrid()  ⊂  resetLevel()  ⊂  resetRace()  ⊂  resetSession()
      car               level            run             session
```

| Function | Clears | Callers |
|---|---|---|
| `placeCarAtGrid()` | `car`, `prev`, `dust`, `offTrack` | `resetLevel()`, the non-finite recovery guard |
| `resetLevel()` | + `started`, `lives`, `lifeFlash`, `lap`, `lapsDone`, `nextCp`, `lapTime`, `lastLap` | `enterLevel()` only |
| `resetRace()` | + `raceTime`, `runLaps`, then `enterLevel(0)` | `restart()`, `resetSession()` |
| `resetSession()` | + `bests` | `init()` only — a page load |

### `enterLevel(i)` — the only way the active track changes

```js
function enterLevel(i) {
  game.level = i;
  buildStart();      // start.dir / start.a / start.b for THIS track
  buildGates();      // CP_GATES for THIS track
  resetLevel();      // places the car — reads start.dir, so it must come last
}
```

**The ordering is load-bearing.** `placeCarAtGrid()` positions and orients the car from
`start.dir`; running it before `buildStart()` would spawn the car using the previous level's racing
direction. Rebuilding the gates before the car is placed also means `game.prev` is set on the new
track, so no spurious line crossing can fire on the level's first step.

**What `enterLevel()` deliberately does not clear**: `raceTime`, `runLaps` and `bests`. Those are
run- and session-lifetime; a level change is narrower than both.

---

## 4. State machine

```
                    ┌──────── R ────────┐
                    │                   │
  title ──Enter──► countdown ──0s──► racing ──P/Esc──► paused ──Enter/P──► racing
                       ▲                 │
                       │                 ├── lives → 0 ─────► gameover ──Enter──┐
                       │                 │                                      │
                       │                 ├── lapsDone = 3, level < 2 ─► levelup ─┼─Enter─► (next level)
                       │                 │                                      │
                       │                 └── lapsDone = 3, level = 2 ─► finished ┘
                       │                                                         │
                       └──────────── resetRace() / enterLevel(n+1) ───────────────┘
```

| State | Car | Timers | Pause | Enter |
|---|---|---|---|---|
| `title` | frozen | stopped | — | `startCountdown()` |
| `countdown` | frozen | stopped | — | — |
| `racing` | live | running | → `paused` | — |
| `paused` | frozen | stopped | → `racing` | `resume()` |
| `gameover` | frozen | stopped | inert | `restart()` → level 1 |
| **`levelup`** | frozen | stopped | inert | `enterLevel(level+1); startCountdown()` |
| **`finished`** | frozen | stopped | inert | `restart()` → level 1 |

**Both new rows are free.** `stepGame()` (`game.js:697`) returns for any state that is not
`racing`, and `togglePause()` (`:245`) acts only on `racing`/`paused`. FR-011 and FR-015 are
satisfied by the existing state machine with no new code.

### Transition precedence

Only one transition can fire per step, and the ordering inside `update()` decides which:

1. `loseLife()` runs **before** `updateLap()` and returns early from `update()` when it ends the
   race (`game.js:330`, feature 003 R3).
2. Therefore **losing the last life on the third lap of a level is `gameover`, not `levelup`** —
   `updateLap()` never runs on that step, so the lap cannot complete. Structural, not a special case.

---

## 5. Derived caches (existing, unchanged in kind)

| Cache | Rebuilt by | Depends on |
|---|---|---|
| `start` (`{dir, a, b}`) | `buildStart()` | `track().path[0]`, `[1]`, `halfW()` |
| `CP_GATES` (4 segments) | `buildGates()` | `track().path`, `track().checkpoints`, `halfW()` |

Both are `const` bindings whose contents are replaced in place. Both are now rebuilt on **every
level change** rather than once at boot. **A stale cache here is this feature's most dangerous
failure mode** — lap validation silently testing the previous level's gates against the new level's
track — which is why `enterLevel()` is the single, ordered path and why `levels-check.mjs` carries
a dedicated negative control for it.

---

## 6. Render-only state (module scope, never on `game`)

Per `constitution.md:66-68`, render caches are module-level and must not live on `game`.

| Variable | Purpose |
|---|---|
| `lastCountLabel` | existing — countdown label edge |
| `lastLivesAnnounced` | existing — life-lost edge |
| `lastStateAnnounced` | existing — game-over edge; now also `levelup` / `finished` |
| **`lastRunLapsAnnounced`** | new — lap-completed edge, keyed on `game.runLaps` |

`runLaps` is the correct key because it is monotonic across a run; `lapsDone` resets at each level
and would re-announce lap 1 three times.

---

## 7. Validation rules

| Rule | Where enforced |
|---|---|
| A lap counts only if all of `track().checkpoints` were crossed in order, in the racing direction | `updateLap()` — unchanged logic, per-track data |
| `lapsDone` never exceeds `LAPS_PER_LEVEL` | the level ends on the step it reaches it |
| `level` never exceeds `TRACKS.length - 1` | `completeLap()` chooses `finished` at the last level |
| `bests[i]` only decreases | `best === null \|\| lapTime < best` — the existing strict-improvement guard, re-pointed |
| `lives` never below 0 | `loseLife()` — unchanged |
| `runLaps` monotonic within a run | only `completeLap()` increments it; only `resetRace()` clears it |
| Nothing is persisted | no storage API is used anywhere |
