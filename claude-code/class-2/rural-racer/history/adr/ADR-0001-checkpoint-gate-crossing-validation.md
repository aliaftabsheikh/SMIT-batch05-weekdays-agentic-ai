# ADR-0001: Checkpoint validation by corridor-spanning gate crossing

- **Status:** Accepted
- **Date:** 2026-07-27
- **Feature:** 002-fix-known-defects
- **Context:** A code review found that a legal racing line through the hairpin silently voided
  the lap. Checkpoints were *validated* as a 55 px circle around a path vertex but *drawn* as a
  segment across the track. The two shapes disagreed, and a player taking the fastest on-track
  line fell in the gap between them: `nextCp` stalled, the finish-line test failed, and the only
  feedback was a gate that stayed yellow. Fixing it required choosing what a checkpoint *is*, not
  just retuning a number — which is why this is an ADR rather than a bug note.

## Decision

A checkpoint is a **gate segment spanning the track corridor at its vertex**, and passing it is a
**crossing test** against the car's movement segment.

- `gateAt(i)` derives the gate from `TRACK.path` alone:
  - `û`, `ŵ` = unit vectors from the vertex to its neighbours; `s = û + ŵ`, so `|s| = 2·cos(θ/2)`
  - inner endpoint `= V + ŝ·(HALF_W / sin(θ/2))` — where the two inner edge offsets meet
  - outer endpoint `= V − ŝ·HALF_W` — where the round join caps the outside
  - degenerate fallback: when `|s| < 1e-6` (a straight vertex) use the tangent perpendicular at
    `HALF_W` either side, so no track edit can produce `NaN` geometry
- `buildGates()` computes all four once at init into `CP_GATES`.
- **`updateLap()` and `drawCheckpoints()` both read `CP_GATES`.** One definition, two consumers.
- A checkpoint registers when `segIntersect(prev, pos, gate.a, gate.b)` **and** the car is
  on-track. Only the next expected gate is ever tested.
- `CP_RADIUS` is deleted.

The gate is asymmetric because the corridor is. A corner is wider on the inside of the turn than
a straight is; a symmetric half-width segment is correct only where θ = 180°.

## Consequences

### Positive

- **No legal line can be rejected.** Verified numerically: 2001 swept on-track racing lines per
  corner, zero misses. The gate endpoints land on the corridor boundary to within 0.05 px.
- **Drawn and tested geometry cannot diverge again.** They are the same object. This closes the
  defect *class*, not the instance — the original bug was only possible because two
  representations of one fact existed.
- **Track edits are self-maintaining.** Move a checkpoint to a tighter corner and its gate
  resizes. A tuned radius would silently re-break.
- **Tunnelling immunity for free.** Segment-vs-segment inherits the protection the finish line
  already had; a car at 300 px/s moves 5 px per step and cannot pass through a gate.
- **Cheaper per step** — one cached segment intersection replaces a `Math.hypot`, and the four
  gates are computed once rather than per frame (the renderer previously recomputed them).

### Negative

- **The gate is not visually symmetric about the vertex.** On the hairpin the inner arm is 59.5 px
  and the outer 41 px. This is geometrically correct but reads as slightly off-centre.
- **`gateAt()` is more code than a radius comparison** — roughly 20 lines including the degenerate
  fallback, versus one line.
- **The fallback branch is currently unreachable.** No checkpoint sits on a straight
  (`|s|` = 1.209 / 0.800 / 0.443 / 1.450). It exists purely so a future track edit cannot produce
  `NaN`, and is exercised only by the verification harness.
- **Correctness now depends on `prev` being maintained.** A stale `prev` would describe a movement
  segment spanning the track and could fire spurious crossings. `placeCarAtGrid()` is obliged to
  update it.

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| **Raise `CP_RADIUS` to 60** | Fixes the hairpin only, and only until the track changes. A circle can never match a gate, so drawn ≠ tested persists — the defect class stays open. |
| **Per-vertex radius `HALF_W/sin(θ/2)`** | Spans the corridor, but a disc at a corner spills across both the entry and exit corridors, so a car can clip a checkpoint it never drove through. Still leaves drawn ≠ tested. |
| **Test against the segment already drawn** *(the code review's own recommendation)* | **Would have made things worse.** The drawn segment reaches only 41 px either side, while the corridor reaches 42.0, 44.7, 51.5 and 59.5 px at the four checkpoints — it under-spans *all four*. Adopting it verbatim would have closed one bug and opened three. This was caught by computing the corridor width before implementing, not by testing afterwards. |
| **Symmetric segment of half-length `HALF_W/sin(θ/2)`** | Spans the corridor and keeps drawn = tested, but overshoots the outer boundary by up to 18.6 px, drawing a gate that visibly pokes into the grass. The asymmetric form costs one extra expression and is exact. |
| **Perpendicular to `tangentAt(i)`** | `tangentAt` is a central difference over neighbours, which only approximates the bisector normal on asymmetric corners. The bisector is exact by construction. |
| **Author gates as data in `TRACK`** | Reintroduces exactly the duplication this decision removes: two authored representations of one fact, free to drift. |

## References

- Feature Spec: `specs/002-fix-known-defects/spec.md` (FR-002, FR-003, US1)
- Implementation Plan: `specs/002-fix-known-defects/plan.md`
- Research & derivation: `specs/002-fix-known-defects/research.md` §R1
- Contract: `specs/002-fix-known-defects/contracts/lap-validation.md` C1, C2
- Constitution: `.specify/memory/constitution.md` Principle IV — "One Definition Per Fact", which
  names this defect as its canonical violation
- Related ADRs: none
- Evaluator evidence: `history/prompts/002-fix-known-defects/0006-implement-defect-fixes.green.prompt.md`
  — harness output, including the containment proof run against the shipped `game.js`
