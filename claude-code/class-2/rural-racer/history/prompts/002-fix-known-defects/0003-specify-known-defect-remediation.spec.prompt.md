---
id: 0003
title: Specify Known Defect Remediation
stage: spec
date: 2026-07-27
surface: agent
model: claude-opus-5
feature: 002-fix-known-defects
branch: 002-fix-known-defects
user: aliaftabsheikh
command: /sp.specify
labels: ["spec", "rural-racer", "defect-remediation", "lap-validity", "accessibility"]
links:
  spec: specs/002-fix-known-defects/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/002-fix-known-defects/spec.md (created)
 - specs/002-fix-known-defects/checklists/requirements.md (created)
 - history/prompts/002-fix-known-defects/ (created)
 - branch 002-fix-known-defects (created, checked out)
tests:
 - none run (no test runner; spec defines 11 measurable success criteria for manual verification)
---

## Prompt

sp.specify

@PROJECT-EXPLANATION.md

## Response snapshot

Interpreted the feature description as remediation of the eight known defects listed in
§10 of `PROJECT-EXPLANATION.md` — the only forward-looking content in an otherwise
descriptive document, and the natural pipeline successor to the code review and constitution.
The alternative reading (retroactively specifying the whole game) is served by the separate
`/sp.reverse-engineer` command. The interpretation is recorded as the first entry in the
spec's Assumptions section and was flagged to the user for confirmation.

**Branch**: `002-fix-known-defects`. Highest existing number across remote branches, local
branches and specs directories was 001 (`001-landing-page`), so 002 is next.

**Deviation from the documented flow — `create-new-feature.sh` was not run.** The script
resolves its repository root via `git rev-parse --show-toplevel`, which returns the outer
teaching repository, not `rural-racer/`. Running it would have written `spec.md` into
`SMIT-batch05-weekdays-agentic-ai/specs/002-fix-known-defects/` beside the unrelated
landing-page feature, copied the *outer* repo's spec template, and divorced the spec from the
`rural-racer/.specify/memory/constitution.md` ratified in the previous step — so `/sp.plan`
would later read the wrong constitution. Performed the script's work agent-natively instead:
created the branch, the feature directory under `rural-racer/specs/`, and the matching
`history/prompts/002-fix-known-defects/` directory. Branch naming and numbering follow the
script's own convention exactly.

**Spec content** — six prioritised, independently testable user stories:

- **P1 Every legal lap is counted** — the hairpin defect, framed as the fastest legal line
  being silently rejected.
- **P2 Progress survives a restart** — best lap preserved across restart; recovery preserves
  earned state.
- **P3 Total race time is visible** — the tracked-but-never-displayed timer.
- **P4 Never stuck, always responsive** — world-boundary pinning and the restart key repeat,
  grouped as recoverability failures.
- **P5 Game state available to assistive technology** — the `aria-hidden` blackout.
- **P6 Consistent visual presentation** — shadow direction and pointer hiding.

27 functional requirements in five groups (lap validity, session records, timing display,
recovery and responsiveness, accessibility, presentation), 10 edge cases, 4 key entities, and
11 measurable technology-agnostic success criteria — including zero legal laps rejected
across 20 varied lines, zero illegal laps accepted across 10, and frame-rate-independent lap
times.

FR-003 ("the region that registers a corner marker MUST be the same region the player is
shown") is the requirement that closes the class of bug rather than the instance — it is
Principle IV expressed as an acceptance condition.

**Validation**: all 16 checklist items pass on iteration 1. **Zero `[NEEDS CLARIFICATION]`
markers** — every gap had a defensible default, and all eight are recorded in the spec's
Assumptions section (paused time excluded from the total; session best is memory-only per the
no-storage principle; restart discards the in-progress lap; recovery keeps earned state; a
tied time does not set a record; circuit layout unchanged). The checklist file records a
source-to-spec translation table showing how each developer-facing defect became a
player-facing requirement, plus the reasoning for the two items that needed a judgement call.

## Outcome

- ✅ Impact: Feature 002 specified and validated; ready for `/sp.plan` without a clarification round.
- 🧪 Tests: None run — no test runner exists. The spec instead defines 11 measurable success criteria and 10 edge cases for manual verification.
- 📁 Files: `spec.md` and `checklists/requirements.md` created under `rural-racer/specs/002-fix-known-defects/`; branch created and checked out.
- 🔁 Next prompts: `/sp.plan` to design the fixes (the FR-003 gate-geometry change is the one with real design choice in it); `/sp.clarify` only if the scope interpretation is rejected.
- 🧠 Reflection: Writing the spec forced the eight defects to be restated as player outcomes, which surfaced that four of them are the same failure — state that should be durable is being destroyed by something that should be narrow. Grouping them into two user stories rather than eight is what made the priorities legible.

## Evaluation notes (flywheel)

- Failure modes observed: `create-new-feature.sh` assumes project root == git root, which is false for a SpecKit project nested inside a larger repository; it would have scattered artifacts into the parent project. This is the second script in this toolchain to fail on this project's layout, after `create-phr.sh`'s template-name mismatch.
- Graders run and results (PASS/FAIL): PASS — 16/16 spec quality checklist items on iteration 1; no unresolved placeholders; route matches stage (`spec` → `history/prompts/<feature>/`).
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): Teach the SpecKit bash scripts to prefer the nearest enclosing `.specify/` directory over the git toplevel when the two differ, which would fix both observed failures at once.
