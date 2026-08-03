---
id: 0012
title: Plan Three Level Progression
stage: plan
date: 2026-07-31
surface: agent
model: claude-opus-5
feature: 004-three-level-progression
branch: 004-three-level-progression
user: aliaftabsheikh
command: /sp.plan
labels: ["plan", "rural-racer", "levels", "multi-track", "track-geometry", "harness-first", "principle-ii"]
links:
  spec: specs/004-three-level-progression/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/004-three-level-progression/plan.md (created — summary, technical context, constitution gate, changes by file, complexity tracking, risks)
 - specs/004-three-level-progression/research.md (created — 8 decisions R1-R8 with alternatives rejected)
 - specs/004-three-level-progression/data-model.md (created — TRACKS schema, 4 reset scopes, 7-state machine, derived caches, render memos)
 - specs/004-three-level-progression/contracts/level-progression.md (created — C-1..C-10 behavioural guarantees)
 - specs/004-three-level-progression/quickstart.md (created — L1-L17 manual acceptance, 6 human-only steps flagged)
 - <scratchpad>/tracks-check.mjs (created, outside repo — 51 geometry assertions)
 - <scratchpad>/angles.mjs (created, outside repo — vertex angle census)
tests:
 - tracks-check.mjs — 51 assertions across 7 constraints on all 3 tracks, ALL PASSED
 - quickstart.md L1-L17 — OUTSTANDING by design, requires a browser and a human
---

## Prompt

```text
/sp.plan
```

(no additional user input)

## Response snapshot

Five Phase 0/1 artifacts written. Constitution gate **PASS** on all six principles, with one
wording amendment tracked.

**The geometry was settled first, before writing the plan** — following this feature's own spec-stage
reflection that the rename work is mechanical and safe while the authored paths are the only part
that can be quietly wrong. A throwaway harness (`tracks-check.mjs`) applies seven constraints to all
three tracks with **level 1 as the control**: any constraint today's shipped circuit fails is a
wrong constraint, not a wrong track. **51 assertions, all passing.**

**Two findings that only running it could produce.**

1. **The containment test was wrong on its first run**, reporting 180 px and 152 px "leaks" on
   levels 2 and 3. It sampled the checkpoint bisector out to a fixed radius, which walked off the
   local corridor and into a *different part of the loop* — on-track, but nothing to do with that
   gate. The correct property stops at the first off-track sample in each direction. The tracks were
   never wrong. This is the second time in this project a harness has failed on its own bug rather
   than the code's; the pattern is worth naming.

2. **The first draft of level 2 was easier than level 1** — 2 corners under 120° against level 1's
   6 — which fails FR-020 outright. A narrower corridor does not make a two-corner track harder than
   a six-corner one. It was rewritten with an S-kink and a technical left side. Without a measured
   corner census this would have been caught by a human after implementation, or not at all.

**The eight decisions (research.md R1–R8).** The headline is R1: the active track is **derived**
from `game.level` through `track()` / `halfW()` accessors, not a reassigned `let TRACK`. The obvious
implementation — one mutable module binding, zero call-site changes — is forbidden by
`constitution.md:164` and creates a second source of truth that can disagree with `game.level`.

R2 adds a **fourth reset scope** (car → level → run → session), which makes "lives refill each
level" literally one line moving from `resetRace()` into `resetLevel()`. R3 confirms the two new
states cost nothing: `stepGame()` and `togglePause()` already freeze everything non-`racing`, so
FR-011 and FR-015 are satisfied by code that exists.

**R4 is where the spec's derivation paid off.** "Best for the current level" implemented naively —
resetting `best` on level change — is destroyed by the restart control, which returns to level 1.
Three per-level bests on the *session* lifetime satisfy both the author's requirement and
Principle VI.

**R5 closes the standing violation rather than tripling it.** `completeLap()` → `showToast()` has
been a Principle II breach since before feature 003, which routed around it. This feature adds two
more announcements to that same function, so the smallest viable diff is the one that unifies the
path, not the one that forks it. After this, `game.js` has **zero** Principle II exceptions.

**The difficulty claim is stated honestly.** Two measures rise monotonically — corridor ÷ car
`2.41 → 2.12 → 1.82`, corners under 120° `6 → 8 → 12`. The single tightest corner does **not**
(`77.6° → 75.4° → 78.9°`) and no claim is made that it does. FR-020 is supported by measurement but
closed only by SC-008, which needs a human. Recorded that way in plan.md, research.md §R7,
contracts C-10 and quickstart L13.

## Outcome

- ✅ Impact: `004-three-level-progression` fully designed. Track geometry settled and machine-verified before implementation rather than during it.
- 🧪 Tests: 51/51 geometry assertions passing. Manual suite L1–L17 written and outstanding by design.
- 📁 Files: 5 artifacts created in-repo, 2 throwaway harnesses in the scratchpad. No source file touched.
- 🔁 Next prompts: `/sp.tasks`; then `/sp.adr multi-track-level-progression` if the user consents.
- 🧠 Reflection: Settling the geometry first was the right call and it paid twice — it caught a track that failed a requirement, and a test that failed for its own reasons. Neither would have surfaced from reading the design. The mechanical part of this feature (eleven call-site renames) was never the risk.

## Evaluation notes (flywheel)

- Failure modes observed: (a) a self-authored geometric test that produced false positives by sampling past the region the property is about — the same class of error as feature 003's vacuous assertion, and the same lesson: a check must model the property, not an approximation of it that happens to be easier to write; (b) a design that satisfied every stated constraint (narrower, distinct, completable) while failing an unstated-but-specified one (FR-020, harder), caught only because C7 counted corners rather than trusting the width knob.
- Graders run and results (PASS/FAIL): PASS — 51/51 geometry assertions; constitution 6/6 pre-design and post-design; all 40 FRs traced to at least one contract clause or quickstart step; 1 tracked complexity item (Principle IV wording amendment, PATCH 1.0.0 → 1.0.1).
- Prompt variant (if applicable): none — `/sp.plan` with empty arguments.
- Next experiment (smallest change to try): at `/sp.implement`, write `levels-check.mjs`'s negative control (C-3 L-E: a point on-track on level 1 and off-track on level 2 must report false after the transition) **before** the positive one. The stale-cache bug this feature is most likely to introduce is invisible to a positive test, and feature 003 already demonstrated that a positive-only assertion can pass for the wrong reason.
- Environment note (unchanged, still worth fixing): `.specify/scripts/bash/*` resolve `REPO_ROOT` via `git rev-parse --show-toplevel`, which returns `D:/Teaching/SMIT/SMIT-batch05-weekdays-agentic-ai` rather than `rural-racer/` — verified again this session. `setup-plan.sh` and `update-agent-context.sh` were therefore not run; artifacts were created agent-natively using the scripts' own conventions. No agent-context update was needed regardless: this feature introduces no new technology.
