# Rural Racer — Build Plan & Edge-Case Catalog

Top-down arcade racer, vanilla JS + Canvas. This document is the plan of record:
the build phases, then an exhaustive catalog of edge cases with the handling
strategy for each. Build against this; check items off as they're verified.

---

## 1. Build phases (v1)

Ordered so the game is playable as early as possible, then hardened.

### Phase 0 — Skeleton & theme
- `index.html` with a `<canvas>` and an HUD overlay div.
- `styles.css` centering the canvas, styling the HUD, and defining the **design
  tokens** (palette, spacing, type) as CSS variables — see §2.
- `game.js` with the constants block, empty `game` state, and a running
  `requestAnimationFrame` loop that clears + fills the canvas.
- **Done when:** page opens, canvas shows the themed background at a stable frame rate.

### Phase 1 — Car movement (the "feel") + car look
- Car state: `x, y, heading, speed`.
- Input: keydown/keyup writing to a `keys` set.
- Physics: accelerate / brake / reverse, drag, steering scaled by speed.
- Render: rotated car with body, windshield, wheels, nose marker, and a soft drop
  shadow for depth (see §2 "Car look").
- **Done when:** the car drives and stops naturally, feels good, is framerate-independent.

### Phase 2 — Track + surface look
- Define a looping ring track (outer + inner boundary) or a spline path with width.
- Render grass field, dirt racing surface with edge shading, red/white rumble strips
  on corners, and a checkered start/finish line (see §2 "Track look").
- Off-track detection → apply extra friction **and** a visual cue (dust + tint) so the
  penalty reads clearly.
- Keep the car inside the world bounds.
- **Done when:** there's a real circuit to drive and leaving it is penalized and obvious.

### Phase 3 — Laps, checkpoints, timing & feedback
- Start/finish line crossing detection with correct-direction check.
- Checkpoint(s) so a lap only counts if the full loop was driven (no shortcutting).
- Lap counter, current-lap timer, total timer, best-lap tracking.
- HUD shows lap, current time, best time — with **tabular figures** (no jitter).
- Lap-complete toast and a "NEW BEST!" celebration flash (see §5 L).
- **Done when:** laps count exactly once, in order, cheating does nothing, and each lap
  gives clear feedback.

### Phase 4 — Lifecycle, screens & UI polish
- Title screen → countdown ("3 · 2 · 1 · GO") → race → pause overlay (see §3).
- Pause/resume, restart, auto-pause on tab blur.
- First-time controls hint (fades after first input); controls re-readable from pause.
- Retina/DPR-sharp rendering; responsive canvas sizing with letterboxing.
- Accessibility pass: honor `prefers-reduced-motion`, colorblind-safe cues, page
  hygiene (no text-select / context-menu on canvas) — see §5 J & M.
- **Done when:** the full loop title → countdown → drive → pause → restart works cleanly
  and looks polished on any screen.

---

## 2. Visual design direction (clean flat / modern)

The look: smooth flat shapes, soft shadows, a warm rural palette — polished and modern,
all drawn with **canvas primitives (no image assets)**. Re-skinnable from one token block.

### Palette as design tokens
Define once in `styles.css` as CSS custom properties (and mirror the values the canvas
needs in the `game.js` constants block). Changing these re-themes the whole game.

| Token | Role | Starting value |
|-------|------|----------------|
| `--grass` | outfield / background green | `#5aa457` |
| `--grass-dark` | infield / shading green | `#47823f` |
| `--dirt` | racing surface | `#b6895b` |
| `--dirt-edge` | surface edge shading | `#94663c` |
| `--sky` | page chrome behind canvas | `#dff0e6` |
| `--kerb-a` / `--kerb-b` | rumble strips | `#e5533c` / `#f7f4ef` |
| `--car` / `--car-accent` | hero car body / trim | `#2f7fd6` / `#ffd34e` |
| `--ink` | HUD text | `#12241d` |
| `--panel` | HUD panel backing | `rgba(255,255,255,.82)` |

### Car look
Rounded-rect body, a windshield slab, four wheels, a bright **nose marker** so heading
is always readable, and a soft **drop shadow** offset down-right for depth.

### Track look
Grass field → dirt racing surface with subtle darker edge shading → red/white **rumble
strips** on the corners → **checkered** start/finish line. Reads as a real circuit.

### Depth & motion cues (juice — tasteful, all optional)
Car drop shadow; **dust particles** when off-road; brief **skid marks** on hard
braking/turning; subtle **screen shake** on a hard wall impact. Every motion effect is
gated behind `prefers-reduced-motion` (see §5 J) — the game is fully enjoyable without them.

### Typography
One clean UI font stack (system sans). **Tabular / monospace figures** for every timer
and the speedometer so numbers never change the layout width as they tick.

---

## 3. Screens & flow

```
Title  →  Countdown (3·2·1·GO)  →  Race  ⇄  Pause overlay
                                    │
                                    ├─ lap-complete toast (transient)
                                    ├─ "NEW BEST!" flash (transient)
                                    └─ Finish / results (if a lap target is set)
```

- **Title** — game name, "Press Enter to Start", the control keys. Calm, themed.
- **Countdown** — big centered 3 · 2 · 1 · GO, each number scales/eases in; controls
  locked and timers frozen until GO (ties to §4 G4).
- **Race (HUD)** — DOM overlay above the canvas: lap `2/∞`, current lap time, best lap,
  speedometer. Panel backing for readability (§5 I).
- **Pause overlay** — dims the frozen scene, shows "Paused" + the controls list +
  Resume/Restart hints. Clearly a state, not a freeze bug.
- **Toasts** — lap time slides in briefly on each valid lap; "NEW BEST!" flashes on a
  record. Non-blocking, auto-dismiss.
- **Finish / results** (optional, only if a lap target exists) — freeze, show total &
  best, offer restart.

---

## 4. Edge-case catalog

Each entry: **the case** → **the handling**. This is the "every edge case" list.

### A. Timing & game loop
| # | Edge case | Handling |
|---|-----------|----------|
| A1 | Variable/high refresh rate (30 vs 60 vs 144 Hz) | **Fixed timestep.** Accumulate real elapsed time; step physics in fixed `dt` (1/60 s). Speeds never multiply by raw frame time. |
| A2 | First frame has no previous timestamp | Initialize `lastTime` on first tick; skip physics that frame (`dt = 0`). |
| A3 | Tab backgrounded, returns after seconds → giant `dt` | **Clamp** elapsed per frame (e.g. max 0.25 s) so the car can't teleport. Prevents the spiral of death. |
| A4 | `requestAnimationFrame` throttled in background tab | Auto-pause on `visibilitychange` (hidden) so no time accrues; resume on visible. |
| A5 | Accumulator never drains (slow machine) | Cap the number of fixed steps per frame; drop the remainder rather than freezing. |

### B. Car physics & movement
| # | Edge case | Handling |
|---|-----------|----------|
| B1 | Up + Down pressed together | Net them: throttle − brake, so they cancel to coasting. |
| B2 | Left + Right pressed together | Steering input cancels to zero. |
| B3 | Car never stops (drifts forever) | Apply drag/rolling friction each step; snap `speed` to 0 below a small epsilon. |
| B4 | Speed exceeds sane limits | Clamp to `MAX_FWD` and `MAX_REV` (reverse cap smaller than forward). |
| B5 | Steering a stationary car spins it in place unrealistically | Scale turn rate by current speed (and by sign, so reversing steers the expected way). |
| B6 | Heading grows unbounded / float drift | Normalize `heading` into `[0, 2π)` each step. |
| B7 | Braking flips straight into fast reverse | Brake decelerates to 0 first; only then does Down build reverse speed. |
| B8 | Diagonal movement faster than axis movement | Physics is polar (speed + heading), not per-axis, so this can't happen. |
| B9 | NaN/Infinity creeping into position | Guard inputs; if a value goes non-finite, reset that field (defensive, shouldn't trigger). |

### C. Track & collision
| # | Edge case | Handling |
|---|-----------|----------|
| C1 | Car drives off the track surface | Detect off-track; apply heavy friction ("rough/grass") — a soft penalty, not a wall. |
| C2 | Car reaches world/canvas edge | Clamp position inside world bounds and kill velocity into the wall (no wrap-around). |
| C3 | Car clips through a thin boundary at high speed (tunneling) | Test position against boundary each fixed step; boundaries are thick zones, not 1px lines. |
| C4 | Track is a closed loop — inside vs outside | Ring track: valid surface is between outer and inner radius/path; both count as off-track. |
| C5 | Spawn position/heading | Car starts on the surface, just behind the start line, facing the correct racing direction. |

### D. Laps, checkpoints & scoring
| # | Edge case | Handling |
|---|-----------|----------|
| D1 | First line crossing counts as a completed lap | First crossing **starts** lap 1; laps completed = crossings − 1 (or use a "started" flag). |
| D2 | Sitting on the line double-counts | Debounce: require leaving the line's trigger zone before it can fire again. |
| D3 | Reversing back and forth over the line to farm laps | Count only when crossed in the **correct direction** (check velocity/heading vs line normal). |
| D4 | Shortcutting across the infield to reach the line | Require passing an ordered set of **checkpoints** before a line crossing validates the lap. |
| D5 | Lap timer vs total timer | Separate accumulators: current-lap time resets on each valid crossing; total keeps running. |
| D6 | Best lap on the very first lap | Best is unset until the first *completed* lap; then `min(best, lapTime)`. |
| D7 | Timer keeps running while paused/finished | Advance timers only in the active-update state, never while paused or after finish. |
| D8 | Time display formatting | Format `mm:ss.mmm`; pad consistently so the HUD doesn't jitter in width. |

### E. Input
| # | Edge case | Handling |
|---|-----------|----------|
| E1 | Arrow keys scroll the page | `preventDefault()` on the game keys. |
| E2 | Key "sticks" when focus is lost mid-press (keyup never fires) | Clear the `keys` set on `window` blur and on `visibilitychange` → hidden. |
| E3 | OS key-repeat spams keydown | Track state in a set (idempotent), ignore the `repeat` flag; don't accumulate per event. |
| E4 | Canvas not focused → no key events | Listen on `window`, not the canvas element. |
| E5 | Layout differences (WASD vs arrows, physical keys) | Map both; prefer `event.code` (physical) so it works regardless of keyboard layout. |
| E6 | Pressing pause/restart while a game key is held | Lifecycle keys handled on keydown edge, independent of the movement `keys` set. |

### F. Rendering & display
| # | Edge case | Handling |
|---|-----------|----------|
| F1 | Blurry lines on high-DPI/retina | Scale the canvas backing store by `devicePixelRatio`; draw in CSS pixels. |
| F2 | Window resized | Recompute canvas size (keep aspect ratio / letterbox) on `resize`; don't distort the track. |
| F3 | Car rotation smears the whole canvas | `ctx.save()` / `translate` / `rotate` / draw / `ctx.restore()` around the car only. |
| F4 | HUD text unreadable over track | HUD is a DOM overlay (or drawn with a contrasting backing), not raw text on grass. |
| F5 | Tiny/huge viewport | Fixed logical world size; scale to fit the viewport so gameplay is identical everywhere. |

### G. Lifecycle & state
| # | Edge case | Handling |
|---|-----------|----------|
| G1 | Pause / resume | A `paused` flag: update early-returns; render still draws (with a "Paused" overlay). |
| G2 | Restart | A single `reset()` that rebuilds the whole `game` state from constants — no stale values. |
| G3 | Auto-pause when tab hidden | `visibilitychange` → hidden sets paused; avoids unfair time loss and dt spikes. |
| G4 | Input before the race starts (countdown) | Lock car controls until "GO"; timers start on GO, not on page load. |
| G5 | Reaching a finish condition (if a lap target is set) | Enter a `finished` state: freeze car + timers, show results, allow restart. |
| G6 | Double-init / loop started twice | Guard so `init()` and the RAF loop can't be registered more than once. |

### H. Layout & responsiveness
| # | Edge case | Handling |
|---|-----------|----------|
| H1 | Tiny or huge viewport | Fixed logical world size; scale-to-fit so gameplay is identical at any size (ties to F5). |
| H2 | Ultrawide or portrait aspect ratio | **Letterbox** — keep the world's aspect ratio, fill the leftover with the `--sky` chrome; never stretch the track. |
| H3 | HUD overlaps the car/track edge | HUD pinned to corners with safe-area margins; it sits in a DOM overlay, not in the play field. |
| H4 | Window resized mid-race | Recompute canvas + DPR scale on `resize`; state is in world units so nothing warps or jumps. |
| H5 | Browser zoom (Ctrl +/–) | Layout is relative units + canvas rescale; zoom changes size, not proportions or feel. |

### I. Readability & contrast
| # | Edge case | Handling |
|---|-----------|----------|
| I1 | HUD text unreadable over busy grass | Semi-opaque `--panel` backing behind HUD groups (plus a subtle text shadow). |
| I2 | Low contrast HUD ink | `--ink` chosen for strong contrast on the panel; aim for WCAG AA on text. |
| I3 | Numbers jitter / reflow as they tick | Tabular figures + fixed-width fields for timers and speed (ties to D8). |
| I4 | A big speed/lap value pushes the layout | Reserve fixed widths / right-align numeric fields so growth doesn't shift neighbors. |

### J. Accessibility
| # | Edge case | Handling |
|---|-----------|----------|
| J1 | Motion-sensitive players | `prefers-reduced-motion: reduce` → disable screen shake and heavy particles; keep core play intact. |
| J2 | Colorblind players | Never encode state by color alone — pair color with shape, icon, or text (e.g. off-track shows a "ROUGH" tag + dust, not just a tint). |
| J3 | Keyboard-only play | Already fully keyboard-driven; ensure Enter/Esc/P/R are reachable and shown on-screen. |
| J4 | Light/dark system preference | Respect `prefers-color-scheme` for the page chrome around the canvas so it doesn't glare. |
| J5 | Control hints discoverable | On-screen controls on the title + a fading in-race hint (ties to K1); re-readable from pause. |

### K. Onboarding & discoverability
| # | Edge case | Handling |
|---|-----------|----------|
| K1 | First-timer doesn't know the controls | Show a controls hint at race start; **fade it out after the first input**. |
| K2 | "When do I start?" | Countdown (3·2·1·GO) makes race start unmistakable; controls locked until GO. |
| K3 | Forgot the keys mid-game | Pause overlay always lists the full controls. |
| K4 | Action with no feedback feels broken | Every input has an immediate visual response (car moves, dust, skid, HUD updates). |

### L. Feedback & polish states
| # | Edge case | Handling |
|---|-----------|----------|
| L1 | Lap completes silently | Transient **lap-time toast** slides in on each valid lap. |
| L2 | Beating your best goes unnoticed | **"NEW BEST!"** flash on a record lap. |
| L3 | Pause looks like a freeze/crash | Dedicated dimmed **pause overlay** with a "Paused" label — clearly a state. |
| L4 | Off-track penalty feels mysterious | Visible dust + surface tint + a "ROUGH" cue so the slowdown is understood. |
| L5 | Race end (if a lap target is set) | Results screen: total time, best lap, restart prompt (ties to G5). |

### M. Input surface & page hygiene
| # | Edge case | Handling |
|---|-----------|----------|
| M1 | Dragging selects text / ghosts the canvas | `user-select: none` and `draggable=false` on the play area. |
| M2 | Right-click context menu interrupts play | Suppress `contextmenu` over the canvas. |
| M3 | Mouse cursor sits over the action | Hide the cursor during active play; restore it when paused / on menus. |
| M4 | Flash of unstyled content on load | Tokens + layout inline-critical; instant first paint (there are no assets to wait on). |
| M5 | Keyboard focus affordances lost | Don't blanket-remove focus outlines on interactive controls; keyboard users keep visible focus. |

---

## 5. Acceptance checklist (test by playing)

Open `index.html` and verify:

- [ ] Car accelerates, brakes, reverses, and **coasts to a stop** on its own.
- [ ] Steering feels right at low and high speed; reverse steers correctly.
- [ ] Up+Down and Left+Right pressed together behave sanely (cancel).
- [ ] Driving off-track slows the car; hitting the world edge stops it (no escape).
- [ ] A lap counts **exactly once** per proper loop.
- [ ] Reversing over the start line does **not** add laps.
- [ ] Cutting across the infield does **not** complete a lap.
- [ ] Lap timer resets each lap; best lap updates; total time is continuous.
- [ ] Alt-tab away and back: car doesn't teleport; game auto-paused.
- [ ] Release a key while switching windows: car doesn't keep driving.
- [ ] Arrow keys don't scroll the page.
- [ ] Pause, resume, and restart all work and reset cleanly.
- [ ] Lines/text look sharp on a high-DPI screen; resizing doesn't distort the track.

UI/UX:

- [ ] HUD is readable over the track everywhere (panel backing, good contrast).
- [ ] Timers and speed use tabular figures — numbers never jitter the layout.
- [ ] Resizing / zoom / odd aspect ratios letterbox without distorting the track.
- [ ] `prefers-reduced-motion` disables screen shake & heavy particles.
- [ ] Off-track state is obvious by more than color (dust + tint + "ROUGH" cue).
- [ ] Title screen, 3·2·1·GO countdown, and pause overlay all show and read clearly.
- [ ] Controls hint appears for first-timers and is re-readable from pause.
- [ ] Lap-complete toast and "NEW BEST!" flash fire on the right events.
- [ ] No text selection, image drag, or right-click menu on the canvas; cursor hidden in play.

---

## 6. Future phases (out of scope for v1)

Noted so they're not accidentally built now: AI opponents (path-following + rubber-band
difficulty), position ranking, multiple tracks, main menu + track select, car
upgrades/unlocks, persistent best times (localStorage), sound effects/music, sprite
art, mobile touch controls, multiplayer.
