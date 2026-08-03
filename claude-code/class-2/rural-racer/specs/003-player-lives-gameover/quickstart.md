# Quickstart: Player Lives and Game Over

**Feature**: `003-player-lives-gameover` | **Date**: 2026-07-27

## Run it

```
open claude-code/class-2/rural-racer/index.html
```

Double-click the file or drag it into a browser. Nothing to install, nothing to build, no server.
If any of those become necessary, Constitution Principle I has been broken and the change must be
reverted.

Controls: `↑`/`W` gas · `↓`/`S` brake then reverse · `←` `→`/`A` `D` steer · `Enter` start, resume,
or race again · `P`/`Esc` pause · `R` restart.

## Before you start

Feature `002-fix-known-defects` is implemented and proven numerically, but **its manual suite
(`specs/002-fix-known-defects/quickstart.md` Q1–Q11) has not been run.** This feature extends
`game.offTrack` and the state machine that 002 changed. Run at least Q1 (legal laps count), Q7
(boundary recovery) and Q9 (screen reader) first, or a failure here will be ambiguous between the
two features.

## Verification procedure

This project has no test runner, so this procedure **is** the test suite. Record results in the
task or PR.

### L1 — One excursion costs exactly one life · SC-001 · US1

Start a race. Confirm `LIVES` reads **3**. Put the car on the grass once and bring it back.

Repeat with excursions of varying length: a momentary clip of a corner, two seconds in the rough,
and a full minute parked in the grass.

**Pass**: every excursion costs exactly **one** life, whatever its duration. A one-minute stay
costs the same as a momentary clip.
**Fail**: the count drops by more than one, drops repeatedly while off-track, or does not drop.

### L2 — Leaving again costs again · SC-001 · US1

From `LIVES` 2, return fully to the track, then leave again.

**Pass**: the count drops to 1.
**Also check**: driving along the very edge, dipping on and off repeatedly, charges once per
genuine departure — not once per wobble across the boundary while already off-track.

### L3 — Pausing mid-excursion is free · edge case · US1

Drive onto the grass (one life lost), then press `P` while still in the grass. Wait, resume, and
stay in the grass.

**Pass**: no second life is lost. Repeat with a tab switch instead of `P` — the race auto-pauses,
and returning costs nothing.

### L4 — Three excursions end the race · SC-002, SC-003 · US2

Leave the track a third time.

**Pass**: `LIVES` reads 0, the game-over panel appears within **1 second**, driving controls no
longer move the car, and the frozen scene is still visible behind the panel.
**Also check**: two excursions never trigger it. Repeat the whole sequence 10 times.

### L5 — Everything is frozen · SC-004 · US2

With the panel showing, note the lap timer and total time. Wait 30 seconds.

**Pass**: neither has advanced. Pressing `P` or `Esc` does nothing — game over is not pausable.

### L6 — An in-progress lap is not counted · FR-015 · US2

Clear every checkpoint, then — on your last life — drift off the track just before the start line
and cross it.

**Pass**: the lap does **not** count. The panel's laps-completed figure excludes it.

### L7 — Starting again · SC-005, SC-006 · US3

From the panel, press `Enter`.

**Pass**: the usual countdown runs and a fresh race begins with `LIVES` 3, `LAP` 1, and both
timers at zero — **but the best lap from the previous attempt is still shown**.
**Also check**: `R` works from the panel too. Holding `Enter` starts exactly one race, not a
frozen countdown. Restarting mid-race with lives already spent also restores 3.

### L8 — Assistive technology · SC-008 · US5 requirements

With a screen reader running (Narrator, NVDA, VoiceOver):

**Pass**: the current life count is obtainable at any time; losing a life is announced within 2
seconds; entering game over is announced with the result and how to start again.
**Fail**: the count is silent, or announcements repeat every frame rather than once per event.

### L9 — Reduced motion · FR-026

Enable the OS reduce-motion setting and lose a life.

**Pass**: no flash animation, but the count still changes and the announcement still fires — no
information depends on the animation. The game-over panel's backdrop blur is also suppressed.

## Regression checks

Feature 002's behaviour must be intact:

- A full clean lap still counts and the lap timer resets (002 Q1).
- A lap with a checkpoint skipped still does not count (002 Q2).
- Reverse crossing the finish line still does not count (002 Q3).
- Best lap still survives a manual restart (002 Q4).
- The world edge still bounces the car free within ~2 seconds — **and that bounce onto the grass
  correctly costs a life**, since it is an excursion like any other.
- Pause still freezes the world and the clock; alt-tab still leaves no key stuck.
- Total race time still runs continuously across laps.
- The pointer is still hidden while racing — and **visible again on the game-over panel**, which
  is not a racing state.

And the standing constraints:

- No network request (devtools Network tab empty).
- Nothing in storage (Application tab empty); reload clears `BEST` and lives alike.
- 60 fps on integrated graphics, unchanged.
- Four HUD panels on top, `LIVES` and `SPEED` on the bottom row, no layout shift as digits change.
- Resize from very small to very large: the stage keeps its 3:2 ratio and the HUD does not
  overflow.

## Constitutional acceptance gate

Required for any change touching physics, track or lap logic. This feature touches the update
step, so run all seven in addition to L1–L9.

1. A full clean lap counts, and the lap timer resets to zero.
2. A lap with any checkpoint skipped does not count.
3. Crossing the start line backwards does not count.
4. Pause freezes both the world and the clock; resume continues from the same time.
5. Alt-tab mid-throttle returns with no key stuck and the race paused.
6. The car behaves identically at 60 Hz and at a throttled or uncapped frame rate — **including
   the life count**, which must not depend on frame rate.
7. Off-track slows the car without trapping it, and the world edge never pins it.

## Definition of done

- [ ] L1 – L9 all pass.
- [ ] All regression checks pass.
- [ ] All seven constitutional gate items pass.
- [ ] No new file, dependency, build step, storage or network call.
- [ ] `PROJECT-EXPLANATION.md` §8 (game states) and §11 (tuning table) updated.
- [ ] No new DOM write or `ctx.*` call is reachable from `update()`.
