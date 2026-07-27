---
id: 0007
title: Specify Player Lives Gameover
stage: spec
date: 2026-07-27
surface: agent
model: claude-opus-5
feature: 003-player-lives-gameover
branch: 003-player-lives-gameover
user: aliaftabsheikh
command: /sp.specify
labels: ["spec", "rural-racer", "lives", "game-over", "ambiguity-resolution"]
links:
  spec: specs/003-player-lives-gameover/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/003-player-lives-gameover/spec.md (created)
 - specs/003-player-lives-gameover/checklists/requirements.md (created)
 - history/prompts/003-player-lives-gameover/ (created)
 - branch 003-player-lives-gameover (created, checked out)
tests:
 - none run (no test runner; spec defines 10 measurable success criteria for manual verification)
---

## Prompt

Now add this new functionality the opponent has 3 lives if they out from the track deduct 1 live and if all 3 lives end show the popup gameover and start again !

## Response snapshot

**The central problem in this request is the word "opponent".** Rural Racer is a single-player
time trial with no opponent, and `002-fix-known-defects` explicitly placed opponents, ghosts and
multiplayer out of scope. Two readings existed and only one survives its own sentence:

- *"opponent" = the player's car* — self-consistent. Leaving the track, losing lives and reaching
  **game over** are all player-failure outcomes.
- *"opponent" = a new AI rival* — contradictory. An opponent exhausting its lives would be the
  player's **win**, not a game over. It would also require driving behaviour, race positions and a
  win condition, none of which the request mentions.

Specified for the player. Recorded as the **first** assumption with an explicit note that if an
AI opponent was genuinely intended, this spec should be **replaced rather than amended** — and
flagged at the top of the completion report so a one-word correction is possible. No
`[NEEDS CLARIFICATION]` marker was raised, because a defensible default exists and the
alternative is internally inconsistent.

**The second ambiguity was temporal.** "if they out from the track deduct 1 live" describes a
*continuous* condition as though it were an event. Charging per frame would end a race in about a
twentieth of a second; charging per second would make a long slide arbitrarily expensive. FR-004
pins the reading — **one life per excursion, charged the moment the car leaves the track** — and
the spec introduces **Excursion** as a named key entity so the concept is testable. Edge cases
cover the momentary clip, the ten-second slide, the world-boundary bounce onto grass, and the
pause-mid-excursion case (no second charge on resume).

**Branch**: `003-player-lives-gameover`. Highest existing number across branches and specs
directories was 002.

**Three prioritised user stories**: P1 leaving the track costs a life (the counter, and the
per-excursion rule that is the real design risk); P2 running out ends the race (freeze, panel,
result, in-progress lap voided); P3 starting again (three lives back, timers zeroed, session best
preserved).

26 functional requirements in four groups (lives, game over, starting again, accessibility), 10
edge cases, 3 key entities and 10 measurable success criteria — including 20 excursions of
varying duration each costing exactly one life with zero over- or under-charges.

Deliberate continuity decisions: the existing off-track penalty is explicitly preserved rather
than replaced (FR-007); the session best survives game over, matching the rule established in
002 (FR-019); nothing is persisted (FR-022); and no lap limit is introduced, so a clean driver
can still race indefinitely.

**Risk recorded in Dependencies**: this feature extends the off-track detection and state machine
delivered by 002, whose manual acceptance suite (Q1–Q11) has not yet been run. It is being
specified against code that is proven numerically but not yet verified by hand.

`create-new-feature.sh` was again not run — it resolves the project root to the outer teaching
repository, which would place the spec beside the unrelated landing-page feature and divorce it
from the rural-racer constitution. Branch and directories created agent-natively using the
script's own naming convention.

## Outcome

- ✅ Impact: Feature 003 specified and validated with zero clarification markers; the one genuinely contradictory term in the request is resolved, documented, and surfaced for correction.
- 🧪 Tests: None run — no test runner. 10 measurable success criteria and 10 edge cases defined for manual verification.
- 📁 Files: `spec.md` and `checklists/requirements.md` created; branch created and checked out.
- 🔁 Next prompts: confirm or correct the "opponent" reading; run 002's outstanding manual suite before building on it; then `/sp.plan`.
- 🧠 Reflection: Naming "Excursion" as an entity did most of the work here — once the continuous off-track condition had a discrete noun, the per-frame/per-second/per-excursion ambiguity became a one-line requirement instead of a source of implementation guesswork.

## Evaluation notes (flywheel)

- Failure modes observed: the request contained a term with no referent in the product. Specifying it as written would have produced a large, wrong feature; blocking on it would have delivered nothing. Resolving to the only self-consistent reading, recording it as assumption #1 with replace-don't-amend guidance, and flagging it prominently is the pattern worth repeating. Separately: `create-new-feature.sh` remains unusable on this nested layout, the sixth SpecKit script affected by `get_repo_root`.
- Graders run and results (PASS/FAIL): PASS — 16/16 spec quality checklist items on iteration 1; no unresolved placeholders; route matches stage; every FR traceable to a user story or an accessibility principle.
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): when a request names an entity that does not exist in the codebase, state the mismatch in the first sentence of the response before any artifact is written — it puts the correction cost at seconds rather than a full planning cycle.
