# Rural Racer — Project Explanation

A single-screen, top-down 2D racing game built with **plain HTML, CSS and JavaScript**. No
framework, no bundler, no dependencies, no build step. Open `index.html` in a browser and it
runs.

This document explains what the project is, how the three files fit together, and how each
system works — written for someone reading the code for the first time.

---

## 1. At a glance

| | |
|---|---|
| **What it is** | A lap-timed time-trial around a closed dirt circuit |
| **Stack** | HTML + CSS + one `<canvas>` + one JS file |
| **Entry point** | `index.html` |
| **How to run** | Double-click `index.html`, or serve the folder with any static server |
| **World size** | 900 × 600 logical pixels, letterboxed to a 3:2 stage |
| **Dependencies** | None |

### Files

| File | Size | Role |
|---|---|---|
| `index.html` | ~2.6 KB | Page skeleton: the canvas plus every DOM overlay (HUD, toast, hint, title/pause screens, countdown) |
| `styles.css` | ~5.9 KB | Design tokens (CSS custom properties) and all overlay styling |
| `game.js` | ~22 KB | The whole game: constants, state, input, physics, lap logic, rendering, loop |
| `PLAN.md` | ~18 KB | The design/acceptance spec the code was built against |
| `CLAUDE.md` | — | Spec-Driven Development agent rules for this folder |

---

## 2. Architecture in one picture

```
index.html
 └── .stage                     ← fixed 3:2 box, letterboxed by CSS
      ├── <canvas id="game">    ← EVERYTHING that moves is painted here
      └── DOM overlays          ← EVERYTHING that is text lives here
           ├── .hud             lap / time / best / total / speed
           ├── #toast           "LAP 1 · 0:24.31   NEW BEST!"
           ├── #hint            first-time controls hint
           ├── .screens         #titleScreen, #pauseScreen
           └── #countdown       3 · 2 · 1 · GO!
```

The central design decision is the **canvas / DOM split**:

- The canvas draws the *world* — grass, track, checkpoint gates, dust, the car.
- The DOM draws the *interface* — all text and screens.

Text stays crisp at any zoom, is styled with ordinary CSS, and needs no font metrics work on
the canvas. `game.js` never writes HUD text to the canvas; it calls `setText()` /
`toggleHidden()` on DOM nodes instead.

The palette is duplicated deliberately: `styles.css` defines it as CSS custom properties
(`--grass`, `--dirt`, `--car`, …) and `game.js` mirrors the same hex values in its `COLOR`
object (`game.js:72`), because the canvas 2D API cannot read CSS variables directly. Re-theming
means editing both blocks.

### Reading order inside `game.js`

The file is written to be read top-to-bottom in six labelled sections:

```
1. CONSTANTS / TUNING   every magic number, in one place
2. STATE                the `game` object + reset()
3. INPUT                keyboard handling and state transitions
4. UPDATE               physics + lap logic  (never touches the canvas)
5. RENDER               drawing              (never mutates state)
6. LOOP + INIT          requestAnimationFrame driver and bootstrap
   Helpers              math and DOM utilities
```

That **update / render separation** is the second core rule: `update()` may not call a single
`ctx.*` method, and `render()` may not change any value on `game`. It keeps the simulation
deterministic and makes it possible to run several update steps per drawn frame.

---

## 3. The game loop and fixed timestep

`frame(now)` (`game.js:567`) is the `requestAnimationFrame` callback. It does not simulate with
the raw frame delta. Instead it uses a classic **fixed-timestep accumulator**:

```js
STEP      = 1/60   // simulate in exact 16.67 ms slices
MAX_FRAME = 0.25   // clamp a single frame's elapsed time
MAX_STEPS = 5      // never run more than 5 steps in one frame
```

```
elapsed = now - lastTime, clamped to MAX_FRAME
accumulator += elapsed
while (accumulator >= STEP && steps < MAX_STEPS) { stepGame(STEP); ... }
render()
```

Three problems this solves:

1. **Refresh-rate independence.** A 144 Hz monitor and a 60 Hz monitor run the same physics, so
   the car feels identical and lap times are comparable.
2. **Backgrounded tabs.** When a tab is hidden, `rAF` stops. On return, `elapsed` could be
   several seconds — enough to teleport the car through a wall in one integration step. The
   `MAX_FRAME` clamp caps it.
3. **The spiral of death.** If simulation ever costs more than real time, the accumulator grows
   forever. `MAX_STEPS` caps the work per frame, and any leftover time is *dropped*
   (`accumulator = 0`) rather than carried — the game slows down instead of freezing.

`stepGame()` (`game.js:555`) is the state gate: it ticks the countdown, returns early on
`title` and `paused` (which is exactly *why* pausing freezes time — timers only advance inside
`update()`), and otherwise calls `update(dt)`.

---

## 4. Car physics

The car is four numbers: `{ x, y, heading, speed }`. Physics is arcade-style, not a real tyre
model — the goal is that it *feels* right.

**Longitudinal** (`game.js:218`)

- Gas adds `ACCEL` (320 px/s²); brake subtracts `BRAKE` (520 px/s²).
- Braking clamps at zero first — you must come to a stop before the same key starts reversing.
  This prevents the "instantly slam into reverse at full speed" feel.
- Rolling friction is exponential decay: `speed *= Math.exp(-DRAG * dt)`. Exponential rather
  than linear so the decay is framerate-correct and never overshoots past zero.
- Below `STOP_EPS` (4 px/s) with no input, speed snaps to exactly 0 — otherwise the car creeps
  forever at an invisible fraction of a pixel.
- Speed is clamped to `[-MAX_REV, MAX_FWD]` = `[-120, 300]`.

**Steering** (`game.js:235`)

```js
speedFactor = clamp(|speed| / TURN_SPEED_REF, 0, 1)   // TURN_SPEED_REF = 160
dir         = Math.sign(speed)
heading    += steerIn * TURN * speedFactor * dir * dt
```

Two behaviours fall out of this one line:

- **A stationary car cannot turn.** `speedFactor` is 0 at rest, so you can't pirouette on the
  spot. Turn authority ramps in with speed and saturates at 160 px/s.
- **Reverse steering inverts.** `dir` is negative when backing up, so holding "right" swings the
  nose the way it does in a real car reversing.

`wrapAngle()` keeps `heading` in `[0, 2π)` so it can't drift into huge float values over a long
session.

Opposite keys cancel: `throttle = gas − brake` and `steerIn = right − left`, so holding both is
the same as holding neither.

---

## 5. The track — a centerline path, not a polygon

The circuit (`game.js:42`) is a closed list of 14 points, and the track is simply that path
**stroked at a fixed width of 82 px**. There is no separate collision geometry.

```js
isOnTrack(x, y)  ⇔  distToPath(x, y) <= HALF_W   // HALF_W = 41
distToPath(x, y) = min over all 14 segments of distPointSeg(...)
```

This is the neatest idea in the codebase. One definition serves three purposes:

- **Rendering** — `tracePath()` strokes the same path twice: once at `width + 12` in the darker
  edge colour, once at `width` in dirt. That gives a bordered track from two `stroke()` calls,
  with `lineJoin: 'round'` smoothing the corners for free.
- **Collision** — the point-to-segment distance test above.
- **Layout** — checkpoint gates and the start line are derived from path vertices, so moving a
  point moves everything consistently.

Changing the circuit means editing that array of 14 coordinates and nothing else.

The chosen layout is deliberately harder than an oval: a long bottom straight, a sweeping
right-hander, an S-kink, a chicane along the top, and a tight hairpin on the left.

**Off-track** (`game.js:244`) is a penalty, not a wall. In the grass, drag jumps from `0.9` to
`4.5` and top speed drops from 300 to 115. You keep control, you just bleed speed — so cutting a
corner is slower than driving it. Dust particles spawn behind the rear axle and a red tint plus
an "OFF TRACK" banner appear.

A **world-edge backstop** clamps position at the canvas boundary so the car can never leave the
screen, then *bounces* it: heading is reflected about the boundary and speed is scaled by
`WALL_RESTITUTION`. Reflection rather than a dead stop matters because steering authority scales
with speed — killing speed at the wall would also kill the ability to turn away from it.

---

## 6. Lap timing and anti-shortcut logic

Four of the fourteen path points are checkpoints: `CP_INDICES = [3, 6, 9, 12]` — the right
side, top-right, top-left and the hairpin. A lap counts only if all four are passed **in order**
and *then* the start/finish line is crossed **forwards**.

**Ordered checkpoints**

Only `CP_INDICES[game.nextCp]` — the single next expected checkpoint — is ever tested. Passing
it increments `nextCp`. Because no other checkpoint is checked, you cannot skip ahead, and
driving backwards over an already-cleared gate does nothing. The car must also be on-track at
the time.

A checkpoint is a **gate**, and the test is a crossing — the car's movement segment must
intersect it, exactly as at the finish line. `gateAt(i)` derives that gate from the corridor
itself: a corner is wider on the inside of the turn than a straight is, because the two inner
edge offsets meet at `HALF_W / sin(θ/2)`, while the outside is capped by the round join at
`HALF_W`. The gate runs along the angle bisector between those two points, so it spans the
corridor cross-section exactly — no on-track line can slip past it, and it needs no tuning when
the track changes.

`buildGates()` computes all four once at init into `CP_GATES`, and **both** `updateLap()` and
`drawCheckpoints()` read that array. That is the point: the shape drawn and the shape tested are
the same object, so they cannot drift apart. They previously did — a 55 px circle was tested
while a 82 px segment was drawn — and a legal line through the hairpin fell in the gap.

**Directional finish line** (`game.js:296`)

`buildStart()` builds the start/finish as a segment perpendicular to the track at `path[0]`,
plus a unit vector `start.dir` pointing down the racing direction. Each step, the car's movement
from `game.prev` to its new position is tested with `segIntersect()`:

- Testing the *movement segment* rather than the car's position means a fast car can't tunnel
  through the line between frames, and sitting parked on the line can't re-trigger it — the
  event fires on the crossing, not on the state.
- The dot product `(Δpos · start.dir) > 0` rejects crossings made while driving backwards.

Only when both hold *and* `nextCp` has reached 4 does `completeLap()` fire: it increments the
lap counter, records `lastLap`, updates `best` if faster, resets `lapTime` to 0, resets `nextCp`
to 0, and shows the toast.

Timing uses two accumulators — `lapTime` (reset every lap) and `raceTime` (continuous). Both are
incremented by the fixed `dt` at the top of `update()`, so they are exactly as deterministic as
the physics, and they stop automatically when paused because `update()` isn't called.

---

## 7. Rendering

`render()` (`game.js:335`) redraws the whole world every frame, back to front. There is no dirty
rectangle tracking — at 900×600 with these few shapes, a full repaint is cheap and far simpler.

```
drawBackground()   flat grass fill
drawTrack()        edge stroke → dirt stroke → dashed centerline → start line
drawCheckpoints()  gates: green = passed, yellow = next, faint = upcoming
drawDust()         fading circles
drawCar()          shadow, wheels, body, windshield, nose marker
drawOffTrackCue()  red tint + banner (only when off-track and racing)
drawVignette()     radial darkening at the edges
updateHud()        DOM text
updateScreens()    DOM visibility
```

Notable details:

- The **start line** is a 2×6 checkerboard drawn inside a `translate` + `rotate` transform, so
  it aligns to the track automatically no matter which way `path[0] → path[1]` points.
- **Checkpoint gates** colour-code progress, which is the only feedback telling the player that
  a lap is actually being counted.
- The **dashed centerline** is a racing-line hint that makes the tighter corners readable.
- The **car** is drawn in local space (`translate` to position, `rotate` by heading, then draw
  everything centred on the origin), which is why the body geometry is written as simple
  `-W/2 … +W/2` rectangles.
- `tangentAt(i)` uses a central difference across the neighbouring vertices (wrapping the closed
  loop) to get a smooth perpendicular for each gate.

**Crisp rendering on HiDPI** — `resizeCanvas()` (`game.js:587`) sets the backing store to
`cssSize × devicePixelRatio` and then uses `ctx.setTransform()` to map the fixed 900×600 world
onto it. All drawing code works in world coordinates and never has to think about DPI or the
current display size.

---

## 8. Game states and input

Five states drive everything:

```
        Enter                countdown ≤ 0
title ─────────→ countdown ──────────────→ racing ⇄ paused
                     ↑                        │
                     │         lives reach 0  ↓
                     └──── Enter / R ───── gameover
```

`stepGame()` returns early for any state that is not `racing`, so `paused` and `gameover` both
freeze the car and every timer without a line of code specific to either. `gameover` gets its
inertness to the pause key the same way — `togglePause()` only ever acted on `racing` and
`paused`.

**Lives.** The car starts each race with three. One is spent per *excursion* — per trip into the
rough, not per frame spent there — which is detected as the rising edge of `game.offTrack`:

```js
const wasOffTrack = game.offTrack;
game.offTrack = !isOnTrack(car.x, car.y);
…
if (game.offTrack && !wasOffTrack && loseLife()) return;
```

Deriving the event from the existing flag rather than adding a second one means a pause spanning
a slide costs nothing: a paused game runs no steps, `game.offTrack` keeps its value, and the
resume produces no edge. The charge sits after the world-edge bounce (so being knocked onto the
grass counts) and before `updateLap()` — and `update()` returns outright when the last life goes,
so a lap cannot be completed on the step the race ends.

| Key | Action |
|---|---|
| `↑` / `W` | Gas |
| `↓` / `S` | Brake, then reverse |
| `←` `→` / `A` `D` | Steer |
| `Enter` | Start from title / resume from pause |
| `P` or `Esc` | Toggle pause |
| `R` | Restart |

Input is split by intent: **movement** keys go into a `Set` polled every physics step (so holding
a key applies continuously), while **lifecycle** keys act on the keydown edge (so a press is one
event). The lifecycle branch returns early on `event.repeat` — OS auto-repeat fires ~30 keydowns
a second, which would restart the countdown faster than it can tick. Movement keys keep their
repeats, since inserting into a `Set` is idempotent and `preventDefault()` must keep firing.

Everything keys off `event.code`, not `event.key`. `code` is the *physical* key, so WASD keeps
working on AZERTY and Dvorak layouts, where `event.key` would report different letters.

Two robustness handlers matter more than they look:

- `window.blur` and `visibilitychange` both **clear the key set** — otherwise alt-tabbing while
  holding gas swallows the `keyup` and leaves the throttle stuck on when you return.
- The same handlers **auto-pause a running race**, so no lap time is lost to a tab switch.

`preventDefault()` on the arrow keys stops the page scrolling underneath the game.

---

## 9. Accessibility and polish

- `prefers-reduced-motion` is respected in both layers: `game.js:80` reads it once and skips
  dust particle spawning; `styles.css` disables the countdown pop animation, the toast slide,
  the hint fade, and the screen backdrop blur.
- `prefers-color-scheme: dark` adjusts the page chrome behind the letterboxed stage.
- The HUD uses `font-variant-numeric: tabular-nums` plus fixed `min-width` (`3ch` for speed,
  `7ch` for `m:ss.cc` times), so digits never shift the layout as numbers change.
- `pointer-events: none` on every overlay lets clicks fall through to the canvas — which is why
  no overlay needs `aria-hidden`. The HUD is a named `role="group"`, queryable on demand but
  deliberately *not* a live region since it changes every frame; the lap toast is `role="status"`
  so each completed lap announces itself once — as do losing a life and reaching game over.
- Events cross from simulation to presentation as *values*, never as calls: `update()` sets
  `goFlash` / `lifeFlash` timers and `updateScreens()` turns changed values back into one-shot
  events with render-side memos (`lastCountLabel`, `lastLivesAnnounced`, `lastStateAnnounced`).
  That is what keeps the update path free of DOM writes.
- The pointer is hidden over the canvas while racing (`#game.is-playing`) and restored on the
  title and pause screens, toggled from `updateScreens()` alongside every other state-driven
  visual.
- `user-select: none`, `touch-action: none` and a `contextmenu` handler keep the play surface
  from behaving like a document.
- The stage is sized `min(96vw, 96vh * 3/2)` with `aspect-ratio: 3/2`, so the game scales to any
  window while keeping the world proportions.

---

## 10. Defect history

A code review found eight defects; all eight were fixed under feature
`specs/002-fix-known-defects/`. They are recorded here because several of the design choices
above only make sense as answers to them.

| # | Defect | Resolution |
|---|---|---|
| 1 | Checkpoints *validated* as a 55 px circle but *drawn* as a track-width segment; a legal inside line through the hairpin fell in the gap and voided the lap | `gateAt()` derives one corridor-spanning gate that both the test and the renderer read; `CP_RADIUS` deleted |
| 2 | `reset()` cleared `game.best`, so restart erased the record — and the non-finite guard called the same function, so one bad frame erased the race | Split into `placeCarAtGrid()` → `resetRace()` → `resetSession()`; each clears its own lifetime and nothing wider |
| 3 | World-edge backstop zeroed speed every step, taking ~15 s to turn away from a wall | Clamp, reflect heading, scale speed by `WALL_RESTITUTION` — measured worst case now 0.67 s |
| 4 | `KeyR` had no repeat guard; holding it pinned the countdown at 3 | Lifecycle keys grouped into one branch that returns early on `event.repeat`; `R` is also inert on the title screen |
| 5 | `game.raceTime` accumulated but never displayed | Fourth HUD panel, `TOTAL` |
| 6 | Shadow offset applied after `ctx.rotate()`, so the light appeared to orbit the car | Offset applied before the rotation, making it world-space |
| 7 | `aria-hidden="true"` on the HUD, toast and hint hid all game state from screen readers | Removed; HUD is a named `role="group"`, toast is `role="status"` |
| 8 | Cursor never hidden during play | `#game.is-playing { cursor: none; }`, toggled from `updateScreens()` |

The most instructive one is #1. The review's suggested fix — test against the segment
`drawCheckpoints` already renders — was checked arithmetically before being adopted and turned
out to be wrong: that segment reaches only 41 px either side of a vertex, while the corridor
reaches 42.0, 44.7, 51.5 and 59.5 px at the four checkpoints. Adopting it would have closed one
bug and opened three. Deriving the gate from the corridor was the actual fix.

---

## 11. Where to change what

| To change… | Edit |
|---|---|
| Car feel (accel, grip, top speed) | `CAR` — `game.js:26` |
| Track shape | `TRACK.path` — `game.js:44` |
| Track width | `TRACK.width` — `game.js:43` |
| Which corners are checkpoints | `CP_INDICES` — gates resize themselves via `gateAt()`, nothing else to touch |
| Off-road penalty | `OFFROAD` |
| Wall bounciness | `WALL_RESTITUTION` |
| Number of lives | `LIVES_START` |
| Life-lost cue duration | `LIFE_FLASH` |
| Colours | `COLOR` in `game.js` **and** `:root` in `styles.css` — both |
| Physics rate | `STEP` |
| HUD layout | `.hud*` rules in `styles.css` + markup in `index.html` |

All tuning values live in the constants block at the top of `game.js`.
