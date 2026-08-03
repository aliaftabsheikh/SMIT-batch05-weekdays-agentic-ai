# Feature Specification: Three-Level Progression

**Feature Branch**: `004-three-level-progression`
**Created**: 2026-07-31
**Status**: Draft
**Input**: User description: *"Now make a 3 levels in this game with 3 different tracks moved to
the next level after 3 laps"*, expanded by the author into a full design brief covering the
track-singleton constraint, the four-scope reset model, per-level bests and the three track
characters. The brief is preserved verbatim in
`history/prompts/004-three-level-progression/0011-specify-three-level-progression.spec.prompt.md`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Three laps clears a level (Priority: P1)

A player starts the game and races the familiar circuit. On completing their third clean lap the
race stops and the game tells them they have cleared level 1. They continue, and find themselves
on a **different track** — a new shape, new corners, a fresh set of lives — with the lap counter
back at one.

**Why this priority**: This is the feature. Everything else is a consequence of a level being
clearable. It is also where the real design risk sits: the track is currently fixed at load time,
so every derived thing the game knows about the world — the start line, the checkpoint gates, what
counts as on-track, where the car spawns — has to be rebuilt at the moment a level changes, and
any one of them left stale silently breaks lap validation on the new track.

**Independent Test**: Drive three valid laps. Confirm the race stops, the game says the level is
cleared, and continuing puts the car on a visibly different track at lap 1 with lives restored.

**Acceptance Scenarios**:

1. **Given** a player is racing level 1, **When** they complete their third valid lap, **Then**
   the race stops and a panel announces the level is cleared.
2. **Given** the level-cleared panel is showing, **When** the player presses the driving controls,
   **Then** the car does not move and no timer advances.
3. **Given** the level-cleared panel is showing, **When** the player presses the key it advertises,
   **Then** the next level begins from its own starting grid with the usual countdown.
4. **Given** level 2 has begun, **When** the player looks at the play area, **Then** the track is a
   different shape from level 1 and the car is on it, not on the grass.
5. **Given** level 2 has begun, **When** the player looks at the interface, **Then** the lap
   counter reads lap 1 of 3 and lives are back to three.
6. **Given** the player is racing level 2, **When** they complete three valid laps, **Then** level
   3 becomes available the same way.
7. **Given** a level has been cleared, **When** the player races the next one, **Then** lap
   validation works on the new track — a clean lap counts and a lap with a checkpoint skipped does
   not.
8. **Given** the level-cleared panel is showing, **When** the player presses pause, **Then**
   nothing happens.

---

### User Story 2 - Clearing all three levels wins the run (Priority: P2)

A player who clears level 3 does not simply get a fourth track. The game ends in victory, tells
them how long the whole run took and what their best lap was on each of the three tracks, and
offers to start again.

**Why this priority**: It gives the game an ending. A player who reaches level 3's third lap and
receives nothing has been told the game has three levels and then denied the third one's reward.
It ranks below US1 only because it cannot be built or tested until levels advance at all.

**Independent Test**: Clear all three levels. Confirm a victory panel appears instead of a fourth
track, reports the run, and starts a fresh run from level 1 on the advertised key.

**Acceptance Scenarios**:

1. **Given** the player is racing level 3, **When** they complete their third valid lap, **Then** a
   victory panel appears and no fourth level is offered.
2. **Given** the victory panel is showing, **When** the player reads it, **Then** it states the run
   is complete, shows the total time for the whole run and the best lap on each of the three
   levels, and says how to start again.
3. **Given** the victory panel is showing, **When** the player presses the driving controls or
   pause, **Then** nothing happens and no timer advances.
4. **Given** the victory panel is showing, **When** the player presses the key it advertises,
   **Then** a fresh run begins at level 1 with the usual countdown.
5. **Given** the player runs out of lives on level 2, **When** the game-over panel appears, **Then**
   it reports the level they reached and the laps they completed across the whole run — not a
   victory.

---

### User Story 3 - Knowing where you are in the run (Priority: P3)

At a glance while driving, the player can see which level they are on, how many of the level's
three laps they have done, and the best lap for the track they are actually on — not a time set on
a different track that means nothing here.

**Why this priority**: Progress the player cannot see is progress they do not have. It ranks last
because a player can infer the level from the track shape and the lap from the toast, so US1 and
US2 remain demonstrable without it — but the feature is not finished without it.

**Independent Test**: While racing, read the level and lap readouts and confirm they match reality
at every point of a nine-lap run. Set a best lap on level 1, advance, and confirm the best shown on
level 2 is level 2's, then return to level 1 by restarting and confirm level 1's best is still
there.

**Acceptance Scenarios**:

1. **Given** the player is racing, **When** they look at the interface, **Then** the current level
   and the total number of levels are both shown.
2. **Given** the player is racing, **When** they look at the interface, **Then** the current lap
   and the number of laps needed to clear the level are both shown.
3. **Given** the player has set a best lap on level 1 and advanced to level 2, **When** they look
   at the best-lap readout, **Then** it shows level 2's best — not level 1's.
4. **Given** the player has not yet completed a lap on the current level, **When** they look at the
   best-lap readout, **Then** it shows the empty placeholder, not another level's time.
5. **Given** the player has set best laps and then restarts the run, **When** they race level 1
   again, **Then** the best lap they previously set on level 1 is still shown and still stands.
6. **Given** the player is on any level, **When** they look at the total-time readout, **Then** it
   shows elapsed time for the whole run so far, continuing across level changes rather than
   restarting at each one.
7. **Given** a level change occurs, **When** the interface updates, **Then** the level's name is
   shown to the player at least once so the tracks are distinguishable by more than shape.

---

### Edge Cases

- The player loses their last life on the third lap of a level: the run is over. Game over wins
  over level-cleared — the life was lost before the lap could be validated.
- The player completes the third lap of level 3 and the last life is lost on the same moment:
  the same rule applies; running out of lives ends the run without victory.
- The player restarts manually mid-run on level 3: the run starts again at level 1, because
  restart has always meant "start this attempt over" and the attempt is the whole run.
- The player pauses on level 2 and resumes: they resume on level 2, at the same lap and time.
- The player switches tabs mid-run: the race auto-pauses as it does today; nothing about level
  progress changes.
- A level change happens while the car is off the track: the new level places the car on its own
  starting grid, on the track, so the excursion does not carry over and costs nothing on arrival.
- The player's best lap on a level is beaten on a later attempt at that same level: the better time
  replaces it. A worse time never does.
- The player reloads the page: everything resets, including every level's best lap.
- A level is cleared and the player never presses the advertised key: the game waits indefinitely.
  Nothing advances on a timer.
- Two levels have the same best lap time: both are shown; no tie-breaking is needed.

## Requirements *(mandatory)*

### Functional Requirements

**Levels and progression**

- **FR-001**: The game MUST have exactly three levels, each with its own distinct track.
- **FR-002**: Every run MUST begin at level 1.
- **FR-003**: Completing three valid laps on a level MUST clear that level.
- **FR-004**: A lap MUST only count toward clearing a level if it is valid by the existing rules —
  all checkpoints passed in order, crossed in the racing direction.
- **FR-005**: Clearing a level other than the last MUST stop the race and present a panel stating
  the level is cleared and how to continue.
- **FR-006**: Continuing from a cleared level MUST be player-initiated by a single key press, never
  automatic after a delay.
- **FR-007**: Beginning a level MUST start the car on that level's own starting grid, on that
  level's track, facing that level's racing direction, and MUST use the same countdown as any other
  race start.
- **FR-008**: Beginning a level MUST reset the lap counter, the lap timer and checkpoint progress
  for that level.
- **FR-009**: Beginning a level MUST restore lives to three.
- **FR-010**: On-track detection, checkpoint validation, the start/finish line and the drawn track
  MUST all refer to the level currently being played, with no carry-over from a previous level.
- **FR-011**: While a cleared-level panel is showing, the car MUST NOT respond to driving input,
  the world MUST be frozen, both timers MUST stop, and the pause control MUST have no effect.

**Winning the run**

- **FR-012**: Clearing the third level MUST end the run in victory rather than starting a fourth
  level.
- **FR-013**: Victory MUST present a panel stating the run is complete and how to start again.
- **FR-014**: The victory panel MUST report the total time for the whole run and the best lap
  achieved on each of the three levels.
- **FR-015**: While the victory panel is showing, the car MUST NOT respond to driving input, the
  world MUST be frozen, both timers MUST stop, and the pause control MUST have no effect.
- **FR-016**: From victory the player MUST be able to begin a fresh run at level 1 with a single
  key press.
- **FR-017**: Running out of lives MUST end the run at whatever level it happens on, without
  victory, and the game-over panel MUST report the level reached and the laps completed across the
  whole run.

**Track design**

- **FR-018**: Level 1's track MUST be the game's existing circuit, unchanged.
- **FR-019**: Levels 2 and 3 MUST be new tracks, each visually and structurally distinct from the
  others, so a player can tell at a glance which level they are on.
- **FR-020**: Each level MUST be harder to drive cleanly than the one before it.
- **FR-021**: Every track MUST be completable: it MUST be possible to drive a valid lap on it
  without leaving the track surface.
- **FR-022**: Every track MUST place its starting grid on the track surface, so a level never
  begins with the car in the rough.
- **FR-023**: No track may contain a route that lets the player reach the finish line having
  travelled less than the intended circuit while remaining on the track surface the whole way.
- **FR-024**: Every track MUST fit entirely within the play area, with no part of the driveable
  surface outside it.
- **FR-025**: Every track MUST carry a name that identifies it to the player.

**Lives, restart and timing**

- **FR-026**: Lives MUST continue to work exactly as they do today within a level: three per level,
  one spent per excursion off the track.
- **FR-027**: Lives MUST NOT carry over between levels; each level starts with three regardless of
  how the previous one ended.
- **FR-028**: The manual restart control MUST return the player to level 1 and start the run over.
- **FR-029**: Total run time MUST accumulate continuously across all levels of a run and MUST NOT
  reset at a level change.
- **FR-030**: Total run time MUST reset when a new run begins.

**Readouts**

- **FR-031**: The current level and the total number of levels MUST be visible throughout a race.
- **FR-032**: The current lap and the number of laps required to clear the level MUST be visible
  throughout a race.
- **FR-033**: The best-lap readout MUST show the best lap for the level currently being played.
- **FR-034**: A best lap MUST be recorded per level, and a level's best MUST only be replaced by a
  faster time on that same level.
- **FR-035**: Every level's best lap MUST survive restarting the run and MUST only be cleared by
  reloading the page.
- **FR-036**: The name of the level being entered MUST be shown to the player at the level change.

**Accessibility**

- **FR-037**: The current level, the lap progress within the level and the current level's best lap
  MUST all be available to assistive technology.
- **FR-038**: Clearing a level and completing the run MUST each be announced to assistive
  technology, together with how to proceed.
- **FR-039**: Any animation introduced by this feature MUST be suppressed for players who have
  asked their system to reduce motion.
- **FR-040**: Changing level or lap readouts MUST NOT shift the surrounding interface.

### Key Entities

- **Level**: One stage of a run. Has a number (1–3), a name, and exactly one track. Cleared by
  completing the required number of valid laps on it.
- **Track**: The driveable circuit for one level — its shape, its width, its start/finish line and
  its ordered checkpoints. Determines what counts as on-track for the level being played.
- **Run**: One attempt at the whole game, from level 1 until either victory or running out of
  lives. Owns the total time and the count of laps completed across all levels.
- **Level Best**: The fastest valid lap recorded on one particular level. There are three, one per
  level. They belong to the browsing session, not to a run — restarting does not clear them.
- **Session**: Everything that lives for as long as the page is open. Cleared only by reloading.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Three valid laps clear a level and two never do, across 10 trials on each of the
  three levels — 0 early advances and 0 missed advances.
- **SC-002**: After every level change, a valid lap on the new track is recognised and a lap with a
  checkpoint skipped is rejected, in 100% of trials. No level ever validates laps against a
  previous level's layout.
- **SC-003**: Every level begins with the car on the track surface, at lap 1 of 3, with three
  lives, in 100% of level starts.
- **SC-004**: A full nine-lap run reaches the victory panel, and the panel's total time matches the
  elapsed time of the run from the first countdown to the last lap.
- **SC-005**: With any cleared-level or victory panel showing, no timer advances and the car does
  not move over a 30-second observation.
- **SC-006**: Each level's best lap is preserved across a restart of the run in 100% of attempts,
  and the best-lap readout never shows a time set on a different level.
- **SC-007**: A player who has not seen the game before can tell which level they are on and how
  many laps remain, without being told where to look.
- **SC-008**: Levels 2 and 3 each take a typical player more attempts to clear than the level
  before, confirming the difficulty ordering.
- **SC-009**: Every level's track can be driven for three consecutive laps without leaving the
  track surface, demonstrating each is completable.
- **SC-010**: A screen reader user can obtain the current level and lap progress at any time, and
  is told within 2 seconds when a level is cleared and when the run is complete.
- **SC-011**: The game holds a smooth frame rate on integrated graphics on all three levels,
  unchanged from before this feature.
- **SC-012**: The game still runs from a plain file open, with no installation step and no network
  access.

## Assumptions

The author made four decisions explicitly on 2026-07-31; they are recorded here as settled, not as
open questions.

- **Lives refill to three at the start of every level — CONFIRMED by the author.** A single pool
  of three across all nine laps was considered and rejected as too punishing for a game whose
  tracks get narrower.
- **The best-lap readout is per level — CONFIRMED by the author.** One global best across three
  differently-shaped tracks compares times that are not comparable.
- **A per-level best still belongs to the session, not the run.** This is a derivation, not a
  separate decision: the constitution forbids restart from destroying session records
  (`.specify/memory/constitution.md`, Principle VI), and restart returns to level 1, so a best that
  reset on level change would be destroyed by restarting. Three bests are therefore kept for as
  long as the page is open.
- **Difficulty rises through layout and a narrowing track — CONFIRMED by the author.** Level 1 keeps
  today's width; levels 2 and 3 are progressively narrower as well as more technical.
- **Three laps per level and three levels are fixed**, with no difficulty setting and no way to
  change either in game.
- **There is no level select.** Levels are reached by clearing the previous one; the run always
  starts at level 1.
- **Restart means restart the run.** The existing restart control already meant "start this attempt
  over"; with levels, the attempt is the whole run.
- **Total time spans the run.** It is the natural reading of a run with an ending, and it gives the
  victory panel something to report.
- **Nothing is stored between visits** — no completed levels, best laps or results — consistent
  with the project's no-persistence constraint.
- **Level 1's track is untouched**, so it doubles as a control: any lap-validation regression on
  level 1 is a defect introduced by this feature and not by a new track.
- **No new sound, music or per-level colour theme** is introduced. Levels are distinguished by
  layout, width and name.

## Dependencies

- Builds on `002-fix-known-defects` (checkpoint gate geometry, reset scopes, world-edge recovery)
  and `003-player-lives-gameover` (lives, the game-over state, the render-side announcement
  pattern). This feature extends both.
- **Neither prerequisite's manual acceptance procedure has been run.** `002`'s `quickstart.md`
  Q1–Q11 and `003`'s L1–L9 are both still outstanding, so this feature is being specified against
  code that is verified numerically but not yet verified by hand.
- Governed by the project constitution (`.specify/memory/constitution.md` v1.0.0). Principle IV —
  one definition per fact — names the track constants directly, so making the track selectable
  requires a wording amendment to the constitution in the same change.
- No external systems, services or teams. No network, no storage, no third-party components.
- Verification is manual; the project has no automated test runner.

## Out of Scope

- A level select, level skip, or any way to reach a level without clearing the one before it.
- Saving progress, completed levels or best laps between visits.
- More than three levels, or a configurable number of levels or laps.
- Difficulty settings, or any in-game way to change lives, laps or track width.
- Per-level colour themes, weather, scenery or music.
- Changes to the handling model, the off-track penalty, or how lives are spent within a level.
- An AI opponent, ghost car, multiplayer or race positions.
- Scores, leaderboards or medals.
- Sound.
