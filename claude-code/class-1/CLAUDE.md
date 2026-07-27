## Project Overview

A polished, single-file **Snake game** that runs in the browser. Vanilla **HTML + CSS + JavaScript**, rendered on `<canvas>`. No frameworks, no build step, no dependencies. The deliverable is a self-contained `index.html` that runs by opening it directly.

Design priority order (never reorder): **(1) core-loop feel, (2) edge-case correctness, (3) juice/polish, (4) clean code.** Do not add features that compromise a higher priority for a lower one.

---

## Tech Stack & Hard Constraints

- Vanilla HTML/CSS/JS only. **No** React/Vue/frameworks, **no** bundler, **no** npm install, **no** external runtime dependencies.
- All code lives in `index.html` (inline `<style>` and `<script>` are fine). Keep it self-contained.
- Rendering: HTML5 `<canvas>` 2D context.
- Must run by double-clicking the file (no server required).

---

## Commands

- **Run:** open `index.html` in a browser. There is no build or install step.
- **Test:** manual — walk the Definition of Done checklist below. If a test harness is added later, document it here.

---

## Project Structure

```
/
├── index.html      # Entire game: markup, styles, and logic
├── CLAUDE.md       # This file
└── README.md       # (optional) player-facing notes
```

Keep it single-file unless explicitly asked to split. If splitting becomes necessary, update this section.

---

## Architecture

- **Config block at top of the script.** All tunables grouped as constants: `GRID_SIZE`, `INITIAL_SPEED`, `MAX_SPEED`, `SPEED_STEP`, `WRAP_AROUND`, colors, etc. Behavior changes happen here, not scattered through logic.
- **Game states:** `START → PLAYING → PAUSED → GAME_OVER` (plus a `WIN` outcome). All transitions must be valid and reversible where it makes sense.
- **Fixed-timestep loop.** Logic advances on a fixed interval, **decoupled from frame rate**, via an accumulator inside `requestAnimationFrame`. Game speed must be identical on 60Hz and 144Hz displays. Rendering may run every frame; simulation only steps on the fixed tick.
- **Single source of truth for direction:** track the direction *actually applied last tick* separately from queued input. Turns are validated against the applied direction, one turn consumed per tick.
- **Free-cell tracking for food:** spawn food by selecting from currently-free cells, not random-retry-until-empty.

---

## Critical Invariants (DO NOT REGRESS)

These are the bugs every naive Snake implementation ships. Each must hold. Add a code comment at the relevant spot referencing the invariant name.

1. **No 180° reversal.** A turn opposite the current direction is rejected. The check is against the direction **applied last tick**, never the last key pressed.
2. **Input-queue safety.** Fast multi-key presses within one tick must not sneak a reversal through. Buffer input (max ~2), apply one turn per tick, validate each against the last applied direction.
3. **Tail-follow rule.** Moving into the cell the tail tip currently occupies is **legal** (tail vacates it that tick) — **except** on the tick food is eaten, when the tail does not move and it becomes a **collision**. This is the subtlest bug; get it exactly right.
4. **Self-collision length floor.** No false-positive self-collision at short lengths (< ~4). 
5. **Wall / wrap accuracy.** Classic mode: death is pixel-accurate at the boundary. `WRAP_AROUND` mode: head reappears on the exact opposite edge with no off-by-one gap.
6. **Food never on snake.** Food only spawns in free cells.
7. **Board full = WIN, never a freeze.** When no free cell exists, trigger WIN. Never enter an infinite loop searching for a spawn cell.
8. **One loop only.** Restart must cancel any existing loop/`rAF`/interval before starting a new one. A stacked loop = double-speed snake. This must be impossible.
9. **Full reset on restart.** Reset snake, direction, **input queue**, score, speed, and state. No stale queued input carries into a new game.
10. **Auto-pause on tab blur.** On `visibilitychange`/`blur`, pause; resume cleanly. No invisible background play.
11. **`preventDefault` on gameplay keys.** Arrow keys and Space must not scroll the page.
12. **localStorage graceful fallback.** High score persists via `localStorage`; if unavailable/blocked, fall back to in-memory. Never throw.
13. **High-DPI + responsive.** Scale canvas by `devicePixelRatio` for crispness; re-fit on resize without breaking grid coordinates.
14. **Mobile swipe + no scroll/zoom** while playing.

---

## Conventions

- Comment the *why*, especially around the invariants above — not the obvious *what*.
- Keep functions small and single-purpose: input handling, simulation step, collision checks, rendering, and state transitions stay separated.
- No global-namespace pollution beyond what's needed; clean up listeners and loops on restart (no leaks).
- Tasteful juice only (food pulse, eat pop, death flash/shake). Never trade frame rate for effects. Audio muted by default with a visible toggle; no autoplay.
- Readability: head visually distinct from body; food obvious; score, high score, and state always on screen.

---

## Definition of Done

A change is complete only when all hold:

- [ ] Cannot reverse 180° even with fast double-key input.
- [ ] Tail-follow works — legal normally, collision on the eat tick.
- [ ] Food never spawns on the snake.
- [ ] Filling the board triggers WIN with no freeze.
- [ ] Wall (and wrap, if enabled) is boundary-accurate.
- [ ] Identical speed on 60Hz and 144Hz (fixed timestep).
- [ ] Restart never double-speeds and fully resets state incl. input queue.
- [ ] Auto-pauses on tab hide, resumes cleanly.
- [ ] High score persists; degrades gracefully without localStorage.
- [ ] Arrow keys/Space don't scroll the page.
- [ ] Crisp on high-DPI; responsive on resize.
- [ ] Swipe works on mobile; no scroll/zoom while playing.

---

## Do NOT

- Add frameworks, bundlers, or npm dependencies.
- Introduce a second game loop, or start a loop without cancelling the previous one.
- Tie simulation speed to frame rate.
- Use random-retry food spawning that can loop on a near-full board.
- Autoplay audio or ship loud sound on by default.
- "Fix" a reported bug by loosening an invariant above — fix the root cause.