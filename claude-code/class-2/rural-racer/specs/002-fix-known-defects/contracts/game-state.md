# Contract: Game State, Reset Scopes and Interface

**Feature**: `002-fix-known-defects` | **Date**: 2026-07-27
**Covers**: FR-008 … FR-027 (User Stories 2–6)

See [lap-validation.md](./lap-validation.md) for why these are prose contracts rather than an
OpenAPI schema.

---

## C5. State machine

```
        Enter                countdown ≤ 0
title ─────────→ countdown ──────────────→ racing
                     ↑                     ↕  P / Esc / blur / tab hidden
                     │                   paused
                     │                     │  Enter / P / Esc
                     └───── R ─────────────┘
                        (restart)
```

**Guarantees**

| Rule | Requirement |
|---|---|
| `update()` runs **only** in `racing`; all timers therefore stop in every other state | FR-015 |
| `blur` and `visibilitychange` clear held keys and pause a running race | Principle VI |
| `R` performs exactly one restart however long it is held | FR-019 |
| `R` has no effect in `title` | FR-020 |
| `Enter` starts from `title` and resumes from `paused`; it is inert while `racing` | — |

**Input handling contract**

```
on keydown:
    if code ∈ LIFECYCLE_KEYS:          // Enter, KeyP, Escape, KeyR
        preventDefault()
        if event.repeat: return        // ← the fix for FR-019
        dispatch(code)
        return
    if code ∈ ALL_GAME_KEYS:
        preventDefault()               // repeat events still suppressed for scrolling
        keys.add(code)
        if state === 'racing': markStarted()
```

- Movement keys deliberately **do not** filter `repeat`: adding to a set is idempotent, and
  `preventDefault()` must keep firing to stop the page scrolling.
- Everything keys off `event.code`, never `event.key` (Principle VI).
- `event.repeat` is read on the input edge, outside `update()`, so it introduces no wall-clock
  dependency into the simulation (Principle III).

---

## C6. Reset scopes

Three functions, three lifetimes. **An operation may clear its own lifetime and narrower,
never wider.**

| Function | Clears | Preserves | Callers |
|---|---|---|---|
| `placeCarAtGrid()` | car `x`,`y`,`heading`,`speed`; `prev`; `dust`; `offTrack` | everything else | the two below, and recovery |
| `resetRace()` | the above **plus** `lap`, `lapsDone`, `nextCp`, `raceTime`, `lapTime`, `lastLap`, `started` | `best` | `restart()` |
| `resetSession()` | the above **plus** `best` | — | `init()` only |

**Guarantees**

- **G6** — `restart()` calls `resetRace()`, never `resetSession()`. `best` survives (FR-008).
- **G7** — `resetRace()` clears lap count, lap time, total race time and gate progress
  (FR-009).
- **G8** — the non-finite recovery guard calls `placeCarAtGrid()` and additionally sets
  `lapTime = 0`, `nextCp = 0`. It MUST NOT touch `lapsDone`, `raceTime` or `best` (FR-011).
- **G9** — `placeCarAtGrid()` sets `prev` to the car's new position. A stale `prev` would
  describe a movement segment spanning the track and could fire spurious crossings.
- **G10** — no function writes to `localStorage`, `sessionStorage`, cookies, or the network
  (FR-012, Additional Constraints).

**Recovery trigger**: `!Number.isFinite(car.x) || !Number.isFinite(car.y)`. Unchanged; only its
consequence narrows.

---

## C7. World-boundary response

Evaluated after position integration, inside the fixed step.

```
m = CAR.W                                   // 34 px, verified to sit outside the corridor
if x < m        : x = m;            heading = π − heading;  speed *= WALL_RESTITUTION
if x > W − m    : x = W − m;        heading = π − heading;  speed *= WALL_RESTITUTION
if y < m        : y = m;            heading = −heading;     speed *= WALL_RESTITUTION
if y > H − m    : y = H − m;        heading = −heading;     speed *= WALL_RESTITUTION
heading = wrapAngle(heading)
```

**Guarantees**

- **G11** — the car never leaves the world (FR-018).
- **G12** — after contact, `heading` points away from the boundary, so the next throttle input
  drives the car clear. Normal control within 2 s (FR-017, SC-005).
- **G13** — `speed` is scaled, never zeroed, so a fast impact leaves steerable momentum
  (US4 acceptance 2).
- **G14** — `WALL_RESTITUTION` lives in the section 1 constants block (Principle IV).
- **G15** — a corner impact reflects on both axes in the same step; the result stays finite and
  wrapped.

---

## C8. HUD contract

| Element | id | Source | Format | Reserved width |
|---|---|---|---|---|
| Lap | `lap` | `game.lap` | integer | 3ch |
| Lap time | `time` | `game.lapTime` | `m:ss.cc` | 7ch |
| Best lap | `best` | `game.best` | `m:ss.cc` or `--:--` | 7ch |
| **Total** | `race` | `game.raceTime` | `m:ss.cc` | 7ch |
| Speed | `speed` | `\|car.speed\|` rounded | integer | 3ch |

**Guarantees**

- **G16** — `TOTAL` is present throughout a race (FR-013), advances across lap boundaries
  (FR-014) and freezes while paused (FR-015, inherited from C5).
- **G17** — every readout uses tabular figures and a reserved width, so changing digits never
  reflow the layout (FR-016).
- **G18** — the HUD is DOM, never canvas text (Principle V).
- **G19** — `updateHud()` only reads state; it makes no mutation (Principle II).

---

## C9. Accessibility contract

| Element | Before | After | Requirement |
|---|---|---|---|
| `.hud` | `aria-hidden="true"` | named group, queryable on demand | FR-021 |
| `#toast` | `aria-hidden="true"` | polite live region (`role="status"`) | FR-022 |
| `#hint` | `aria-hidden="true"` | exposed static text | FR-023 |
| all overlays | `pointer-events: none` | unchanged | FR-024 |

**Guarantees**

- **G20** — lap, lap time, best and total are all reachable by assistive technology while
  racing (FR-021).
- **G21** — lap completion announces once per valid lap, including whether it set a record
  (FR-022). The HUD is deliberately **not** a live region — it changes every frame.
- **G22** — clicks still reach the canvas through every overlay (FR-024).
- **G23** — reduced-motion handling in both `game.js` and `styles.css` is unchanged and still
  honoured (FR-025).

---

## C10. Presentation contract

| Item | Rule | Requirement |
|---|---|---|
| Shadow | offset applied **before** `ctx.rotate(heading)`, so it is world-space | FR-026 |
| Pointer | `cursor: none` on the canvas while `state === 'racing'`, restored otherwise | FR-027 |

**Guarantees**

- **G24** — shadow direction is invariant under car heading; an observer cannot infer heading
  from the shadow (SC-008).
- **G25** — the pointer class is toggled from `updateScreens()`, the existing single
  render-side DOM writer — no new listener and no new state (Principle II).

---

## Verification hooks

| Contract | Success criterion | Quickstart step |
|---|---|---|
| C6 G6 | SC-003 — best survives restart | Q4 |
| C6 G8 | FR-011 — recovery preserves earned state | Q5 |
| C8 G16 | SC-004 — total visible, excludes pause | Q6 |
| C7 G12 | SC-005 — 2 s boundary recovery | Q7 |
| C5 | SC-006 — held `R` yields one countdown | Q8 |
| C9 | SC-007 — screen-reader access and announcement | Q9 |
| C10 | SC-008, SC-009 — shadow and pointer | Q11 |
