# Quickstart: Manual Acceptance — Three-Level Progression

**Feature**: `004-three-level-progression` | **Date**: 2026-07-31

**How to run**: open `index.html` in a browser. No server, no build, no install. Controls:
`↑/W` gas · `↓/S` brake · `←→/AD` steer · `P` or `Esc` pause · `R` restart · `Enter` confirm.

This procedure closes what the harnesses cannot. **Steps marked 🧍 require a human and MUST NOT be
reported as passing on the strength of a numeric result.**

Record each step PASS / FAIL / SKIPPED with a note. A SKIPPED step is not a pass.

---

## Part A — Clearing levels (US1)

### L1 · Three laps clears level 1
Drive three clean laps of Meadow Loop.

- [ ] After lap 1 the toast reads `LAP 1` and `LAP` shows `2/3`
- [ ] After lap 2, `LAP` shows `3/3`
- [ ] On lap 3 the race **stops**, the level-cleared panel appears and names the level
- [ ] The panel says how to continue

### L2 · The world is frozen on the panel
With the level-cleared panel showing:

- [ ] Hold gas for 10 s — the car does not move
- [ ] `TIME` and `TOTAL` do not advance
- [ ] Press `P` and `Esc` — nothing happens

### L3 · Advancing loads a genuinely different track
Press `Enter`.

- [ ] The countdown runs, then Mill Creek appears — **visibly a different shape**
- [ ] The car is **on the track**, not in the grass
- [ ] `LEVEL` reads `2/3`, `LAP` reads `1/3`, `LIVES` reads `3`
- [ ] `TOTAL` **continued** from where level 1 ended; it did **not** reset

### L4 · Lives refill even after a bad level
Lose two lives on level 2 (leave the track twice), then clear the level.

- [ ] `LIVES` shows `1` before clearing
- [ ] After advancing to level 3, `LIVES` is back to `3`

### L5 · Lap validation works on the new track — **the dangerous case**
On level 2:

- [ ] A clean lap counts
- [ ] Deliberately cut a checkpoint (drive past a yellow gate without crossing it) — the lap does **NOT** count
- [ ] The gate markers are drawn **on Mill Creek's corners**, not floating where level 1's were
- [ ] Repeat both on level 3

### L6 · All three tracks are driveable 🧍
- [ ] Three consecutive laps on level 2 without leaving the track
- [ ] Three consecutive laps on level 3 without leaving the track
- [ ] Neither track has a corner that cannot be taken at any speed

---

## Part B — Winning (US2)

### L7 · Clearing level 3 wins
Clear all three levels.

- [ ] Level 3's third lap produces a **victory** panel, not a fourth track
- [ ] It reports the total time for the whole run
- [ ] It reports **all three** best laps, one per level
- [ ] It says how to start again

### L8 · Victory is frozen and restarts cleanly
- [ ] Hold gas for 10 s — nothing moves, no timer advances, `P` does nothing
- [ ] `Enter` starts a fresh run at **level 1** with the countdown
- [ ] `LEVEL` `1/3`, `LAP` `1/3`, `LIVES` `3`, `TOTAL` `0:00.00`

### L9 · Running out of lives is not a victory
On level 2, deliberately leave the track three times.

- [ ] The **game-over** panel appears, not the victory panel
- [ ] It reports laps completed **across the whole run** (so more than the current level's count)
- [ ] `Enter` returns to level 1

---

## Part C — Readouts (US3)

### L10 · Level and lap are readable at a glance 🧍
- [ ] `LEVEL` and `LAP` are both visible while driving without hunting for them
- [ ] Neither shifts the surrounding panels as its digits change
- [ ] Ask someone who has not seen the game: can they say which level they are on and how many laps remain? (SC-007)

### L11 · Best lap is per level
- [ ] Set a best on level 1, advance — `BEST` shows level 2's placeholder `--:--`, **not** level 1's time
- [ ] Set a best on level 2, then press `R` and drive level 1 again — level 1's earlier best is **still shown**
- [ ] Beat it — the readout improves. Drive a slower lap — it does not get worse
- [ ] Reload the page — all three bests are cleared

### L12 · Frame rate 🧍
- [ ] Motion is smooth on all three levels, level 3 included (the longest path, 19 segments)
- [ ] No perceptible difference from before this feature on level 1

---

## Part D — Difficulty (FR-020 / SC-008) 🧍

### L13 · The levels actually get harder
**This is the only requirement in the feature that no harness can close.** The geometry harness
measures the ladder — corridor ÷ car `2.41 → 2.12 → 1.82`, corners under 120° `6 → 8 → 12` — but
whether that *plays* as increasing difficulty is a human judgement.

- [ ] Level 2 takes more attempts to clear than level 1
- [ ] Level 3 takes more attempts than level 2
- [ ] Level 3 is hard but not unfair — width 62 against a 34 px car still leaves a driveable line

If the ordering does not hold, the fix is the `width` number and the path, not the mechanic.

---

## Part E — Accessibility (FR-037 – FR-039)

### L14 · Screen reader 🧍
With a screen reader (NVDA / VoiceOver / Narrator):

- [ ] The current level, lap progress and best lap can be obtained on demand from the HUD group
- [ ] Clearing a level is announced within 2 s, with the level name
- [ ] Completing the run is announced within 2 s, with how to start again
- [ ] Nothing new is hidden behind `aria-hidden`

### L15 · Reduced motion 🧍
With the OS "reduce motion" setting on:

- [ ] No new animation is introduced by the level or victory panels
- [ ] The level and victory panels still appear and are still readable
- [ ] Level and lap readouts still update

---

## Part F — Regression

### L16 · Feature 002 and 003 behaviour on level 1
Level 1's track is **unchanged**, so it is the control. Any failure here is caused by this feature.

- [ ] A full clean lap counts and the lap timer resets
- [ ] A lap with a checkpoint skipped does not count
- [ ] Crossing the start line backwards does not count
- [ ] Pause freezes world and clock; resume continues from the same time
- [ ] Alt-tab mid-throttle returns with no stuck key and the race paused
- [ ] The car behaves identically at 60 Hz and at a throttled frame rate
- [ ] Off-track slows the car without trapping it; the world edge never pins it
- [ ] One excursion costs exactly one life however long it lasts
- [ ] Three excursions produce game over
- [ ] The cursor hides while racing and returns on the panels

### L17 · Constitutional gate
- [ ] Still three source files; opens by double-clicking `index.html`
- [ ] No network request in the browser's network panel
- [ ] Nothing written to `localStorage` / `sessionStorage` / cookies
- [ ] `game.js` still reads top-to-bottom in its six labelled sections

---

## Outstanding by design

These cannot be closed by any harness and must be reported as outstanding until a human has run
them: **L6, L10, L12, L13, L14, L15**.

**L13 in particular** — the difficulty ordering is the feature's headline claim and the only
evidence available before a human plays is two monotonic measurements. Measurements are not a
verdict.
