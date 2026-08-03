# Specification Quality Checklist: Player Lives and Game Over

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-07-27
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

## Notes

- Items marked incomplete require spec updates before `/sp.clarify` or `/sp.plan`.

### Validation record — iteration 1 (2026-07-27): ALL PASS

**The one item that needed a real judgement call: "Requirements are testable and unambiguous."**

The source description contains a word that does not correspond to anything in the product —
*"the opponent"*. Rural Racer is a single-player time trial, and `002-fix-known-defects` put
opponents, ghosts and multiplayer explicitly out of scope. Two readings were possible:

| Reading | Assessment |
|---|---|
| "opponent" = the player's car | Self-consistent. Leaving the track, losing lives and reaching *game over* are all player-failure outcomes. |
| "opponent" = a new AI rival car | Not self-consistent with the same sentence. An opponent exhausting its lives would be the player's **win**, not a game over. It would also require driving behaviour, race positions and a win condition, none of which the description mentions. |

Resolved in favour of the player rather than raising a `[NEEDS CLARIFICATION]` marker, because a
defensible default exists and the alternative is internally contradictory. The decision is
recorded as the **first** assumption in the spec, with an explicit instruction that if an AI
opponent was genuinely intended this spec should be **replaced, not amended** — and it was
flagged to the user in the completion report so a one-word correction is possible.

**The second judgement call: what "if they out from the track deduct 1 live" means over time.**
Being off the track is a continuous condition, not an event. Charging per frame would end a race
in roughly a twentieth of a second; charging per second would make a long slide arbitrarily
expensive. FR-004 pins the intended reading — one life per *excursion*, charged at the moment the
car leaves — and the **Excursion** key entity gives that concept a name so it can be tested.
Edge cases cover the momentary clip, the ten-second slide, and the pause-mid-excursion case.

**Content quality**: the spec names no file, function, state variable or technology. The
Dependencies section references the constitution and the preceding feature by ID, which is
process traceability rather than implementation detail — the same judgement made for feature 002.

**Zero `[NEEDS CLARIFICATION]` markers.** Ten assumptions are recorded instead, each with a
default that is either forced by the existing product (best lap survives a restart; nothing is
persisted) or clearly implied by the request (three lives; player-initiated restart).

### Known risk carried into planning

This feature is specified against `002-fix-known-defects`, which is implemented and proven
numerically but whose manual acceptance suite has **not** been run. Off-track detection and the
state machine — both extended here — are part of that unverified surface. Recorded in the spec's
Dependencies section.
