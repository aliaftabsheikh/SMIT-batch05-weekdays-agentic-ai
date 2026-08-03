---
id: 0008
title: Plan Lives Gameover Design
stage: plan
date: 2026-07-27
surface: agent
model: claude-opus-5
feature: 003-player-lives-gameover
branch: 003-player-lives-gameover
user: aliaftabsheikh
command: /sp.plan
labels: ["plan", "rural-racer", "lives", "game-over", "state-machine", "principle-ii"]
links:
  spec: specs/003-player-lives-gameover/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/003-player-lives-gameover/plan.md (created)
 - specs/003-player-lives-gameover/research.md (created)
 - specs/003-player-lives-gameover/data-model.md (created)
 - specs/003-player-lives-gameover/contracts/lives-and-gameover.md (created)
 - specs/003-player-lives-gameover/quickstart.md (created)
 - specs/003-player-lives-gameover/spec.md (assumption 1 updated — "opponent" reading confirmed by the author)
tests:
 - none run (no test runner; quickstart.md defines L1–L9 plus regressions and the 7-point constitutional gate)
---

## Prompt

Mistakenly using opponent word it's a single user game now plan according to that !

## Response snapshot

The author confirmed the reading flagged at spec time — "opponent" was a slip and Rural Racer
remains single-player. Assumption 1 in `spec.md` was rewritten from an informed guess to a
recorded confirmation, quoting the correction, before planning began. No AI rival, race positions
or win condition are in scope.

**The plan's central finding: almost none of this needs new machinery.**

- **Excursions already exist.** `game.offTrack` is recomputed every step, so an excursion is
  simply its rising edge. No new flag — which matters, because a parallel flag would be a second
  definition of one fact (Principle IV) needing clearing in three reset scopes. It also makes the
  spec's hardest edge cases free: a paused game runs no steps, so `game.offTrack` holds its value
  across a pause and the resume produces no rising edge — pause-mid-slide and tab-switch cost
  nothing extra with zero code.
- **Game over is nearly free.** `stepGame()` already returns early for any non-`racing` state, so
  adding `'gameover'` freezes the car (FR-013) and stops both timers (FR-014) with no new code;
  `togglePause()` already acts only on `racing`/`paused`, so pause is inert there (FR-016) with no
  new code. Three requirements satisfied by the existing state machine.
- **Lives have an obvious home.** `resetRace()` is the race-lifetime scope established by feature
  002, so one line there satisfies FR-018 and FR-021 together, and keeps recovery correct for
  free — the non-finite guard calls `placeCarAtGrid()`, which does not touch lives, so repairing a
  corrupted position never costs one.

**Two decisions required real thought.**

*Ordering within the step (R3).* The finish-line test does not require the car to be on-track —
only checkpoint registration does. So a car with all checkpoints cleared could drift a pixel off
the track beside the start line, lose its last life, and cross the line in the same step. FR-015
says that lap must not count. Resolution: charge the excursion **after** the world-edge backstop
and **before** `updateLap()`, and `return` from `update()` when the charge ends the race. That
makes FR-015 structurally true rather than incidentally true — the lap code does not execute on
the final step.

*Where the DOM writes go (R6).* This feature adds two player-visible events, and the file's
existing event path is `completeLap()` → `showToast()`, which writes to the DOM **from inside
`update()`** — a pre-existing Principle II violation. Copying it would double the violation.
Instead: `enterGameOver()` sets state only; `loseLife()` decrements a counter and arms a
`lifeFlash` timer; every DOM write happens in `updateScreens()` using the `lastCountLabel`
render-memo pattern already in that same function, and the flash draws from `lifeFlash` mirroring
`goFlash`. Every mechanism needed already exists as a working precedent, so being correct cost
nothing. The pre-existing violation is recorded as a suggested separate change, not fixed here.

**HUD placement** (R5): a numeric `LIVES` panel bottom-left, with the bottom row rebalanced to
`space-between` so `SPEED` stays right. Heart glyphs were considered and rejected — they encode
the same fact twice (glyph state *and* count) and need an `aria-label` maintained in parallel with
the visual, an accessibility trap for marginal gain over a digit beside a `LIVES` label.

Constitution: **6/6 PASS** pre-research and post-design; Complexity Tracking empty. 31 numbered
guarantees (G1–G31) across the contract, each mapped to an FR and an L-step. `quickstart.md`
defines L1–L9 plus a regression list that explicitly re-checks feature 002 behaviour — including
that the world-edge bounce onto grass correctly costs a life, and that the pointer reappears on
the game-over panel since it is not a racing state.

**No ADR suggested.** Every decision is local, reuses an existing pattern in the file, and changes
nothing cross-cutting — it fails the three-part significance test, so `research.md` is the right
home for it.

**Scripts**: `setup-plan.sh` and `update-agent-context.sh` not run, for the reason established in
feature 002 — both resolve `REPO_ROOT` to the outer teaching repository. The agent-context update
is substantively a no-op regardless: this feature introduces zero new technology.

## Outcome

- ✅ Impact: Feature 003 fully designed; six constitution gates pass with no violations; three of the spec's requirements turned out to need no code at all, and the two genuine design risks (step ordering, DOM-write placement) are resolved explicitly rather than left to implementation.
- 🧪 Tests: None run — no test runner. `quickstart.md` defines L1–L9, a feature-002 regression list, and the seven-point constitutional gate.
- 📁 Files: 5 created; `spec.md` assumption 1 updated to record the author's confirmation.
- 🔁 Next prompts: `/sp.tasks`. Before implementing, run feature 002's outstanding Q1, Q7 and Q9 — this feature builds directly on the code they would verify.
- 🧠 Reflection: The most valuable question in this phase was "what does the codebase already do?" rather than "what should I build?" — `offTrack`, `stepGame`'s state gate, `resetRace`, `goFlash` and `lastCountLabel` between them covered most of the feature, and the plan shrank to two real decisions plus wiring.

## Evaluation notes (flywheel)

- Failure modes observed: found a **pre-existing Principle II violation** (`completeLap()` writes to the DOM from the update path) while checking where this feature's DOM writes belong. Noted and routed around rather than silently copied — copying the local convention would have been the easy wrong answer. Toolchain: `setup-plan.sh` and `update-agent-context.sh` remain unusable on this nested layout, consistent with the four other affected scripts.
- Graders run and results (PASS/FAIL): PASS — Constitution 6/6 pre-research and post-design; no unresolved `NEEDS CLARIFICATION`; every FR mapped to at least one contract guarantee and one quickstart step; route matches stage.
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): before designing any new event in this file, grep for existing timer/memo patterns first — `goFlash` and `lastCountLabel` answered the hardest design question here and were found only because Principle II forced the search.
