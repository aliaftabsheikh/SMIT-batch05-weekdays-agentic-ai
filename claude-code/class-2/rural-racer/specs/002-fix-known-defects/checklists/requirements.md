# Specification Quality Checklist: Fix Known Defects

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

The source document is written for developers and names files, functions and constants
throughout. The spec was authored by restating each defect as the player-visible failure it
causes, so no source identifier survives into the specification. Specific translations made
during authoring:

| Source (developer-facing) | Spec (stakeholder-facing) |
|---|---|
| `CP_RADIUS` too small at the hairpin | "no path lying entirely on the track surface can miss it" (FR-002) |
| Gate drawn as a segment, tested as a circle | "the same region the player is shown" (FR-003) |
| `reset()` clears `game.best` | "Restarting the race MUST preserve the session best" (FR-008) |
| Non-finite guard calls `reset()` | "Internal recovery … MUST NOT clear the lap count" (FR-011) |
| `game.raceTime` never rendered | "MUST display the total elapsed race time" (FR-013) |
| World-edge backstop zeroes speed | "MUST retain enough control authority to drive away" (FR-017) |
| `KeyR` has no repeat guard | "Holding the restart key MUST perform exactly one restart" (FR-019) |
| `aria-hidden="true"` on HUD/toast/hint | "MUST all be available to assistive technology" (FR-021–023) |
| Shadow offset applied after rotate | "MUST fall in a fixed world direction" (FR-026) |
| No `cursor: none` rule | "pointer MUST be hidden over the play area" (FR-027) |

Two items warranted a closer look before being marked pass:

- **"No implementation details"** — the *Dependencies* section names the constitution file and
  its principle numbers. Judged a pass: that is process traceability required by the project
  workflow, not a technology or design choice, and it constrains rather than specifies the
  solution.
- **"Success criteria are technology-agnostic"** — SC-010 mentions opening a file without an
  installation step. Judged a pass: it states a user-observable distribution property that the
  constitution treats as a hard product constraint, and names no technology.

**Zero `[NEEDS CLARIFICATION]` markers were raised.** Every gap had a defensible default,
and all eight defaults are recorded in the spec's *Assumptions* section rather than deferred
to the user. The one genuinely scope-level judgement — that this feature remediates the eight
listed defects and is not a retroactive specification of the whole game — is recorded as the
first assumption and flagged in the completion report for confirmation.
