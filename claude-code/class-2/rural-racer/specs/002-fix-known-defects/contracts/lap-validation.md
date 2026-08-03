# Contract: Lap Validation

**Feature**: `002-fix-known-defects` | **Date**: 2026-07-27
**Covers**: FR-001 … FR-007 (User Story 1)

> **Why this is not an OpenAPI document.** Rural Racer has no server, no endpoints and no
> network access — the constitution forbids all three. The contracts that actually need
> pinning down are the internal ones between the update path, the render path and the track
> definition, because that is where the divergence causing this feature's headline defect
> lives. These documents state those contracts in the same input/output/error terms an API
> contract would use.

---

## C1. `gateAt(i) → { a, b }`

The single definition of a checkpoint gate. **Both** the crossing test and the renderer MUST
obtain gate geometry from this function and from nowhere else.

**Inputs**

| Name | Type | Constraint |
|---|---|---|
| `i` | integer | A valid index into `TRACK.path` |

Reads `TRACK.path`, `TRACK.width`. Reads no mutable state.

**Output**

| Field | Type | Guarantee |
|---|---|---|
| `a` | `{ x, y }` | Inner endpoint — lies exactly on the inner corridor boundary at the vertex |
| `b` | `{ x, y }` | Outer endpoint — lies exactly on the outer corridor boundary at the vertex |

**Definition**

```
û      = unit(path[i-1] − path[i])          // wrapping the closed loop
ŵ      = unit(path[i+1] − path[i])
s      = û + ŵ                              // |s| = 2·cos(θ/2)

if |s| ≥ ε:
    b̂  = unit(s)                            // bisector, into the inside of the turn
    sinHalf = sqrt(max(0, 1 − (|s|/2)²))     // = sin(θ/2)
    a  = path[i] + b̂ · (HALF_W / sinHalf)
    b  = path[i] − b̂ · HALF_W
else:                                        // degenerate: near-straight vertex
    n̂  = perpendicular(tangentAt(i))
    a  = path[i] + n̂ · HALF_W
    b  = path[i] − n̂ · HALF_W
```

**Guarantees**

- **G1 — Purity.** No canvas call, no DOM access, no mutation of any kind. Safe to call from
  both `update()` and `render()` (Constitution Principle II).
- **G2 — Determinism.** Identical output for identical `TRACK` and `i`, on every call.
- **G3 — Corridor spanning.** Segment `a…b` is exactly the on-track cross-section at
  `path[i]`, measured along the angle bisector. Consequently any continuous on-track path that
  passes the corner intersects it (FR-002).
- **G4 — Finiteness.** All four coordinates are finite for every vertex of a valid closed path,
  including near-straight vertices, via the `ε` fallback.
- **G5 — Derivation only.** Output depends solely on `TRACK`. Editing `TRACK.path` moves the
  gates with no other change (FR-003, Principle IV).

**Errors**

| Condition | Behaviour |
|---|---|
| `\|û + ŵ\| < ε` (straight vertex) | Fall back to the tangent perpendicular. MUST NOT produce `NaN`. |
| Coincident adjacent points | Undefined input; the track definition is invalid. Not defended against at runtime. |

**Caching**: gates for `CP_INDICES` are computed once during initialisation and reused. The
cache MUST be built after `TRACK` is final and before the first frame.

---

## C2. Checkpoint crossing test

Evaluated once per fixed step, inside `updateLap()`.

**Preconditions**

- `game.prev` holds the car's position at the previous step.
- `nextCp < CP_INDICES.length`.

**Rule**

```
advance nextCp  ⟺  segIntersect(prev, pos, gate.a, gate.b)
                   AND isOnTrack(pos)
where gate = cached gate for CP_INDICES[nextCp]
```

**Guarantees**

- **Only the next expected gate is tested.** Gates cannot be taken out of order and a
  previously cleared gate is inert on re-crossing (FR-004).
- **Segment-based, not point-based.** A car moving up to 5 px per step cannot pass a gate
  without registering it; the same property already protects the finish line.
- **On-track required.** Crossing the bisector while in the grass does not register (FR-006).
- **Direction-agnostic.** A checkpoint counts in either direction of travel. Ordering plus the
  directional finish-line test already make a backwards lap impossible, so no extra constraint
  is needed here.

**Non-goals**: no partial credit, no timeout, no proximity component. `CP_RADIUS` is deleted.

---

## C3. Finish-line crossing test

**Unchanged by this feature.** Restated because C2 now shares its shape, and any future edit
must keep the two consistent.

```
count a lap  ⟺  segIntersect(prev, pos, start.a, start.b)
                AND (pos − prev) · start.dir > 0        // racing direction only
                AND nextCp === CP_INDICES.length        // every gate cleared, in order
```

**Guarantees**

- Fires on the crossing event, not on the resting state — parking on the line cannot
  re-trigger it (FR-001).
- Crossing against the racing direction never counts (FR-005).
- Missing any gate never counts (FR-004).

---

## C4. `completeLap()` post-state

On a counted lap, and only then:

| Field | Transition | Requirement |
|---|---|---|
| `lapsDone` | `+1` | FR-007 |
| `lap` | `lapsDone + 1` | invariant 2 |
| `lastLap` | `= lapTime` (pre-reset value) | FR-007 |
| `best` | `= lapTime` **iff** `lapTime < best` or `best === null` | FR-010 — strict |
| `lapTime` | `= 0` | FR-007 |
| `nextCp` | `= 0` | FR-007 |
| toast | announced, visually and to assistive technology | FR-022 |

**MUST NOT** touch: `raceTime` (FR-014), car state, `dust`, `game.state`.

---

## Verification hooks

| Contract | Success criterion | Quickstart step |
|---|---|---|
| C1 G3, C2 | SC-001 — 20 of 20 legal laps counted | Q1 |
| C2, C3 | SC-002 — 0 of 10 illegal laps counted | Q2 |
| C3 | FR-005 — reverse crossing rejected | Q3 |
| C4 | SC-003 — strict-improvement records | Q4 |
| C1 G5 | Principle IV — move a vertex, gate follows | Q10 |
