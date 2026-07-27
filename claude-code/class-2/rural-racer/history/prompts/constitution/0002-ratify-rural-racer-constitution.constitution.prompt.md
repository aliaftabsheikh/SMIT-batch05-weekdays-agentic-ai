---
id: 0002
title: Ratify Rural Racer Constitution
stage: constitution
date: 2026-07-27
surface: agent
model: claude-opus-5
feature: none
branch: 001-landing-page
user: aliaftabsheikh
command: /sp.constitution
labels: ["constitution", "governance", "rural-racer", "sdd", "template-propagation"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md (filled from template — v1.0.0)
 - .specify/templates/plan-template.md (Constitution Check gates filled)
 - .specify/templates/tasks-template.md (constitution-driven task types added)
 - .specify/templates/spec-template.md (reviewed, no change required)
 - PROJECT-EXPLANATION.md (read as derivation source)
tests:
 - none (no test runner in this project; constitution defines a 7-point manual acceptance gate instead)
---

## Prompt

sp.constitution

@PROJECT-EXPLANATION.md

## Response snapshot

`.specify/memory/constitution.md` was a pristine template — every token unfilled. Derived
concrete values from `PROJECT-EXPLANATION.md` and the source it documents, then ratified at
**v1.0.0** (initial adoption, so baseline rather than an increment).

Six principles, mapped onto the template's six slots:

- **I. Zero Dependencies, Zero Build** — must run by opening `index.html`; no bundler,
  framework, or CDN; new behaviour goes in the existing three files.
- **II. Simulate and Draw Are Separate (NON-NEGOTIABLE)** — `update()` may not touch
  `ctx.*`/DOM; `render()` may not mutate state; render-only caches stay off `game`.
- **III. Fixed-Timestep Determinism** — advance only in `STEP` slices; no wall-clock reads;
  exponential decay for framerate correctness; `MAX_FRAME`/`MAX_STEPS`/accumulator-drop
  guards are load-bearing; timers accumulate from `dt` so pause stops the clock as a
  consequence of the loop.
- **IV. One Definition Per Fact** — all geometry derives from `TRACK.path`; a shape drawn one
  way and tested another is a defect (the `CP_RADIUS` gate-vs-circle bug is named as the
  canonical violation); tuning values live only in the constants block; the `COLOR`/`:root`
  palette is the one permitted duplication and must change in lockstep.
- **V. Canvas Owns the World, DOM Owns the Interface** — moving content on canvas, all text
  in DOM; drawing works in 900×600 world space with DPI handled once in `resizeCanvas()`.
- **VI. Playable by Default** — `prefers-reduced-motion` in both layers; no `aria-hidden` on
  live state; tabular figures with reserved width; `event.code` not `event.key`; focus loss
  clears keys and pauses; restart must not destroy session records and recovery paths must
  repair only what is broken.

Principles IV and VI were written to encode the defects surfaced in the prior code review,
so those bugs now read as constitution violations rather than loose opinions.

**Additional Constraints** covers the 60 fps budget, single-file section discipline (ES
modules require an ADR because they break Principle I), target platform, state ownership on
the single `game` object, and a no-persistence/no-network rule.

**Development Workflow and Quality Gates** establishes spec-first traceability, smallest
viable diff, and — since there is no test runner — a mandatory 7-point manual acceptance
gate for any change to physics, track, or lap logic (clean lap counts, skipped checkpoint
rejected, reverse crossing rejected, pause freezes the clock, alt-tab leaves no stuck key,
frame-rate independence, off-track slows without trapping).

**Governance** defines the amendment procedure (relaxing a principle requires a cited ADR),
the MAJOR/MINOR/PATCH policy applied to governance rather than the game, and the plan-gate
compliance review.

Propagation performed: `plan-template.md`'s "Constitution Check" placeholder replaced with
six concrete checkbox gates plus the additional-constraints line; `tasks-template.md` Polish
phase gained determinism / accessibility / single-definition task types;
`spec-template.md` reviewed and left unchanged (technology-agnostic, no mandatory section
added or removed). `.specify/templates/commands/` does not exist in this project — flagged
in the Sync Impact Report rather than silently skipped.

Validation: zero remaining `[BRACKET_TOKEN]` placeholders (grep-confirmed), version line
matches the Sync Impact Report, dates ISO-formatted, principles phrased as MUST/MUST NOT.

## Outcome

- ✅ Impact: Project has a ratified v1.0.0 constitution; the `/sp.plan` gate is now concrete and checkable rather than a placeholder.
- 🧪 Tests: None run — no test runner exists. The constitution instead codifies a 7-point manual acceptance gate as the standing verification requirement.
- 📁 Files: 1 rewritten (`constitution.md`), 2 templates updated (`plan-template.md`, `tasks-template.md`), 1 reviewed unchanged (`spec-template.md`).
- 🔁 Next prompts: Fix the `CP_RADIUS` lap bug as the first Principle IV enforcement; re-key `PLAN.md` §5 acceptance items to principle IDs; consider `/sp.adr` if any known-issue fix needs to relax a principle.
- 🧠 Reflection: Deriving principles from a document written *after* the code meant the known-issues list could be folded directly into the principles — each defect now has a governing rule it violates, which makes the constitution immediately actionable instead of aspirational.

## Evaluation notes (flywheel)

- Failure modes observed: `.specify/scripts/bash/create-phr.sh` failed with "PHR template not found at .specify/templates/ or templates/" even though `.specify/templates/phr-template.prompt.md` exists — the script's filename expectation and the shipped template name disagree. Fell back to agent-native creation per the documented fallback path.
- Graders run and results (PASS/FAIL): PASS — placeholder grep clean, version/date coherence verified, route matches stage (`constitution` → `history/prompts/constitution/`).
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): Patch `create-phr.sh`'s template lookup to match the shipped `phr-template.prompt.md` filename so the shell path stops failing.
