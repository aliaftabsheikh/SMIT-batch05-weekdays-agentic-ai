# Feature Specification: Fix Known Defects

**Feature Branch**: `002-fix-known-defects`
**Created**: 2026-07-27
**Status**: Draft
**Input**: User description: "@PROJECT-EXPLANATION.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Every legal lap is counted (Priority: P1)

A player drives a full lap without ever leaving the track surface, taking whatever line
through each corner they judge fastest. When they cross the finish line, the lap is recorded
and timed.

**Why this priority**: Lap timing is the entire game. Today a player who takes a tight inside
line through the hairpin stays fully on the track but the lap is silently discarded — the lap
counter does not move, the timer does not reset, and nothing explains why. A racing game that
rejects the fastest legal line is not merely imperfect, it is unplayable for its intended
audience, who will naturally converge on exactly that line.

**Independent Test**: Drive twenty laps that stay entirely on the track surface, deliberately
varying the line through every corner from the outermost to the tightest that remains on
track. Every one of the twenty laps must be counted.

**Acceptance Scenarios**:

1. **Given** a player drives a complete lap keeping every part of the car's path on the track
   surface, **When** they cross the finish line in the racing direction, **Then** the lap is
   counted, the lap time is recorded, and the lap timer restarts from zero.
2. **Given** a player takes the tightest possible on-track line through the hairpin, **When**
   they continue to the finish line, **Then** that corner registers as passed and the lap
   counts.
3. **Given** a player cuts a corner by driving across the grass past a corner marker, **When**
   they cross the finish line, **Then** the lap does NOT count and the skipped corner is still
   shown as outstanding.
4. **Given** a player has passed every corner marker in order, **When** they cross the finish
   line travelling backwards, **Then** the lap does NOT count.

---

### User Story 2 - Progress survives a restart (Priority: P2)

A player sets a good lap, then restarts to try again. Their best time for the session is
still displayed and still stands as the target to beat.

**Why this priority**: The best-lap display is the only reason to keep playing. Restart is
advertised on both the title and pause screens as the way to try again, so players press it
constantly. Every press currently erases the record they were chasing, and the next lap they
complete — however slow — is announced as a new best. This turns the scoreboard into noise
and removes the game's only progression loop.

**Independent Test**: Set a lap time, note it, press restart, complete a deliberately slower
lap, and confirm the original best is still shown and the slower lap is not celebrated as a
record.

**Acceptance Scenarios**:

1. **Given** a player has recorded a best lap this session, **When** they restart the race,
   **Then** the best lap remains displayed unchanged.
2. **Given** a player restarts after setting a best lap, **When** they complete a slower lap,
   **Then** that lap is recorded but is NOT announced as a new best.
3. **Given** a player restarts after setting a best lap, **When** they complete a faster lap,
   **Then** the new time replaces the best and IS announced as a new best.
4. **Given** the game detects an internal inconsistency in the car's position, **When** it
   recovers, **Then** the completed lap count and the session best are preserved and the
   player is returned to a drivable position.

---

### User Story 3 - Total race time is visible (Priority: P3)

A player watches how long they have been racing overall, not only their current lap, so they
can measure a session against a target.

**Why this priority**: Total elapsed time is already tracked internally and is required by
the project's design brief, but it is shown nowhere. Players comparing sessions, or setting
themselves a "how many laps in five minutes" goal, have no way to do so. It is real missing
value, but the game remains playable without it, so it ranks below correctness.

**Independent Test**: Start a race, let it run across several laps with a pause in the
middle, and confirm a continuously advancing total is displayed that does not reset at lap
boundaries and does not advance while paused.

**Acceptance Scenarios**:

1. **Given** a race is in progress, **When** the player looks at the interface, **Then** a
   total elapsed race time is displayed alongside the current lap time.
2. **Given** a player completes a lap, **When** the lap timer resets to zero, **Then** the
   total race time continues without interruption.
3. **Given** a race is paused, **When** the player waits, **Then** the total race time does
   not advance; **When** they resume, **Then** it continues from where it stopped.
4. **Given** a player restarts the race, **When** the countdown finishes, **Then** the total
   race time begins again from zero.

---

### User Story 4 - Never stuck, always responsive (Priority: P4)

A player who spins off and ends up against the edge of the world can drive away from it
within a couple of seconds. A player who holds the restart key sees the countdown run and the
race begin.

**Why this priority**: Both are recoverability failures rather than scoring failures. A car
pinned against the world boundary takes roughly fifteen seconds of held throttle to turn
away, and the only quick escape — reversing — is never suggested anywhere. Holding restart
keeps the countdown frozen at three indefinitely. Neither corrupts results, but both read as
the game having crashed, so players abandon the session.

**Independent Test**: Deliberately drive into each of the four world boundaries and confirm
recovery within two seconds using forward controls alone. Separately, hold the restart key
for five seconds and confirm the countdown completes and racing begins.

**Acceptance Scenarios**:

1. **Given** the car is stopped against any world boundary, **When** the player applies
   throttle and steering away from it, **Then** the car regains normal control within two
   seconds.
2. **Given** the car strikes a world boundary at speed, **When** the collision resolves,
   **Then** the car remains inside the world and retains enough momentum to be steerable.
3. **Given** the player presses and holds the restart key, **When** they continue holding it,
   **Then** the countdown runs down once and the race begins without waiting for release.
4. **Given** the player is on the title screen, **When** they press the restart key, **Then**
   the game does not skip past the title screen unannounced.

---

### User Story 5 - Game state is available to assistive technology (Priority: P5)

A player using a screen reader can find out which lap they are on, how long the current lap
has taken, their best time, and the total elapsed time, and is told when a lap completes.

**Why this priority**: Every live readout in the game is currently hidden from assistive
technology, so a screen reader user gets a game surface that announces nothing at all. The
project's own principles require that state a sighted player can read is available to
assistive technology. It ranks below the correctness items only because those affect every
player.

**Independent Test**: Navigate the running game with a screen reader and confirm lap number,
lap time, best time and total time are all obtainable, and that completing a lap produces an
announcement.

**Acceptance Scenarios**:

1. **Given** a race is in progress, **When** a screen reader user queries the interface,
   **Then** current lap, current lap time, best lap time and total race time are all
   available.
2. **Given** a player completes a lap, **When** the on-screen confirmation appears, **Then**
   an equivalent announcement is made to assistive technology.
3. **Given** a player has not yet driven, **When** the controls hint is shown, **Then** the
   same guidance is available to assistive technology.
4. **Given** any overlay is present, **When** the player clicks on the play area, **Then** the
   click still reaches the game.

---

### User Story 6 - Consistent visual presentation (Priority: P6)

A player sees the scene lit consistently as the car turns, and an uncluttered play area while
racing.

**Why this priority**: Pure polish with no functional consequence, so it ranks last. It is
included because both items are small, both are called for by the project's design brief, and
both are noticeable: the car's shadow currently swings around it as it turns, as though the
light source orbits the car, and the mouse pointer sits on the track for the whole race.

**Independent Test**: Drive a full lap and confirm the shadow falls in the same direction at
every heading. Confirm the pointer disappears during racing and returns on the title and
pause screens.

**Acceptance Scenarios**:

1. **Given** the car is at any heading, **When** the player observes the shadow, **Then** it
   falls in the same world direction as at every other heading.
2. **Given** a race is in progress, **When** the player stops moving the mouse, **Then** the
   pointer is hidden over the play area.
3. **Given** the game is on the title or pause screen, **When** the player looks for the
   pointer, **Then** it is visible and usable.

---

### Edge Cases

- A player crosses the finish line at maximum speed: the crossing must still register — the
  car must not pass through the line between two moments without being noticed.
- A player stops with the car resting on the finish line: no further laps are counted while
  stationary.
- A player reverses back over a corner marker they have already passed, then goes forward
  again: progress is unaffected and the corner is not required a second time.
- A player passes a corner marker while off the track surface: the corner does not register.
- A player restarts mid-lap: the in-progress lap is discarded, lap count returns to the start,
  the session best is retained.
- A player switches away from the browser tab mid-lap and returns: the race is paused, no key
  is stuck, and no lap time was lost to the absence.
- A player pauses and restarts from the pause screen rather than resuming.
- A player completes a lap on the exact same time as their best: the earlier time stands and
  no new record is announced.
- A player holds throttle and brake, or left and right, simultaneously: the inputs cancel.
- A player triggers a lap completion while the previous lap confirmation is still on screen:
  the newer confirmation replaces the older one.

## Requirements *(mandatory)*

### Functional Requirements

**Lap validity**

- **FR-001**: The game MUST count a lap when the player has passed every corner marker in
  order and then crossed the finish line in the racing direction.
- **FR-002**: The region that registers a corner marker as passed MUST cover the full width of
  the track at that corner, so that no path lying entirely on the track surface can miss it.
- **FR-003**: The region that registers a corner marker MUST be the same region the player is
  shown, so that what is displayed and what is tested cannot diverge.
- **FR-004**: The game MUST NOT count a lap when any corner marker has been missed.
- **FR-005**: The game MUST NOT count a lap when the finish line is crossed travelling against
  the racing direction.
- **FR-006**: The game MUST register a corner marker only while the car is on the track
  surface.
- **FR-007**: On counting a lap, the game MUST record the lap time, restart the lap timer at
  zero, and require every corner marker to be passed again.

**Session records**

- **FR-008**: Restarting the race MUST preserve the session best lap time.
- **FR-009**: Restarting the race MUST clear the lap count, the current lap time, the total
  race time, and corner-marker progress.
- **FR-010**: The game MUST announce a new best only when the completed lap is strictly faster
  than the existing session best.
- **FR-011**: Internal recovery from an inconsistent car position MUST return the car to a
  drivable position and MUST NOT clear the lap count, the session best, or the total race
  time.
- **FR-012**: The session best MUST be discarded when the page is closed or reloaded; nothing
  is stored between visits.

**Timing display**

- **FR-013**: The interface MUST display the total elapsed race time throughout a race.
- **FR-014**: Total race time MUST advance continuously across lap boundaries and MUST NOT
  reset when a lap completes.
- **FR-015**: Total race time and lap time MUST both stop advancing while the game is paused
  and resume on unpause.
- **FR-016**: All displayed times MUST use a fixed layout width so that changing digits never
  shift the surrounding interface.

**Recovery and responsiveness**

- **FR-017**: A car in contact with a world boundary MUST retain enough control authority to
  drive away from it within two seconds using forward controls alone.
- **FR-018**: The car MUST NOT leave the visible world under any input.
- **FR-019**: Holding the restart key MUST perform exactly one restart; the countdown MUST run
  to completion without requiring the key to be released.
- **FR-020**: The restart key MUST have no effect on the title screen.

**Accessibility**

- **FR-021**: Lap number, current lap time, best lap time and total race time MUST all be
  available to assistive technology while racing.
- **FR-022**: Lap completion MUST be announced to assistive technology, including whether it
  set a new best.
- **FR-023**: The controls guidance MUST be available to assistive technology.
- **FR-024**: Interface overlays MUST NOT intercept clicks intended for the play area.
- **FR-025**: Players who have asked their system to reduce motion MUST NOT be shown
  non-essential animation, in any part of the game.

**Presentation**

- **FR-026**: The car's shadow MUST fall in a fixed world direction independent of the car's
  heading.
- **FR-027**: The mouse pointer MUST be hidden over the play area while racing and visible on
  the title and pause screens.

### Key Entities

- **Lap Record**: A completed lap's elapsed time, and whether it set a session best. Produced
  once per valid lap.
- **Session Record**: The fastest lap time achieved since the page was opened. Survives
  restarts; does not survive a reload.
- **Race Session**: The current attempt — lap count, current lap elapsed time, total elapsed
  time, and how many corner markers have been passed so far. Cleared by restart.
- **Corner Marker**: An ordered gate on the circuit that must be passed, in sequence and on
  the track surface, before a finish-line crossing counts.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Across 20 laps driven entirely on the track surface, deliberately varying the
  line through every corner from the widest to the tightest that stays on track, 20 of 20 are
  counted — zero legal laps rejected.
- **SC-002**: Across 10 laps that each skip at least one corner, 0 are counted — zero illegal
  laps accepted.
- **SC-003**: A session best set before a restart is still displayed after the restart in 100%
  of attempts, and a subsequent slower lap is never announced as a record.
- **SC-004**: Total elapsed race time is visible at all times during a race, is accurate to
  one hundredth of a second, and excludes all paused time.
- **SC-005**: From rest against any of the four world boundaries, a player using only forward
  controls regains normal driving within 2 seconds.
- **SC-006**: Holding the restart key for 5 seconds results in exactly one countdown, which
  completes and begins racing without the key being released.
- **SC-007**: A screen reader user can obtain lap number, current lap time, best lap time and
  total race time at any point during a race, and receives a lap-completion announcement
  within 2 seconds of each valid lap.
- **SC-008**: The car's shadow direction varies by no more than a barely perceptible amount
  across a full 360-degree rotation — an observer cannot identify the car's heading from the
  shadow alone.
- **SC-009**: The pointer is hidden within 1 second of racing beginning and visible within 1
  second of reaching the title or pause screen.
- **SC-010**: The game continues to run from a plain file open, with no installation step and
  no network access, and holds a smooth frame rate on integrated graphics.
- **SC-011**: A player's lap time for an identical driving input is the same on a high
  refresh-rate display as on a standard one, within one hundredth of a second.

## Assumptions

- **Scope interpretation**: The supplied document describes the existing game and closes with
  a list of eight known defects. This specification covers remediation of those eight defects
  and nothing else. It is not a retroactive specification of the whole game, and it adds no
  new gameplay — no additional circuits, opponents, difficulty settings, or lap limits.
- **Total race time excludes paused time**, consistent with how the current-lap timer already
  behaves. A pause is treated as time not raced.
- **Total race time is displayed alongside the existing readouts** in the same interface
  region, not on a separate screen.
- **The session best is memory-only.** It survives restarts within a visit but not a reload,
  because the project's principles forbid introducing storage without a separate decision
  record.
- **Restart discards the in-progress lap.** A partially completed lap has no meaning once the
  car returns to the grid.
- **Internal recovery discards the in-progress lap but keeps everything already earned** — lap
  count, session best and total race time all stand, since only the car's position was
  suspect.
- **A tied lap time does not set a new record.** Only a strictly faster lap is announced.
- **The circuit layout is unchanged.** Corner markers stay at the same four corners; this work
  corrects how they are tested, not where they are.
- **No new dependency, build step, or stored data** is introduced, per the project
  constitution.
- **"Within two seconds" for boundary recovery** means the player can be driving normally
  again, not merely that the car has moved.

## Dependencies

- Governed by the project constitution at `.specify/memory/constitution.md` (v1.0.0). Every
  requirement above must be met without violating Principles I–VI; in particular Principle IV
  ("One Definition Per Fact") directly motivates FR-003, and Principle VI ("Playable by
  Default") motivates FR-021 through FR-027.
- No external systems, services, or teams. The game has no network access, no storage, and no
  third-party components.
- Verification is manual — the project has no automated test runner — and must satisfy the
  seven-point manual acceptance gate defined in the constitution.

## Out of Scope

- New circuits, circuit editing, or changes to the existing circuit layout.
- Opponents, ghosts, or any form of multiplayer.
- Saving times between visits, leaderboards, or any network feature.
- Touch, gamepad, or mouse driving controls.
- Sound.
- Restructuring the game into modules, or adding any build tooling.
