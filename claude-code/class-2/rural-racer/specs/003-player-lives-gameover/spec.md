# Feature Specification: Player Lives and Game Over

**Feature Branch**: `003-player-lives-gameover`
**Created**: 2026-07-27
**Status**: Draft
**Input**: User description: "Now add this new functionality the opponent has 3 lives if they out from the track deduct 1 live and if all 3 lives end show the popup gameover and start again !"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Leaving the track costs a life (Priority: P1)

A player starts a race with three lives showing. They run wide at a corner and put the car on the
grass — the count drops to two. They recover, drive on, and later slide off again — the count
drops to one.

**Why this priority**: Without a visible, correctly decremented life count there is no feature.
Every other part of this work is a consequence of the count reaching zero. It is also the part
with the real design risk: leaving the track is a *continuous* condition, so a naive reading
would charge a life on every frame in the grass and end the race in a fraction of a second.

**Independent Test**: Start a race and confirm three lives are shown. Put the car on the grass
once and confirm exactly one life is lost, no matter how long it stays there. Return to the
track, leave again, and confirm exactly one more is lost.

**Acceptance Scenarios**:

1. **Given** a race has just begun, **When** the player looks at the interface, **Then** three
   lives are shown.
2. **Given** the car is on the track, **When** any part of the car's path leaves the track
   surface, **Then** exactly one life is deducted and the new count is shown immediately.
3. **Given** the car has left the track and one life has been deducted, **When** the car stays
   off the track for ten seconds, **Then** no further life is deducted.
4. **Given** the car has returned to the track after an excursion, **When** it leaves the track
   again, **Then** one more life is deducted.
5. **Given** the car is off the track, **When** the player observes handling, **Then** the
   existing off-track behaviour — heavier drag, lower top speed, dust, the on-screen cue —
   is unchanged.
6. **Given** the game is paused or on the title screen, **When** time passes, **Then** no life
   is deducted.

---

### User Story 2 - Running out of lives ends the race (Priority: P2)

A player on their last life goes off the track once more. The race stops and a game-over panel
appears, telling them the race is over and showing how they did.

**Why this priority**: This is the point of the lives — a consequence for repeated mistakes. It
cannot be built or tested before US1, but it is what turns a counter into a game.

**Independent Test**: Deliberately leave the track three times. On the third, confirm the race
stops, the panel appears, the car no longer responds to the controls and every timer has frozen.

**Acceptance Scenarios**:

1. **Given** the player has one life left, **When** the car leaves the track, **Then** the count
   reaches zero and the game-over panel appears.
2. **Given** the game-over panel is showing, **When** the player presses the driving controls,
   **Then** the car does not move.
3. **Given** the game-over panel is showing, **When** the player waits thirty seconds, **Then**
   neither the lap timer nor the total race time has advanced.
4. **Given** the game-over panel is showing, **When** the player reads it, **Then** it states
   the race is over, shows laps completed and best lap, and says how to start again.
5. **Given** a lap was in progress when the last life was lost, **When** the game-over panel
   appears, **Then** that incomplete lap is not counted.
6. **Given** the game-over panel is showing, **When** the player presses pause, **Then** nothing
   happens — game over is not a pausable state.

---

### User Story 3 - Starting again after game over (Priority: P3)

From the game-over panel the player starts a fresh race with a single key press: three lives
back, lap counter back to one, timers back to zero — but their best lap of the session still
standing as the target to beat.

**Why this priority**: The loop has to close or the player must reload the page. It ranks last
only because it is the smallest step and depends on US2 existing.

**Independent Test**: Reach game over, press the advertised key, and confirm a fresh race begins
with three lives, lap one, zeroed timers, and the previous best lap still displayed.

**Acceptance Scenarios**:

1. **Given** the game-over panel is showing, **When** the player presses the key it advertises,
   **Then** a new race begins from the grid with the usual countdown.
2. **Given** a new race has begun after game over, **When** the player looks at the interface,
   **Then** lives are back to three, the lap counter reads one, and both timers read zero.
3. **Given** the player set a best lap before running out of lives, **When** they start again,
   **Then** that best lap is still shown and still stands as the target.
4. **Given** the player restarts mid-race with lives already spent, **When** the new race
   begins, **Then** lives are restored to three.

---

### Edge Cases

- The car leaves the track and returns within a fraction of a second: exactly one life, not zero
  and not two.
- The car clips a corner so briefly that the excursion spans a single moment: still one life.
- The car is bounced onto the grass by the world boundary: that is leaving the track, and costs a
  life like any other excursion.
- The player pauses while off the track, then resumes: no additional life is charged, because it
  is still the same excursion.
- The player switches browser tabs while off the track — which pauses the race — then returns:
  again no additional charge.
- The last life is lost at the same moment the car would have crossed the finish line: the lap
  does not count, because the car was off the track and off-track already prevents a lap from
  being validated.
- The player runs out of lives while the car is deep in the grass: game over still occurs, with
  the car resting where it stopped.
- The player never leaves the track: the race continues indefinitely. There is no lap limit and
  none is introduced.
- The player restarts manually with one life left: the new race has three.
- The player reloads the page after game over: everything resets, including the best lap.

## Requirements *(mandatory)*

### Functional Requirements

**Lives**

- **FR-001**: Every race MUST begin with exactly three lives.
- **FR-002**: The number of lives remaining MUST be visible throughout a race.
- **FR-003**: The game MUST deduct exactly one life when the car leaves the track surface.
- **FR-004**: A single continuous excursion off the track MUST cost exactly one life regardless
  of how long it lasts or how far the car travels.
- **FR-005**: Returning to the track surface and leaving it again MUST cost one further life.
- **FR-006**: No life MUST be deducted while the game is not actively racing — that includes the
  title screen, the countdown, a paused race, and game over.
- **FR-007**: The existing off-track consequences — heavier drag, reduced top speed, dust, and
  the on-screen off-track cue — MUST remain exactly as they are. Lives are added on top of that
  behaviour, not in place of it.
- **FR-008**: The life count MUST never display or fall below zero.
- **FR-009**: Losing a life MUST be signalled to the player at the moment it happens, distinctly
  enough to be noticed while driving.

**Game over**

- **FR-010**: When the last life is lost the game MUST enter a game-over state.
- **FR-011**: Game over MUST present a panel stating that the race is over and how to start
  again.
- **FR-012**: The game-over panel MUST show the result of the attempt: laps completed and best
  lap time.
- **FR-013**: In game over the car MUST NOT respond to driving input and the world MUST be
  frozen.
- **FR-014**: In game over the lap timer and the total race time MUST both stop advancing.
- **FR-015**: A lap in progress when game over occurs MUST NOT be counted.
- **FR-016**: Game over MUST NOT be pausable, and the pause control MUST have no effect there.

**Starting again**

- **FR-017**: From game over the player MUST be able to begin a new race with a single key press.
- **FR-018**: Beginning a new race MUST restore three lives, return the car to the grid, reset
  the lap counter, the lap timer and the total race time, and clear checkpoint progress.
- **FR-019**: Beginning a new race MUST preserve the session best lap time.
- **FR-020**: A new race started from game over MUST begin with the same countdown as any other
  race start.
- **FR-021**: The existing manual restart control MUST also restore three lives.
- **FR-022**: Lives MUST NOT be remembered between visits; closing or reloading the page starts
  a fresh session.

**Accessibility**

- **FR-023**: The number of lives remaining MUST be available to assistive technology.
- **FR-024**: Losing a life MUST be announced to assistive technology.
- **FR-025**: Entering game over MUST be announced to assistive technology, together with the
  result and how to start again.
- **FR-026**: Any animation introduced by this feature MUST be suppressed for players who have
  asked their system to reduce motion.

### Key Entities

- **Lives**: How many excursions the player has left in the current race. Starts at three,
  decreases by one per excursion, never below zero. Cleared and restored by starting a race.
- **Excursion**: One continuous period spent off the track surface. Begins when the car leaves
  the track, ends when it returns. Exactly one life is charged per excursion, at its start.
- **Race Result**: What the game-over panel reports — laps completed and best lap time for the
  attempt that just ended.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Across 20 excursions of varying duration, from a momentary clip to a full minute
  in the grass, each costs exactly one life — 0 over-charges and 0 missed charges.
- **SC-002**: Three excursions always produce game over, and two never do, across 10 trials.
- **SC-003**: The game-over panel appears within 1 second of the third excursion beginning.
- **SC-004**: With the game-over panel showing, no timer advances over a 30-second observation.
- **SC-005**: Starting again yields three lives, lap one and zeroed timers in 100% of attempts.
- **SC-006**: The session best lap survives game over and the subsequent restart in 100% of
  attempts.
- **SC-007**: The life count is legible while driving and changing it never shifts the
  surrounding interface.
- **SC-008**: A screen reader user can obtain the current life count at any time, and is told
  within 2 seconds when a life is lost and when the race ends.
- **SC-009**: The game holds a smooth frame rate on integrated graphics, unchanged from before
  this feature.
- **SC-010**: The game still runs from a plain file open, with no installation step and no
  network access.

## Assumptions

- **"The opponent" means the player's car — CONFIRMED by the author on 2026-07-27**: *"Mistakenly
  using opponent word it's a single user game."* Rural Racer is a single-player time trial with no
  opponent, and feature `002-fix-known-defects` explicitly placed opponents, ghosts and
  multiplayer out of scope. The description was also only self-consistent under this reading: an
  *opponent* exhausting its lives would be the player's win, not a game over. This specification
  gives the player three lives. No AI rival, second vehicle or race positions are in scope.
- **One life per excursion, charged when the car leaves the track.** Charging per frame or per
  second would end a race in a fraction of a second and is clearly not the intent.
- **Losing a life does not reposition the car.** The player keeps driving from where they are.
  The existing drag and speed penalties already make staying in the grass costly.
- **The off-track penalty is unchanged.** Lives are an added consequence, not a replacement.
- **Starting again is player-initiated.** The panel waits for a key press rather than restarting
  on a timer, which would take control away at the moment the player wants to read their result.
- **The session best lap survives game over**, consistent with the existing rule that restarting
  preserves it. Only a page reload clears it.
- **Nothing is stored between visits** — no saved lives, results or history — consistent with the
  project's no-persistence constraint.
- **No lap limit is introduced.** A race ends by running out of lives or by restarting; a player
  who never leaves the track can drive indefinitely, as today.
- **Game over is a distinct game state**, alongside the existing title, countdown, racing and
  paused states.
- **Three lives is fixed**, with no difficulty setting or in-game way to change it.

## Dependencies

- Builds directly on `002-fix-known-defects`: this feature reuses that work's off-track
  detection and extends its state machine and reset scopes. **That feature is implemented but
  its manual acceptance procedure (`quickstart.md` Q1–Q11) has not yet been run**, so this
  feature is being specified against code that is verified numerically but not yet verified by
  hand.
- Governed by the project constitution (`.specify/memory/constitution.md` v1.0.0). In particular
  Principle IV means lives must have a single owner and a single lifetime, and Principle VI means
  the count and both new events must reach assistive technology.
- No external systems, services or teams. No network, no storage, no third-party components.
- Verification is manual; the project has no automated test runner.

## Out of Scope

- An AI opponent, ghost car, or any second vehicle — despite the wording of the request. See the
  first assumption.
- Multiplayer of any kind.
- Configurable difficulty or a settable number of lives.
- Extra lives, pickups, or any way to regain a life mid-race.
- Scores, leaderboards, or saving results between visits.
- Lap limits, race lengths, or a win condition. The only race-ending condition added here is
  running out of lives.
- Changes to the handling model, the circuit, or lap validation.
- Sound.
