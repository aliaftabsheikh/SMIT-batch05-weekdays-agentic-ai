---
id: 0011
title: Specify Three Level Progression
stage: spec
date: 2026-07-31
surface: agent
model: claude-opus-5
feature: 004-three-level-progression
branch: 004-three-level-progression
user: aliaftabsheikh
command: /sp.specify
labels: ["spec", "rural-racer", "levels", "multi-track", "progression", "per-level-best"]
links:
  spec: specs/004-three-level-progression/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/004-three-level-progression/spec.md (created — 3 user stories, 40 FRs, 12 SCs, assumptions, dependencies, out-of-scope)
 - specs/004-three-level-progression/checklists/requirements.md (created — 16/16 pass, with the four issues fixed during iteration 1 recorded)
 - branch 004-three-level-progression (created off 003-player-lives-gameover)
tests:
 - none — specification stage, no code changed
 - manual acceptance suite deferred to quickstart.md at /sp.tasks
---

## Prompt

The user first ran `/plan` with:

```text
Now make a 3 levels in this game with 3 different tracks moved to the next level after 3 laps
```

Four decisions were then settled via AskUserQuestion:

- Lives across levels → **Refill to 3 each level**
- Best lap with three different tracks → **Best for the current level**
- Difficulty progression → **Layout + narrowing width**
- SDD scope → **Full `specs/004-*` artifact set**

The user then interrupted plan approval and re-invoked `/sp.specify`, passing the resulting plan
back as the feature description. The argument text was corrupted by terminal line-wrapping in
transit (leading characters lost on wrapped lines, e.g. "ral Racer" for "Rural Racer", "e track
becomes selectable" for "The track becomes selectable"). Reproduced verbatim as received:

```text
ral Racer (claude-code/class-2/rural-racer/) is a dependency-free canvas racing game with angle circuit and an endless lap counter. There is no progression: you drive the same 14-point
ack until you run out of lives.
is feature adds three levels, each with its own track. Clearing 3 laps advances you to the
 next level; clearing level 3 wins the run. The result is a game with a beginning and an end
 instead of an open-ended time trial.

 The blocking constraint is that the track is currently a compile-time singleton. TRACK and
 CP_INDICES are consts at game.js:42 and :65, and HALF_W at :61 is derived once from
 TRACK.width. Ten call sites read them directly. Making the track selectable is the real work;
 the level rules on top are small.

 Decisions taken with the user: lives refill to 3 at the start of every level; BEST shows the
 current level's best lap; difficulty rises through layout plus a narrowing track width;
 this ships with the full specs/004-* artifact set, matching features 002 and 003.

 Design
e track becomes selectable state, not a mutable global
e constitution's State ownership rule (.specify/memory/constitution.md:164) permits
dule-level let only for the loop driver, canvas handles and render-only caches. So the active
 track is not a reassigned let TRACK. Instead:

 const TRACKS = [ /* three { name, width, path, checkpoints } objects */ ];
 const LAPS_PER_LEVEL = 3;

 function track()  { return TRACKS[game.level]; }   // one definition, derivednction halfW()  { return track().width / 2; }

 game.level is the only new source of truth, and it lives on game where the constitution says
 simulation state belongs. start and CP_GATES stay exactly as they are — derived caches
 rebuilt by the existing buildStart() / buildGates(), now re-run on every level change.

 Mechanical rename across ~10 call sites: TRACK.path → track().path, TRACK.width →
 track().width, HALF_W → halfW(), CP_INDICES → track().checkpoints. Affected:
 distToPath, isOnTrack, gateAt, tangentAt, buildStart, buildGates, placeCarAtGrid,
 updateLap, tracePath, drawTrack, drawStartLine.

 A fourth reset scope

 Features 002/003 established three lifetimes (car → race → session). Levels insert a fourth:
 car → level → run → session. Same rule as before — an operation clears its own lifetime and
 narrower, never wider.

 | Function | Clears | Notes |
 | placeCarAtGrid() | car, prev, dust, offTrack | unchanged |
 | resetLevel() | + started, lives, lifeFlash, lap, lapsDone, nextCp, lapTime, lastLap | lives moves here from resetRace() — that one line is the "refill each level" rule |
 | resetRace() | + raceTime, runLaps, then enterLevel(0) | R and restart-after-game-over both land here → back to level 1 |
 | resetSession() | + bests | page reload only |

 enterLevel(i) = game.level = i; buildStart(); buildGates(); resetLevel();. Order matters:
 placeCarAtGrid() reads start.dir, so the gates must be rebuilt before the car is placed.

st lap: per level to read, per session to keep

e user chose "best for the current level". Implemented as game.bests = [null, null, null] —
 one slot per track, session lifetime. The HUD and completeLap() both index
 game.bests[game.level], so BEST always compares like with like, while a restart still cannot
 destroy a record. A best that simply reset on level change would read the same in the HUD but
 would violate Principle VI (constitution.md:142, "Restart MUST NOT destroy session records"),
 since R returns to level 1. The victory screen lists all three.

 lapsDone becomes laps in the current level (drives LAP 2/3); new runLaps counts the
 whole run and is what the game-over and victory screens report. raceTime is not reset per
 level — TOTAL is the elapsed time for the whole 9-lap run.

 Two new states, both free

 game.state gains 'levelup' and 'finished', joining title | countdown | racing | paused | gameover. Exactly as in feature 003, freezing comes for nothing: stepGame() (game.js:697)
 already returns for any state that isn't racing, and togglePause() already guards on
 racing/paused, so the car, both timers and pause are all inert in the new states with zero
w code.

mpleteLap() sets the state and nothing else:

 if (game.lapsDone >= LAPS_PER_LEVEL) {
   game.state = game.level < TRACKS.length - 1 ? 'levelup' : 'finished';
 }

 onEnter() gains levelup → enterLevel(game.level + 1); startCountdown(); and finished →
 restart().

 Fix the standing Principle II violation rather than triple it

 completeLap() currently calls showToast() from inside the update path — a known violation,
 logged as the next experiment in PHR 0010. This feature adds two more announcements to the same
 function, so copying the pattern would leave three DOM writes in update(). Instead the toast
 moves to updateScreens() behind a lastRunLapsAnnounced memo, mirroring lastLivesAnnounced
 and lastStateAnnounced already at game.js:612-614. runLaps is monotonic across the run, so
 it is a safe memo key. Precedence in the existing else if chain, single-slot toast:

nished → levelup → gameover → lap completed → life lost

ter this, no document., setText, toggleHidden, showToast or ctx. is reachable from
date() at all.

 Authoring the three tracks

 Level 1 is today's circuit, unchanged, at width 82. Levels 2 and 3 are new and narrower.

 | Level | Name | Width | Character |
 | 1 | Meadow Loop | 82 | today's circuit — S-kink, chicane, one hairpin |
 | 2 | Mill Creek | 72 | fast/slow contrast: long bottom straight into a deep V-notch dive on the top edge |
 | 3 | Quarry Ridge | 62 | serpentine — no long straight, alternating tight corners the whole way round |

 Every authored path MUST satisfy these, and the harness checks each one for all three tracks:

 1. Checkpoint corners ≥ 85°. gateAt() reaches halfW/sin(θ/2) on the inside of a turn, so
 an acute checkpoint produces a gate that draws far out into the grass. Level 1's tightest is
 87.04°; that is the bar. path[0] is a near-straight vertex. placeCarAtGrid() spawns 26 px backwards along
th[0]→path[1]; at a sharp start vertex the car spawns on grass and loses a life instantly. No corridor merge. isOnTrack is distance-to-any-segment, so two corridors passing
thin width of each other fuse into a shortcut. Minimum distance between non-adjacent
 segment pairs > track.width.
 4. Inside the world. Every point ≥ halfW + 8 from all four edges.
 5. Checkpoint count and spread. 4 checkpoints, roughly evenly spaced around the loop.

 Level 2 starting coordinates (validated: the notch vertex 6 is 94.97°, inner gate reach 48.8 px):

 0 (190,520) start/finish   1 (620,520)   2 (780,470)   3 (830,360)▶   4 (780,250)
 5 (640,190)   6 (520,300)▶  7 (400,190)   8 (300,140)   9 (170,200)▶
 10 (100,320)  11 (120,440)▶ 12 (150,495)

 Level 3 is authored to the character and constraints above rather than to fixed coordinates here;
 its exact points are settled during implementation against the harness, which is what actually
 decides whether a path is legal.

 Files

 | File | Change |
 | game.js | TRACKS/LAPS_PER_LEVEL; track()/halfW() accessors + ~10 call-site renames; game.level/runLaps/bests; resetLevel/enterLevel; completeLap level advance; onEnter branches; updateHud LAP n/3 + LEVEL + per-level BEST; updateScreens two screens, toast move, memo |
 | index.html | LEVEL panel in .hud__row--bottom (between LIVES and SPEED); #levelScreen; #winScreen |
 | styles.css | Expected to need nothing — new screens reuse .screen, .screen__title, .screen__result, .screen__cta. At most one small rule for the track-name subtitle. |
 | .specify/memory/constitution.md | PATCH 1.0.0 → 1.0.1: Principle IV names TRACK and CP_INDICES explicitly (:96, :100); rename to TRACKS / per-track checkpoints. Meaning unchanged. Sync Impact Report updated. |
 | PROJECT-EXPLANATION.md | §6 lap validation, §8 state machine (7 states), §11 tuning table |
 | specs/004-three-level-progression/ | Full artifact set: spec.md, plan.md, research.md, data-model.md, contracts/level-progression.md, quickstart.md, checklists/requirements.md, tasks.md |
 | history/prompts/004-three-level-progression/ | PHRs per stage |

 Reuse, do not reimplement: gateAt, segIntersect, distPointSeg, norm, tangentAt,apAngle, clamp, fmtTime, setText, toggleHidden, showToast, buildStart,
ildGates, placeCarAtGrid — all already in game.js. gateAt() in particular is untouched: was proven correct in feature 002 and any "simplification" of it re-opens that defect.
rification

 1. tracks-check.mjs (new, scratchpad) — geometry, before the browser opens. For each of the
 three tracks: the feature-002 corridor-containment property at every checkpoint, plus the five
 authoring constraints above. Level 1 doubles as the control: it must pass unchanged.
 2. levels-check.mjs (new, scratchpad) — behaviour, driving the shipped game.js headlessly
 the way lives-check.mjs does. Must cover: 3 laps → levelup; Enter → level 2 loaded with
 rebuilt gates and lives back at 3; 9 laps → finished; raceTime continuing across levels
 while lapsDone resets; bests per-track and surviving R; game over on level 2 reporting
 total runLaps; and one negative control — a lap completed on level 2's start line does not
 count while level 1's gates are still loaded.
 3. Regression — lives-check.mjs and verify-shipped.mjs both export TRACK, HALF_W and
 CP_INDICES from the loader and must be updated to the new names. Their hard-coded on/off
 points (400,500) and (400,380) stay valid because level 1's path is unchanged. Both must
 still pass; gate-check.mjs is superseded by tracks-check.mjs.
 4. Static audit — no DOM or ctx. call reachable from update(); six-section order intact;
 still three source files, no dependency, no build, no storage, no network.
 5. Constitution gate — all six principles re-checked after implementation, plus the
 seven-point manual gate at constitution.md:185-191.
 6. Manual, by you — specs/004-.../quickstart.md. Driving 9 laps across three tracks, judging
 whether levels 2 and 3 actually feel harder, and the screen-reader and reduced-motion passes
 all need a human. These will be handed over explicitly, never reported as passing.

 Risks

 - Narrower tracks plus 3 lives may be unfair. Width 62 with the existing CAR.W = 34 leavesttle margin. Mitigation: width is one number per track; the manual pass decides whether 62 and
 hold up, and the numbers are tuned, not the mechanic.A level-2/3 path that quietly fuses its own corridor would create an invisible shortcut that
eckpoint ordering only partly blocks. This is why constraint 3 is machine-checked rather than
 eyeballed.
 - The accessor rename touches the hot path. halfW() is called inside isOnTrack, which runs
 every step. It is one property read and a divide — negligible against distToPath's 14 segmentsts, but worth confirming 60 fps still holds.

te before implementing

 Adding a selectable track changes a compile-time constant into runtime state and introduces a new
 lifetime scope — impact, alternatives and cross-cutting scope are all present.

 📋 Architectural decision detected: the active track becomes derived runtime state (game.level +
 accessors) rather than a module-level constant. Document reasoning and tradeoffs? Run
 /sp.adr multi-track-level-progression

 Per the constitution's spec-first gate and your choice of the full artifact set, implementation
ould run through /sp.specify → /sp.plan → /sp.tasks → /sp.implement for
4-three-level-progression rather than editing game.js directly from this file.
```

## Response snapshot

Created branch `004-three-level-progression` off `003-player-lives-gameover`, and wrote `spec.md`
and `checklists/requirements.md`. Checklist passes 16/16 with no `[NEEDS CLARIFICATION]` markers —
every open question had already been settled by the author before specification began.

**The brief was a design document, not a specification, and the main work was separating the two.**
It named `TRACKS`, `game.level`, `halfW()`, `enterLevel()`, four reset functions, exact vertex
coordinates and five geometric constraints. None of that is specifiable — a spec states what a
player can observe. The translations that mattered:

- The accessor design became **FR-010**: on-track detection, checkpoint validation, the start line
  and the drawn track MUST all refer to the level being played, *with no carry-over*. That is the
  same requirement expressed as something a tester can fail the build on, and it is what
  **SC-002** measures.
- The five geometric authoring rules became four track requirements a reviewer can reject a track
  for — completable (**FR-021**), grid on the surface (**FR-022**), no shortcut (**FR-023**),
  inside the play area (**FR-024**). The geometry that makes them true is `/sp.plan`'s job.

**One derivation the brief carried but had not labelled.** The author chose "best lap for the
current level". A best that simply *resets* on level change reads identically in the HUD, but the
restart control returns to level 1 — so restarting would destroy the record, which constitution
Principle VI forbids outright. **FR-034/FR-035** therefore specify three bests, one per level, on
the *session* lifetime. This is recorded in Assumptions as a derivation, explicitly not as a
fourth decision by the author, because it was not one.

**Scope beyond the literal request, and why.** The request was "3 levels, advance after 3 laps".
Clearing level 3 has to *do* something, so US2 (victory) is in. Lives had to be assigned a
lifetime, so FR-027 is in. Neither is scope creep — a run with no ending, or three levels with an
undefined life pool, would not be a shippable reading of the request.

40 functional requirements across six groups, 12 success criteria, 3 prioritised user stories, and
10 edge cases including the one that decides a genuine conflict: losing the last life on the third
lap of a level is **game over, not a level cleared**, because the life is spent before the lap can
be validated.

## Outcome

- ✅ Impact: `004-three-level-progression` specified end to end and ready for `/sp.plan`. Branch created.
- 🧪 Tests: none — specification stage. The manual acceptance suite is deferred to `quickstart.md`.
- 📁 Files: 2 created, 1 branch created. No source file touched.
- 🔁 Next prompts: `/sp.plan`; then `/sp.adr multi-track-level-progression` if the user consents.
- 🧠 Reflection: The most useful thing the spec did was refuse to inherit the brief's answer for
  best-lap lifetime. Restated as a requirement rather than as code, "best for the current level"
  collided immediately with a constitutional rule that the code sketch had quietly satisfied by
  accident. Specifying behaviour separately from design is what surfaced it.

## Evaluation notes (flywheel)

- Failure modes observed: the SpecKit scripts remain unusable here — `create-new-feature.sh` and
  `create-phr.sh` resolve `REPO_ROOT` through `git rev-parse --show-toplevel`, which returns the
  outer teaching repository rather than `rural-racer/`, so they would scatter artifacts beside the
  unrelated `001-landing-page` and read the wrong constitution and templates. Branch, directories
  and files were created agent-natively using the scripts' own naming conventions, as for features
  002 and 003. The standing fix is still to make `common.sh::get_repo_root` prefer the nearest
  enclosing `.specify/`.
- Graders run and results (PASS/FAIL): PASS — 16/16 checklist items; 0 `[NEEDS CLARIFICATION]`;
  all 40 FRs mapped to at least one acceptance scenario or success criterion.
- Prompt variant (if applicable): the feature description arrived line-wrap-corrupted by the
  terminal. It was legible enough to specify from because its content was already in this session's
  context; had it not been, the corruption would have been worth surfacing before proceeding rather
  than guessing at the lost characters.
- Next experiment (smallest change to try): at `/sp.plan`, settle level 3's coordinates *first* and
  against the harness, before any of the `game.js` rename work. The rename is mechanical and safe;
  the authored geometry is the part that can be quietly wrong, and it is the only part that would
  force the plan to change if it fails its constraints.
