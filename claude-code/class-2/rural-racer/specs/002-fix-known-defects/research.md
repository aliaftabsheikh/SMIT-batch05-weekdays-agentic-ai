# Phase 0 Research: Fix Known Defects

**Feature**: `002-fix-known-defects` | **Date**: 2026-07-27

The spec carried zero `NEEDS CLARIFICATION` markers, so this phase had one real open question
— what shape a checkpoint gate should be — plus seven implementation choices with tradeoffs
worth recording. There are no dependencies or integrations to research; the project has none.

---

## R1. Checkpoint gate geometry (FR-002, FR-003 — US1)

### The finding that changed the fix

The code review recommended: *"test gate crossing with `segIntersect` against the same segment
`drawCheckpoints` renders."* That recommendation is half right — crossing beats proximity —
but **the segment currently rendered is itself too short, and adopting it verbatim would turn
one broken checkpoint into four.**

`drawCheckpoints` (`game.js:411`) draws each gate from `p ± perp · HALF_W`, i.e. 41 px either
side of the vertex. That is the correct half-width on a *straight*, but a checkpoint sits at a
*corner*, where the on-track corridor is wider on the inside of the turn.

At a vertex `V` with interior angle θ between the two adjoining segments, the track is the
union of two round-joined capsules of half-width `HALF_W`. Measured along the angle bisector:

- **Inside of the turn** — the two inner edge offsets meet at distance `HALF_W / sin(θ/2)`
  from `V`. This exceeds `HALF_W` for every θ < 180°.
- **Outside of the turn** — the round join is a disc of radius `HALF_W` centred on `V`, so the
  boundary is at exactly `HALF_W`.

Evaluated for the four checkpoint vertices (`CP_INDICES = [3, 6, 9, 12]`, `HALF_W = 41`):

| Vertex | Corner | θ | Inner reach `HALF_W/sin(θ/2)` | Drawn reach | Tested radius |
|---|---|---:|---:|---:|---:|
| 3 | right side | 105.6° | **51.5** | 41 | 55 |
| 6 | top-right | 132.8° | **44.7** | 41 | 55 |
| 9 | top-left | 154.4° | **42.0** | 41 | 55 |
| 12 | hairpin | 87.0° | **59.6** | 41 | 55 |

Read the last three columns together and the whole defect class is visible at once:

- The **tested circle** (55) covers vertices 3, 6, 9 but not 12 → the one reported bug.
- The **drawn segment** (41) covers *none* of the four → adopting it as the test would break
  all four.
- Neither shape is the corridor.

### Decision

Define the gate as the **exact corridor cross-section at the vertex, measured along the angle
bisector**, and derive it once in a helper consumed by both the update and render paths:

```
u   = unit vector V → path[i-1]
w   = unit vector V → path[i+1]
b   = normalize(u + w)              // bisector, points into the inside of the turn
θ   = angle between u and w         // |u + w| = 2·cos(θ/2)
inner = V + b · (HALF_W / sin(θ/2))
outer = V − b · HALF_W
gate  = segment(inner, outer)
```

A checkpoint registers when the car's movement segment (`game.prev` → current position)
intersects `gate` **and** the car is on the track surface — reusing the existing
`segIntersect()` and `isOnTrack()`, exactly as the start/finish line already works.

**Rationale**:

- **It is exact, not padded.** The segment's endpoints land precisely on the two corridor
  boundaries. Any continuous on-track path around the corner must cross the bisector inside
  the corridor, therefore must cross the gate. No legal line can miss it (SC-001), and a path
  that crosses outside the corridor is off-track and rejected by the existing guard (FR-006).
- **It is one definition.** Drawing and testing consume the same helper, so the two cannot
  drift apart again. This satisfies FR-003 literally and is Constitution Principle IV applied
  to the exact code that violated it.
- **It survives track edits.** Move a checkpoint to a tighter corner and the gate resizes
  itself. A tuned radius would silently re-break.
- **It reuses proven machinery.** `segIntersect` already guards the finish line against
  tunnelling at speed; checkpoints inherit that for free.

**Alternatives considered**:

| Alternative | Rejected because |
|---|---|
| Raise `CP_RADIUS` to 60 | Fixes only the hairpin, and only until the track changes. A circle still cannot match a gate, so drawn ≠ tested persists and FR-003 fails. |
| Raise `CP_RADIUS` to `max(HALF_W/sin(θ/2))` per vertex | Better, but a disc at a corner spills across both the entry and exit corridors, so a car can clip a checkpoint it has not driven through. Still leaves drawn ≠ tested. |
| Use the drawn segment as-is (the review's suggestion) | Under-spans the corridor at all four corners; would newly reject legal inside lines at vertices 3, 6 and 9. |
| Symmetric segment of half-length `HALF_W/sin(θ/2)` | Spans the corridor, and drawn = tested, but overshoots the outer boundary by up to 18.6 px at the hairpin, drawing a gate that visibly pokes into the grass. The asymmetric form costs one extra line and is geometrically exact. |
| Perpendicular to `tangentAt(i)` rather than the bisector | `tangentAt` is a central difference over neighbours, which only approximates the bisector normal on asymmetric corners. The bisector is exact by construction. |
| Store gates as data in `TRACK` | Duplicates what the path already determines — the defect this feature exists to remove. |

**Degenerate case**: at a perfectly straight vertex (θ = 180°) `u + w` is the zero vector and
`b` is undefined. None of the four current checkpoints is near this (`|u + w| = 2cos(θ/2)`
evaluates to 1.209, 0.800, 0.443 and 1.450), but the helper MUST fall back to the perpendicular
of `tangentAt(i)` with half-length `HALF_W` when `|u + w|` falls below a small epsilon, so that
moving a checkpoint onto a straight cannot produce `NaN` geometry.

**Cost**: `gateAt(i)` depends only on `TRACK`, so all four gates are computed once during
`buildStart()`-time initialisation and cached. Per step the test becomes one `segIntersect`
against one cached segment, replacing one `Math.hypot` — no measurable frame cost.

📋 **This decision meets the ADR significance test** (long-term impact on how laps are
validated; several viable alternatives; cross-cutting across physics, rendering and track
authoring). Suggested: `/sp.adr checkpoint-gate-crossing-validation`.

---

## R2. Splitting `reset()` (FR-008…FR-011 — US2)

**Decision**: replace the single `reset()` with three functions of increasing scope.

| Function | Clears | Called by |
|---|---|---|
| `placeCarAtGrid()` | car position, heading, speed, `prev`, dust, `offTrack` | the other two, and the non-finite guard |
| `resetRace()` | `placeCarAtGrid()` + `lap`, `lapsDone`, `nextCp`, `raceTime`, `lapTime`, `lastLap`, `started` | `restart()` |
| `resetSession()` | `resetRace()` + `best` | `init()` only |

The non-finite guard additionally clears `nextCp` and `lapTime`, discarding the in-progress lap
whose geometry is suspect, but leaves `lapsDone`, `best` and `raceTime` standing (FR-011, and
the spec's recovery assumption).

**Rationale**: the defect is scope, not logic — one function served three callers with three
different intents, so the widest blast radius applied to all of them. Naming each scope makes
the intent checkable at the call site.

**Alternatives considered**: a boolean parameter (`reset(keepBest)`) — rejected, boolean
parameters at call sites read as `reset(true)` and hide intent; saving and restoring `best`
around the existing `reset()` — rejected, leaves the trap armed for the next caller.

---

## R3. World-edge response (FR-017, FR-018 — US4)

**Decision**: on contact with a world boundary, clamp the position, **reflect `heading` about
the boundary normal**, and scale speed by a restitution constant `WALL_RESTITUTION = 0.35`
placed in the section 1 constants block. Vertical boundaries map `heading → π − heading`;
horizontal boundaries map `heading → −heading`; both are re-wrapped by `wrapAngle()`.

**Rationale**: the trap is a feedback loop, not a friction value — steering authority scales
with speed (`speedFactor`), so zeroing speed at the wall also removes the ability to turn away
from it, and the car re-enters the wall next step. Reflection breaks the loop at its cause:
after the bounce the car's heading already points away from the boundary, so the very next
throttle input drives it clear. It also delivers US4's second acceptance scenario — the car
retains steerable momentum after a fast impact — which damping alone does not.

**Alternatives considered**:

| Alternative | Rejected because |
|---|---|
| `speed *= 0.4` instead of `= 0` | Equilibrium against held throttle is ≈ 9 px/s, giving ≈ 10°/s of turn authority — still about nine seconds to turn away. Fails SC-005. |
| Give stationary cars minimum turn authority | Breaks the documented and deliberate handling property that a stationary car cannot pirouette (Principle IV's "one definition" applies to feel, too). |
| Decompose velocity and cancel only the normal component | The car model stores a scalar `speed` along `heading`; introducing a velocity vector is a physics rewrite far outside this feature's scope. |
| Move the boundary outward so it is unreachable | The reachable grass between the wall (34 px) and the track edge (59 px at the hairpin) is intentional run-off. Removing it changes gameplay. |

**Note**: the boundary margin `m = CAR.W = 34` was verified to sit outside the track corridor
at every extreme (minimum path x and y are both 100, giving a 59 px corridor edge), so
reflection can only ever trigger on grass. It never interferes with racing.

---

## R4. Lifecycle key auto-repeat (FR-019, FR-020 — US4)

**Decision**: collect the lifecycle keys into a set, handle them as one branch at the top of
the keydown handler, `preventDefault()` unconditionally, then `return` early when
`event.repeat` is true. Additionally, `KeyR` returns without effect while `game.state` is
`'title'`.

**Rationale**: `event.repeat` is the platform's own signal and requires no timer or state of
our own. Handling the lifecycle branch as a group also removes the existing triple-return
ladder. Movement keys deliberately keep their repeat events, since they are idempotent set
insertions and must still `preventDefault()` to stop the page scrolling.

**Alternatives considered**: tracking a held-key set and ignoring re-entry — rejected as
redundant state duplicating `event.repeat`; debouncing on a timestamp — rejected, it would put
wall-clock time into the input path for no benefit.

---

## R5. Total race time display (FR-013…FR-016 — US3)

**Decision**: add a fourth HUD panel after `BEST`, labelled `TOTAL`, rendered from the existing
`game.raceTime` via the existing `fmtTime()` and the existing `hud__value--time` class
(7ch reserved width).

**Rationale**: the state, the formatter and the layout affordance all already exist — this is
one markup block and one `setText` call. `raceTime` already accumulates from the fixed `dt`
inside `update()`, so FR-014 (continuous across laps) and FR-015 (frozen while paused) hold
without any new logic, and FR-016 is satisfied by the class already used for the other timers.

**Alternatives considered**: replacing `BEST` with `TOTAL` — rejected, both are wanted;
reordering to `LAP · TIME · TOTAL · BEST` to group the live timers — a defensible layout, but
appending is the smaller diff and the constitution prefers it; drawing the total on the canvas
— forbidden by Principle V.

---

## R6. Shadow direction (FR-026 — US6)

**Decision**: apply the `(+3, +5)` offset as a `translate` **before** `ctx.rotate(car.heading)`
rather than as literal coordinates after it.

**Rationale**: the outer transform has already translated to the car's world position, so a
translate applied before the rotation is a world-space offset and stays fixed as the car turns;
the current code bakes the offset into car-local space, which is why the light appears to orbit
the car. One line moves.

**Alternatives considered**: computing a counter-rotated offset — rejected as arithmetic that
restates what the transform stack already does.

---

## R7. Assistive-technology exposure (FR-021…FR-024 — US5)

**Decision**: remove `aria-hidden="true"` from `.hud`, `#toast` and `#hint`. Give the HUD a
`role="group"` with an accessible name so its four label/value pairs are discoverable on
demand, and make `#toast` a polite live region (`role="status"`) so lap completion announces
itself.

**Rationale**: `aria-hidden` was reaching for click-through, which `pointer-events: none`
already provides in `styles.css` — so the attribute bought nothing and cost everything. The
split between a *queryable* HUD and a *live* toast is deliberate: the HUD updates every frame
and would be unusable as a live region, whereas lap completion is a discrete event and is
exactly what a live region is for.

**Alternatives considered**: `aria-live="polite"` on the HUD — rejected, sixty announcements a
second; a visually hidden text mirror of game state — rejected as a second definition of the
same facts, violating Principle IV; adding an accessible description to the canvas — deferred,
not required by any FR.

---

## R8. Pointer hiding (FR-027 — US6)

**Decision**: add a `cursor: none` rule scoped to a state class on the canvas, and toggle that
class from `updateScreens()` on `game.state === 'racing'`.

**Rationale**: `updateScreens()` is already the single render-side function that reflects game
state into the DOM, so the pointer follows the same path as every other state-driven visual.
No new listener, no new state.

**Alternatives considered**: hiding the pointer permanently — rejected, the title and pause
screens are pointer targets and FR-027 requires it back; hiding it on a mouse-idle timer —
rejected as unrequested behaviour and a wall-clock dependency.

---

## Cross-cutting confirmations

- **No dependency, build step, storage or network** is introduced by any decision above
  (Principle I, Additional Constraints).
- **No decision puts a canvas call in the update path or a state mutation in the render path**
  (Principle II). `gateAt()` is pure; the `is-playing` toggle is a DOM write from the existing
  render-side DOM writer.
- **No decision introduces a wall-clock read into the simulation** (Principle III).
  `event.repeat` is consumed on the input edge, outside `update()`.
- **Verification remains manual**; every decision above is covered by at least one success
  criterion in the spec and one step in [quickstart.md](./quickstart.md).
