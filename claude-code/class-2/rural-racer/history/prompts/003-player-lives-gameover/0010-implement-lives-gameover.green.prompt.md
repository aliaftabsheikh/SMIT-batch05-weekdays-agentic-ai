---
id: 0010
title: Implement Lives And Gameover
stage: green
date: 2026-07-27
surface: agent
model: claude-opus-5
feature: 003-player-lives-gameover
branch: 003-player-lives-gameover
user: aliaftabsheikh
command: /sp.implement
labels: ["implement", "rural-racer", "lives", "game-over", "behavioural-harness", "principle-ii"]
links:
  spec: specs/003-player-lives-gameover/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - game.js (modified — LIVES_START, LIFE_FLASH, game.lives, game.lifeFlash, resetRace, excursion edge, loseLife, enterGameOver, onEnter, stepGame decay, updateHud, drawLifeLostCue, updateScreens)
 - index.html (modified — LIVES panel, #gameoverScreen)
 - styles.css (modified — bottom row space-between, .screen__result)
 - PROJECT-EXPLANATION.md (modified — §8 state machine and lives, §9 event handoff, §11 tuning table)
 - specs/003-player-lives-gameover/tasks.md (30 of 31 marked complete; constitution re-check, deviations and results recorded)
 - <scratchpad>/lives-check.mjs (created, outside repo)
tests:
 - lives-check.mjs — 41 assertions against the shipped game.js, ALL PASSED
 - verify-shipped.mjs (feature 002 regression) — ALL PASSED
 - gate-check.mjs (feature 002 regression) — ALL PASSED
 - node --check game.js — clean
 - quickstart.md L1-L9 — OUTSTANDING, requires a human
---

## Prompt

sp.implement

(no additional user input)

## Response snapshot

Checklist gate passed (16/16). 30 of 31 tasks complete; T031 is the human handoff, left open.

**The design held: three requirements needed no code at all.** Adding `'gameover'` as a fifth
state gave FR-013 (car frozen), FR-014 (timers stopped) and FR-016 (pause inert) for free, because
`stepGame()` already returns early for any non-`racing` state and `togglePause()` already guarded
on `racing`/`paused`. The harness confirms it: 30 simulated seconds in game over with the throttle
held moves the car zero pixels and advances neither timer.

**Excursion detection** is three lines — `const wasOffTrack = game.offTrack` before the existing
recomputation, then `if (game.offTrack && !wasOffTrack && loseLife()) return;` placed after the
world-edge bounce and before `updateLap()`. No second flag. The pause-mid-slide case needed no
code and was verified anyway: 120 paused steps mid-excursion, resume still in the grass, no second
charge.

**Principle II was honoured rather than copied.** The file's existing event path
(`completeLap()` → `showToast()`) writes to the DOM from inside `update()`. This feature routes
around it: `loseLife()` sets a counter and arms `game.lifeFlash`; `enterGameOver()` sets one
field; the panel, its result text and both announcements happen in `updateScreens()` behind
render-side memos (`lastLivesAnnounced`, `lastStateAnnounced`) mirroring the existing
`lastCountLabel`. Audit grep over the whole `update()` span for `document.`, `setText`,
`toggleHidden`, `showToast` and `ctx.` returns **no matches**.

**The harness caught a bad test, not bad code.** T015's first run failed "last life lost on this
step". Investigation showed the *test* was wrong twice over: the car was already off-track from
the previous excursion, so there was no rising edge; and its movement segment never crossed the
start line at all, which meant the FR-015 assertion had been passing **vacuously**. Every point on
the start-line segment is on-track by construction, so the scenario requires a diagonal that
begins on the track and exits into the grass — `(240,500) → (260,560)`. Rewritten, **plus a
control** asserting that the identical crossing *does* complete a lap when lives remain. Without
that control the real assertion would still have proved nothing.

41 assertions pass against the shipped `game.js`, including: excursions of 1 / 120 / 3600 steps
each costing exactly one life; frame-rate independence at 10 / 100 / 1000 steps; best lap 42.5
surviving game over and restart; and the non-finite recovery guard costing no life. Feature 002's
two harnesses still pass unchanged.

**HUD**: `LIVES` bottom-left, `SPEED` bottom-right via `space-between` — the two things glanced at
while driving, in the row that previously held one panel. Numeric, not hearts, per research §R5.

## Outcome

- ✅ Impact: All three user stories implemented and verified behaviourally against shipped code. Three of the spec's requirements were satisfied by the existing state machine with zero new code.
- 🧪 Tests: 41 harness assertions passing; both feature-002 harnesses still green; `node --check` clean; static audit clean. Manual suite L1–L9 outstanding by design.
- 📁 Files: 4 modified in-repo, `tasks.md` updated, 1 throwaway harness in the scratchpad.
- 🔁 Next prompts: run `quickstart.md` L1–L9 and feature 002's Q1–Q11 in a browser; then `/sp.git.commit_pr` — nothing across features 002 and 003 is committed yet.
- 🧠 Reflection: The most valuable result was a failing test that turned out to be the test's fault. Chasing it revealed that the FR-015 check had been passing for the wrong reason, which no amount of green output would have shown — the control assertion added afterwards is what makes that requirement actually verified.

## Evaluation notes (flywheel)

- Failure modes observed: a self-authored test that passed vacuously. The assertion "the lap did NOT count" was true only because the setup could never have completed a lap in the first place. The general fix — pair every negative assertion with a positive control proving the scenario is capable of the outcome being excluded — is worth applying to any future "X must not happen" check in this project.
- Graders run and results (PASS/FAIL): PASS — 41/41 behavioural assertions; feature 002 regression 36/36; constitution 6/6 re-verified post-implementation; static audit found no DOM or canvas call reachable from the update path.
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): fix the pre-existing `completeLap()` → `showToast()` violation using the same render-memo pattern now proven twice in `updateScreens()` — it is a handful of lines and would leave the file with no Principle II exceptions at all.
