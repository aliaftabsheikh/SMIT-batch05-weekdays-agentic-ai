# Quickstart: Fix Known Defects

**Feature**: `002-fix-known-defects` | **Date**: 2026-07-27

## Run it

```
open claude-code/class-2/rural-racer/index.html
```

Double-click the file, or drag it into a browser. There is nothing to install, nothing to
build and no server to start — if any of those become necessary, Constitution Principle I has
been broken and the change must be reverted.

Controls: `↑`/`W` gas · `↓`/`S` brake then reverse · `←` `→`/`A` `D` steer · `Enter` start or
resume · `P`/`Esc` pause · `R` restart.

## Reproduce the defects before fixing them

Confirm each is real on the current code, so the fix is verifiable rather than assumed.

| # | Defect | How to see it now |
|---|---|---|
| 1 | Legal lap rejected | Drive the hairpin (bottom-left) on the tightest line that stays on dirt. Its gate stays yellow instead of turning green; the lap never counts. |
| 2 | Restart erases the record | Set a lap, press `R`, look at `BEST` — it reads `--:--`. |
| 3 | Pinned at the world edge | Spin off left at the hairpin into the boundary. Hold gas and steer — it takes roughly fifteen seconds to turn away. |
| 4 | Countdown frozen | Hold `R`. The countdown sits at `3` until you let go. |
| 5 | No total timer | Look for total elapsed race time anywhere. There isn't one. |
| 6 | Shadow orbits the car | Drive the bottom straight rightwards, then the top leftwards. The shadow flips side. |
| 7 | Silent to screen readers | Run a screen reader over the HUD. Nothing is announced. |
| 8 | Pointer on the track | Move the mouse over the play area mid-race. The cursor sits there. |

## Verification procedure

Run every step after implementation. Record the result in the task or PR — this project has no
test runner, so this procedure **is** the test suite.

### Q1 — No legal lap is rejected · SC-001 · US1

Drive **20 laps** that stay entirely on the dirt, deliberately varying the line through every
corner from the widest to the tightest that remains on track. Pay particular attention to the
hairpin and to the two shallow corners at vertices 9 and 6, which the old drawn gate also
under-spanned.

**Pass**: 20 of 20 counted. Every gate turns green as it is passed.
**Fail**: any lap where the car never left the dirt but the lap did not count.

### Q2 — No illegal lap is accepted · SC-002 · US1

Drive **10 laps** that each cut at least one corner across the grass, past a gate.

**Pass**: 0 of 10 counted. The skipped gate stays yellow.

### Q3 — Reverse crossing rejected · FR-005 · US1

Clear every gate, then reverse back over the start/finish line.

**Pass**: no lap counted, no toast.

### Q4 — Records survive restart · SC-003 · US2

Set a lap time. Press `R`. Confirm `BEST` still shows it. Complete a **slower** lap.

**Pass**: `BEST` unchanged; the slower lap is recorded but not announced as a record. Then
complete a **faster** lap — `BEST` updates and "NEW BEST!" appears.
**Also check**: a lap that ties the best exactly does not announce a record.

### Q5 — Recovery preserves earned state · FR-011 · US2

Force the guard from the browser console mid-race, after at least one completed lap:

```js
game.car.x = NaN
```

**Pass**: the car returns to the grid; `LAP`, `BEST` and `TOTAL` are all unchanged; the
in-progress lap timer and gate progress restart.
**Fail**: any of `LAP`, `BEST` or `TOTAL` resets.

### Q6 — Total race time · SC-004 · US3

Race across several laps, pausing in the middle for ten seconds.

**Pass**: `TOTAL` is visible throughout, does not reset when a lap completes, does not advance
while paused, resumes on unpause, and restarts from zero after `R`. Digits changing never shift
the surrounding panels.

### Q7 — Boundary recovery · SC-005 · US4

Drive into each of the four world boundaries — head-on and at a glancing angle.

**Pass**: from rest against any boundary, forward controls alone restore normal driving within
**2 seconds**. After a fast impact the car retains steerable momentum. The car never leaves the
visible world.

### Q8 — Held restart key · SC-006 · US4

Hold `R` for five seconds without releasing.

**Pass**: exactly one countdown, which runs `3 · 2 · 1 · GO!` and begins racing without the key
being released. Separately, press `R` on the title screen — nothing happens.

### Q9 — Assistive technology · SC-007 · US5

With a screen reader running (Narrator, NVDA, VoiceOver), query the interface mid-race.

**Pass**: lap number, current lap time, best lap and total race time are all obtainable; the
controls hint is readable; completing a lap produces an announcement within 2 seconds that
includes whether it set a record.
**Fail**: any live readout silent, or the HUD announcing continuously (it must be queryable,
not a live region).
**Also check**: clicking anywhere on the play area still reaches the game.

### Q10 — Gates derive from the path · FR-003 · Principle IV

Temporarily move a checkpoint vertex in `TRACK.path` and reload.

**Pass**: the drawn gate and the tested gate move together, with no other edit. Restore the
original coordinates afterwards.

### Q11 — Presentation · SC-008, SC-009 · US6

**Pass**: the shadow falls in the same direction at every heading — an observer cannot tell
which way the car faces from the shadow alone. The pointer is hidden over the play area within
1 second of racing beginning, and visible again within 1 second of reaching the title or pause
screen.

## Constitutional acceptance gate

The constitution requires these seven for **any** change touching physics, track or lap logic.
Run them in addition to Q1–Q11.

1. A full clean lap counts and the lap timer resets to zero.
2. A lap with any checkpoint skipped does not count.
3. Crossing the start line backwards does not count.
4. Pause freezes both the world and the clock; resume continues from the same time.
5. Alt-tab mid-throttle returns with no key stuck and the race paused.
6. The car behaves identically at 60 Hz and at a throttled or uncapped frame rate (SC-011 —
   throttle the frame rate in devtools and compare a lap driven with identical inputs).
7. Off-track slows the car without trapping it, and the world edge never pins it.

## Regression checks

- Reduced motion: enable the OS setting and confirm dust, the countdown pop, the toast slide
  and the hint fade are all suppressed (FR-025).
- Dark mode: confirm the page chrome still adapts.
- Resize the window from very small to very large: the stage keeps its 3:2 ratio and stays
  crisp on a HiDPI display.
- Confirm no network request is made — devtools Network tab stays empty (Additional
  Constraints).
- Confirm nothing is written to storage — Application tab shows no keys (FR-012). Reload and
  confirm `BEST` is back to `--:--`.
- Frame rate holds at 60 fps on integrated graphics.

## Definition of done

- [ ] Q1 – Q11 all pass.
- [ ] All seven constitutional gate items pass.
- [ ] All regression checks pass.
- [ ] `CP_RADIUS` no longer exists anywhere in the source.
- [ ] `PROJECT-EXPLANATION.md` §10 rewritten — it must not still describe fixed defects.
- [ ] No new file, dependency, build step, storage or network call was introduced.
