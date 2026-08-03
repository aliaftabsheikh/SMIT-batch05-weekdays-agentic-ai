# Specification Quality Checklist: Three-Level Progression

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-07-31
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Validation Notes

**Iteration 1 — issues found and fixed before the spec was finalised:**

1. *Implementation leakage.* The author's brief was itself a design document — it named
   `TRACKS`, `game.level`, `halfW()`, `enterLevel()`, the four reset functions and specific
   coordinates. None of that belongs in a specification. It was translated into observable
   behaviour: the accessor design became **FR-010** ("MUST refer to the level currently being
   played, with no carry-over"), and the reset-scope table became **FR-008/FR-009/FR-027/FR-029**,
   each stated as something a player can check. The design detail is not lost — it is the input to
   `/sp.plan`.

2. *Track coordinates removed.* The brief's five geometric authoring constraints and the level-2
   point list are implementation. What survives as requirements is only what a player can observe
   or a reviewer can reject a track for: completable (**FR-021**), grid on the surface
   (**FR-022**), no shortcut (**FR-023**), inside the play area (**FR-024**). The geometry that
   *makes* those true belongs in `plan.md` and `research.md`.

3. *An unstated derivation was made explicit.* The author chose "best lap per level", but a best
   that simply resets on level change would be destroyed by the restart control, which returns to
   level 1 — a direct conflict with constitution Principle VI. **FR-034/FR-035** resolve it: three
   bests, one per level, session-lifetime. This is recorded in Assumptions as a derivation rather
   than as a fourth decision by the author, because it was not one.

4. *Two success criteria were rewritten.* "Levels feel harder" and "the interface is clear" are not
   measurable. They became **SC-008** (more attempts to clear each successive level) and **SC-007**
   (a first-time player can state their level and remaining laps unprompted).

**Result: all items pass. No [NEEDS CLARIFICATION] markers.** Every open question in the brief had
already been answered by the author before specification began.

**Carried into planning, not blocking:**

- **FR-020** ("each level MUST be harder") is verified by **SC-008**, which needs a human and more
  than one trial. It cannot be closed numerically and MUST NOT be reported as passing on the
  strength of the track being narrower.
- Both prerequisite features' manual acceptance suites (`002` Q1–Q11, `003` L1–L9) are still
  outstanding. This spec is written against code verified numerically but not by hand — recorded
  in Dependencies so it is not mistaken for a clean baseline.
- Making the track selectable conflicts with the wording of constitution Principle IV, which names
  the current track constants directly. The amendment is in scope for this feature and must land in
  the same change.
