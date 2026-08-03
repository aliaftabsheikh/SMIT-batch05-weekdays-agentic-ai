# Phase 1 Data Model: Fix Known Defects

**Feature**: `002-fix-known-defects` | **Date**: 2026-07-27

The game has no database, no schema and no persistence. "Data model" here means the in-memory
state on the single `game` object, who is allowed to clear each field, and how each field
transitions. Getting the *ownership* column right is the entire content of User Story 2 — the
defect was that one function cleared fields belonging to three different lifetimes.

---

## Lifetimes

Every piece of mutable state belongs to exactly one of four lifetimes.

| Lifetime | Begins | Ends | Cleared by |
|---|---|---|---|
| **Page** | page load | page close / reload | `resetSession()` (once, at init) |
| **Race** | countdown start | restart | `resetRace()` |
| **Lap** | lap start | valid lap completion, restart, or recovery | `completeLap()`, `resetRace()`, recovery |
| **Frame** | each step | each step | recomputed every step |

**The rule this feature enforces**: an operation may clear state at its own lifetime and
narrower, never wider. Restart is a Race operation, so it must not touch Page state (`best`).
Recovery is a Lap operation, so it must not touch Race state (`lapsDone`, `raceTime`).

---

## Entities

### Session Record — *Page lifetime*

| Field | Type | Initial | Meaning |
|---|---|---|---|
| `best` | number \| null | `null` | Fastest valid lap time this visit, in seconds |

**Rules**

- Set only in `completeLap()`, and only when `lapTime < best` **strictly** — a tied time does
  not set a record (spec assumption; FR-010).
- MUST survive `restart()` (FR-008) and MUST survive recovery (FR-011).
- MUST NOT be written to storage; it is discarded on reload (FR-012).
- `null` renders as the `--:--` placeholder.

**Transitions**: `null → t` on first valid lap · `t → t'` when `t' < t` · `t → t` otherwise ·
`t → null` **only** on page load.

---

### Race Session — *Race lifetime*

| Field | Type | Initial | Meaning |
|---|---|---|---|
| `lap` | integer | `1` | Lap currently being driven (display) |
| `lapsDone` | integer | `0` | Valid laps completed this race |
| `raceTime` | number | `0` | Total elapsed racing seconds, excluding paused time |
| `lastLap` | number \| null | `null` | Time of the most recently completed lap |
| `started` | boolean | `false` | Has the player given a driving input yet (hint fade) |

**Rules**

- `raceTime` accumulates from the fixed `dt` at the top of `update()`, which is called only in
  the `racing` state — so FR-015 (frozen while paused) is a property of the loop, not a
  special case.
- `raceTime` MUST NOT reset at lap boundaries (FR-014); only `resetRace()` clears it.
- `lap` is derived: `lapsDone + 1`. It is stored rather than computed only to keep `updateHud`
  a straight read; the two MUST be updated together in `completeLap()`.
- **New in this feature**: `raceTime` gains a display (FR-013). It was previously accumulated
  and never read.

---

### Lap Progress — *Lap lifetime*

| Field | Type | Initial | Meaning |
|---|---|---|---|
| `lapTime` | number | `0` | Elapsed seconds in the current lap |
| `nextCp` | integer | `0` | Index into `CP_INDICES` of the next required gate |

**Rules**

- `nextCp` advances by exactly one, and only when the *next expected* gate is crossed while
  on-track. No other gate is tested, so gates cannot be taken out of order (FR-004) and
  re-crossing a cleared gate is inert.
- Both are cleared by `completeLap()`, by `resetRace()`, and by recovery.
- `nextCp === CP_INDICES.length` is the precondition for a finish-line crossing to count.

---

### Car — *Race lifetime, repositionable independently*

| Field | Type | Initial | Meaning |
|---|---|---|---|
| `x`, `y` | number | grid position | World position in 900×600 space |
| `heading` | number | racing direction | Facing angle, wrapped to `[0, 2π)` |
| `speed` | number | `0` | Signed scalar along `heading`, clamped to `[−120, 300]` |
| `prev.x`, `prev.y` | number | grid position | Position at the previous step |

**Rules**

- `prev` MUST be updated once per step, at the end of `updateLap()`, and is the basis of every
  crossing test. Both the finish line and — **new in this feature** — the checkpoint gates test
  the segment `prev → (x, y)`, which is what makes crossings immune to tunnelling at speed.
- `placeCarAtGrid()` MUST set `prev` to the new position, never leave it stale; a stale `prev`
  would describe a movement segment spanning the whole track and could trigger spurious
  crossings.
- All four fields MUST remain finite. The recovery path repositions the car and clears Lap
  state, and nothing wider (FR-011).
- **Changed in this feature**: the world-boundary response reflects `heading` and scales
  `speed` by `WALL_RESTITUTION` instead of setting `speed = 0`.

---

### Checkpoint Gate — *derived, immutable*

Not stored on `game`. Computed once at initialisation from `TRACK.path`, cached, and read by
both the update and render paths.

| Field | Type | Meaning |
|---|---|---|
| `a` | point | Inner endpoint — on the inside of the turn, at `HALF_W / sin(θ/2)` from the vertex |
| `b` | point | Outer endpoint — on the outside of the turn, at `HALF_W` from the vertex |

**Rules**

- Derived solely from `TRACK.path` and `TRACK.width`; MUST NOT be authored as data
  (Principle IV).
- The same cached segment MUST be used by the crossing test and by rendering (FR-003). This is
  the single change that closes the defect class.
- Spans exactly the on-track corridor cross-section at the vertex, so no on-track path can
  pass the corner without crossing it (FR-002).
- Falls back to the perpendicular of `tangentAt(i)` with half-length `HALF_W` when the vertex
  is degenerate (near-straight, `|û + ŵ| < ε`).
- **Replaces** `CP_RADIUS`, which is deleted.

---

### Lap Record — *transient*

Produced by `completeLap()` and consumed immediately by the toast; not retained as state
beyond `lastLap`.

| Field | Source | Meaning |
|---|---|---|
| time | `lapTime` at completion | The lap's elapsed seconds |
| lap number | `lapsDone` after increment | Which lap this was |
| is best | `lapTime < best` before update | Drives the "NEW BEST!" treatment |

**New in this feature**: the toast becomes a polite live region, so producing a Lap Record also
announces it to assistive technology (FR-022).

---

## Reset scopes — the core change of User Story 2

```
resetSession()          ← init() only
  └── resetRace()       ← restart()
        └── placeCarAtGrid()   ← recovery guard (plus lapTime, nextCp)

placeCarAtGrid()  clears: car x/y/heading/speed, prev, dust, offTrack
resetRace()       adds:   lap, lapsDone, raceTime, lapTime, lastLap, started, nextCp
resetSession()    adds:   best
```

| Caller | Function | Clears `best`? | Clears `lapsDone` / `raceTime`? |
|---|---|---|---|
| `init()` | `resetSession()` | yes | yes |
| `restart()` (key `R`) | `resetRace()` | **no** (FR-008) | yes (FR-009) |
| non-finite recovery | `placeCarAtGrid()` + `lapTime = 0`, `nextCp = 0` | **no** (FR-011) | **no** (FR-011) |

The previous single `reset()` sat at the widest scope and was called from all three, which is
precisely why pressing restart erased the record and why one bad frame erased the race.

---

## Invariants

1. `0 ≤ nextCp ≤ CP_INDICES.length` at all times.
2. `lap === lapsDone + 1` after every `completeLap()` and every reset.
3. `best === null` or `best ≤ lastLap` for every lap completed since `best` was set.
4. `raceTime ≥ lapTime` throughout a race — the total can never trail the current lap.
5. `prev` is exactly the previous step's `(x, y)`, or equal to `(x, y)` immediately after a
   reposition.
6. `x`, `y`, `heading`, `speed` are finite; violation triggers recovery, not a wider reset.
7. Cached gate segments are a pure function of `TRACK`; changing `TRACK.path` and reloading is
   sufficient to move them, with no other edit.
