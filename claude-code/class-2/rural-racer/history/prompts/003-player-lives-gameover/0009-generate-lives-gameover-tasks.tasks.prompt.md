---
id: 0009
title: Generate Lives Gameover Tasks
stage: tasks
date: 2026-07-27
surface: agent
model: claude-opus-5
feature: 003-player-lives-gameover
branch: 003-player-lives-gameover
user: aliaftabsheikh
command: /sp.tasks
labels: ["tasks", "rural-racer", "lives", "game-over", "chained-stories", "behavioural-harness"]
links:
  spec: specs/003-player-lives-gameover/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/003-player-lives-gameover/tasks.md (created)
tests:
 - none (no repo test runner; a scratchpad harness that drives the real game headlessly is planned as T001-T002, T015, T022, T026)
---

## Prompt

sp.tasks

(no additional user input)

## Response snapshot

Checklist gate passed (`requirements.md` 16/16, 0 incomplete). Generated **31 tasks across six
phases**, all in the required `- [ ] T### [P?] [Story?] description with file path` format.

| Phase | Tasks | Count |
|---|---|---|
| 1 Setup (headless harness) | T001–T002 | 2 |
| 2 Foundational (lives state, inert) | T003–T005 | 3 |
| 3 US1 (P1) leaving the track costs a life 🎯 | T006–T015 | 10 |
| 4 US2 (P2) running out ends the race | T016–T022 | 7 |
| 5 US3 (P3) starting again | T023–T026 | 4 |
| 6 Polish | T027–T031 | 5 |

**The honest structural point: these stories are a chain, not a fan-out.** Feature 002's six
stories were genuinely independent; these three are not — US2 is triggered by US1's deduction and
T017 literally modifies the call site T008 creates, while US3 has no game-over state to leave
until T016 exists. `tasks.md` states this in a dedicated section rather than inheriting the
template's assumption of parallel stories. Genuine parallelism is exactly two pairs
(`index.html` ∥ `styles.css`, twice), and the file says so instead of padding the list.

**Phase 2 is real here**, unlike feature 002 where it was correctly empty. `LIVES_START`,
`LIFE_FLASH`, `game.lives`, `game.lifeFlash` and the `resetRace()` line are read by all three
stories, and they form a coherent inert increment — lives exist and reset correctly, but nothing
decrements them yet.

**The harness is stronger than 002's.** That one loaded `game.js` to prove *geometry*; this one
adds driver helpers (`startRace`, `placeAt`, `runSteps`) so tests can position the car and advance
the simulation, verifying the life rules as **behaviour** against shipped code. T015 asserts the
crux directly: excursions of 1, 120 and 3600 steps each cost exactly one life, a return-and-leave
costs one more, and a simulated pause across an excursion costs nothing. T022 asserts that
`lapsDone` does not increase on the step the race ends (FR-015) and that no timer advances in game
over.

**Three tasks expect no code change** and say so — T024 (`R` already works from game over, and
002's `event.repeat` guard already prevents a pinned countdown), T025 (the pointer already
reappears because `is-playing` keys off `racing`). Recording confirmations beats editing working
code to look productive.

The Notes section carries two prohibitions forward from planning: do not add a second off-track
flag (`game.offTrack` is the single definition), and do not call `showToast()` from the update
path — `completeLap()` already does, a pre-existing Principle II violation this feature routes
around rather than doubles.

**Scope**: generated `tasks.md` and stopped, per the `/sp.tasks` contract. No source file touched.

## Outcome

- ✅ Impact: 31 executable tasks generated; the chained story dependency is stated plainly rather than papered over, and the riskiest rule has a behavioural proof planned before any code is written.
- 🧪 Tests: None in-repo by constitutional stance. A headless behavioural harness is planned (T001–T002, T015, T022, T026); the manual suite is `quickstart.md` L1–L9.
- 📁 Files: `specs/003-player-lives-gameover/tasks.md` created. No source file modified.
- 🔁 Next prompts: run feature 002's outstanding Q1/Q7/Q9 first, then `/sp.implement` — MVP-first through Setup → Foundational → US1, then stop and validate.
- 🧠 Reflection: The template pushes hard toward independent, parallel stories, and this feature genuinely does not have them. Writing a "dependencies are a chain" section was more useful than inventing `[P]` markers that would have misled whoever executes the list.

## Evaluation notes (flywheel)

- Failure modes observed: the tasks template assumes stories fan out from a foundational phase; resisting that framing required an explicit contrary section. Same class of pressure as feature 002's empty Foundational phase — the template's shape wants filling in both directions. Toolchain unchanged: `check-prerequisites.sh` still unusable on this nested layout.
- Graders run and results (PASS/FAIL): PASS — all 31 tasks carry a checkbox, sequential ID and file path; story labels appear in exactly the three story phases and nowhere else; every FR from the spec maps to at least one task; every contract guarantee group (C1–C6) has a covering task.
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): carry the harness's driver helpers (`startRace`/`placeAt`/`runSteps`) forward as the standard way to check any future rule in this game — geometry proofs and behavioural proofs now share one loader, and the marginal cost of the next check is a few lines.
