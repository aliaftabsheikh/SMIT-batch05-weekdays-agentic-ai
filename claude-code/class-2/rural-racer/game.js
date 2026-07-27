/* =========================================================================
   Rural Racer — game.js
   Phases 0–4: themed skeleton, car feel, circuit, laps/timing, and the
   title / countdown / pause lifecycle.

   Read top-to-bottom: CONSTANTS → STATE → INPUT → UPDATE → RENDER → LOOP.
   The update step is a FIXED TIMESTEP so the car feels identical at any
   refresh rate. Update never touches the canvas; render never changes state.
   ========================================================================= */

'use strict';

/* -------------------------------------------------------------------------
   1. CONSTANTS / TUNING
   ------------------------------------------------------------------------- */

const WORLD_W = 900;
const WORLD_H = 600;

const STEP = 1 / 60;        // fixed physics timestep (seconds)
const MAX_FRAME = 0.25;     // clamp elapsed/frame so a backgrounded tab can't teleport (A3)
const MAX_STEPS = 5;        // cap steps per frame — drop the rest, never freeze (A5)
const TAU = Math.PI * 2;

// Car physics (world-px and seconds).
const CAR = {
  W: 34, H: 18,
  ACCEL: 320,
  BRAKE: 520,
  MAX_FWD: 300,
  MAX_REV: 120,
  DRAG: 0.9,
  STOP_EPS: 4,
  TURN: 3.2,
  TURN_SPEED_REF: 160,
};

// The circuit is a CLOSED CENTERLINE PATH driven at a fixed width. Off-track is
// simply "distance from the centerline > half width" (C1/C4), which lets the
// track be any shape — here a proper circuit with straights, an S-kink, a
// chicane and a tight left, so it's harder than a plain oval.
const TRACK = {
  width: 82,
  path: [
    { x: 250, y: 500 },   // 0  start/finish (bottom straight, heading right)
    { x: 620, y: 500 },   // 1  long bottom straight
    { x: 760, y: 450 },   // 2  sweep up-right
    { x: 800, y: 350 },   // 3  ▶ checkpoint — right side
    { x: 715, y: 285 },   // 4  S-kink in
    { x: 800, y: 195 },   // 5  S-kink out
    { x: 675, y: 120 },   // 6  ▶ checkpoint — top-right
    { x: 520, y: 165 },   // 7  chicane dip
    { x: 400, y: 100 },   // 8  chicane out
    { x: 250, y: 130 },   // 9  ▶ checkpoint — top-left
    { x: 110, y: 235 },   // 10 left side
    { x: 185, y: 350 },   // 11 tight left bulge
    { x: 100, y: 460 },   // 12 ▶ checkpoint — hairpin
    { x: 175, y: 512 },   // 13 round the hairpin back to start
  ],
};
const HALF_W = TRACK.width / 2;

// Which path points act as ordered checkpoints (must be passed in sequence
// before a start/finish crossing counts as a lap — blocks shortcuts, D4).
const CP_INDICES = [3, 6, 9, 12];

// In the rough (off-track): stronger friction and a lower speed cap (C1).
const OFFROAD = { DRAG: 4.5, MAX: 115 };

// Speed kept after bouncing off a world edge. Zeroing it instead would remove
// the steering authority needed to drive away, pinning the car for ~15s (C2).
const WALL_RESTITUTION = 0.35;

// Lives: one is spent per *excursion* off the track — per trip into the rough,
// not per frame spent there. Run out and the race is over.
const LIVES_START = 3;
const LIFE_FLASH = 0.6;     // seconds the "life lost" cue stays on screen

// Palette — mirror of the CSS tokens in styles.css so the canvas matches.
const COLOR = {
  grass: '#5aa457', grassDark: '#47823f',
  dirt: '#b6895b', dirtEdge: '#94663c',
  car: '#2f7fd6', carAccent: '#ffd34e', windshield: '#bfe0ff', wheel: '#26313a',
  shadow: 'rgba(0,0,0,0.20)',
  dust: '150,110,70',
};

const REDUCED_MOTION =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Start/finish line: a segment perpendicular to the track at path[0], plus the
// racing-direction vector. Filled in by buildStart().
const start = { dir: null, a: null, b: null };

// Checkpoint gates — ONE segment per checkpoint, spanning the track corridor at
// that vertex. Both the crossing test and the renderer read these, so what is
// drawn and what is tested cannot drift apart. Filled in by buildGates().
const CP_GATES = [];

/* -------------------------------------------------------------------------
   2. STATE
   ------------------------------------------------------------------------- */

const game = {
  state: 'title',    // 'title' | 'countdown' | 'racing' | 'paused' | 'gameover'
  countdown: 0,      // seconds left in the 3·2·1 countdown
  goFlash: 0,        // seconds left to show "GO!"

  car: null,
  dust: [],
  offTrack: false,   // also the excursion flag: a life is spent on its rising edge
  started: false,    // has the player driven yet? (in-race hint fade)

  lives: LIVES_START,  // race lifetime — restored by every restart
  lifeFlash: 0,        // presentation timer only; render reads it, nothing else

  // Lap & timing
  lap: 1,
  lapsDone: 0,
  nextCp: 0,
  raceTime: 0,
  lapTime: 0,
  lastLap: null,
  best: null,
  prev: { x: 0, y: 0 },   // car position last step (start-line crossing test)
};

/* Three reset scopes, narrowest first. Each clears its own lifetime and nothing
   wider — restarting a race must not destroy a session record, and repairing the
   car must not destroy the race. One function serving all three callers is what
   made pressing R wipe the best lap. */

// Car lifetime: put the car back on the grid, touch nothing else.
function placeCarAtGrid() {
  const p0 = TRACK.path[0];
  // Spawn just behind the start line, facing the racing direction (C5).
  game.car = {
    x: p0.x - start.dir.x * 26,
    y: p0.y - start.dir.y * 26,
    heading: Math.atan2(start.dir.y, start.dir.x),
    speed: 0,
  };
  // prev must follow the car: a stale value describes a movement segment
  // spanning the track, which would fire spurious line crossings.
  game.prev.x = game.car.x;
  game.prev.y = game.car.y;

  game.dust.length = 0;
  game.offTrack = false;
}

// Race lifetime: everything a restart should clear — but NOT the record.
function resetRace() {
  placeCarAtGrid();
  game.started = false;

  // Lives are per-race, so this one line serves the countdown start, the manual
  // restart and starting again after game over. Deliberately NOT in
  // placeCarAtGrid(), so repairing a corrupted car position never costs a life.
  game.lives = LIVES_START;
  game.lifeFlash = 0;

  game.lap = 1;
  game.lapsDone = 0;
  game.nextCp = 0;
  game.raceTime = 0;
  game.lapTime = 0;
  game.lastLap = null;
}

// Page lifetime: only a reload gets here, so only a reload clears the record.
function resetSession() {
  resetRace();
  game.best = null;
}

function buildStart() {
  const p0 = TRACK.path[0], p1 = TRACK.path[1];
  start.dir = norm(p1.x - p0.x, p1.y - p0.y);
  const perp = { x: -start.dir.y, y: start.dir.x };
  start.a = { x: p0.x + perp.x * HALF_W, y: p0.y + perp.y * HALF_W };
  start.b = { x: p0.x - perp.x * HALF_W, y: p0.y - perp.y * HALF_W };
}

// Gates depend only on TRACK, so they are computed once and reused every frame.
function buildGates() {
  CP_GATES.length = 0;
  for (const i of CP_INDICES) CP_GATES.push(gateAt(i));
}

/* -------------------------------------------------------------------------
   3. INPUT
   Movement keys write to `keys`; lifecycle keys (Enter/P/Esc/R) are handled
   on the keydown edge. We key off event.code (physical keys) so WASD works on
   any layout (E5).
   ------------------------------------------------------------------------- */

const keys = new Set();

const GAS   = ['ArrowUp', 'KeyW'];
const BRAKE = ['ArrowDown', 'KeyS'];
const LEFT  = ['ArrowLeft', 'KeyA'];
const RIGHT = ['ArrowRight', 'KeyD'];
const ALL_GAME_KEYS = new Set([...GAS, ...BRAKE, ...LEFT, ...RIGHT]);
const LIFECYCLE_KEYS = new Set(['Enter', 'KeyP', 'Escape', 'KeyR']);

function anyPressed(codes) { return codes.some((c) => keys.has(c)); }

window.addEventListener('keydown', (e) => {
  // Lifecycle keys fire on the press, never on the hold: OS auto-repeat sends
  // ~30 keydowns a second, which would restart the countdown faster than it can
  // tick and pin it at 3 for as long as R is held.
  if (LIFECYCLE_KEYS.has(e.code)) {
    e.preventDefault();
    if (e.repeat) return;
    if (e.code === 'Enter') onEnter();
    else if (e.code === 'KeyR') { if (game.state !== 'title') restart(); }
    else togglePause();
    return;
  }

  if (ALL_GAME_KEYS.has(e.code)) {
    e.preventDefault();          // stop arrow keys scrolling the page (E1)
    keys.add(e.code);            // repeats are harmless — inserting into a Set
    if (game.state === 'racing') markStarted();
  }
});

window.addEventListener('keyup', (e) => keys.delete(e.code));

// Focus loss would swallow keyup and leave a key "stuck" — clear, and auto-pause
// a running race so no time is unfairly lost (E2, G3).
window.addEventListener('blur', () => { keys.clear(); if (game.state === 'racing') pause(); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { keys.clear(); if (game.state === 'racing') pause(); }
});

// --- State transitions ---
function onEnter() {
  if (game.state === 'title') startCountdown();
  else if (game.state === 'paused') resume();
  else if (game.state === 'gameover') restart();   // restart() already restores lives
}
function startCountdown() { game.state = 'countdown'; game.countdown = 3.0; game.goFlash = 0; }
function togglePause() {
  if (game.state === 'racing') pause();
  else if (game.state === 'paused') resume();
}
function pause()  { if (game.state === 'racing') { game.state = 'paused'; keys.clear(); } }
function resume() { if (game.state === 'paused') game.state = 'racing'; }
function restart() { resetRace(); startCountdown(); }   // keeps game.best (D6)

function markStarted() {
  if (game.started) return;
  game.started = true;
}

/* -------------------------------------------------------------------------
   4. UPDATE  (fixed dt; no canvas calls)
   ------------------------------------------------------------------------- */

function update(dt) {
  const car = game.car;

  // Timers advance only while racing — the loop only calls update() then (D7).
  game.raceTime += dt;
  game.lapTime += dt;

  // Throttle and steer net out when opposite keys are held (B1, B2).
  const throttle = (anyPressed(GAS) ? 1 : 0) - (anyPressed(BRAKE) ? 1 : 0);
  const steerIn  = (anyPressed(RIGHT) ? 1 : 0) - (anyPressed(LEFT) ? 1 : 0);

  // Longitudinal: accelerate / brake / reverse.
  if (throttle > 0) {
    car.speed += CAR.ACCEL * dt;
  } else if (throttle < 0) {
    if (car.speed > 0) {                     // brake to 0 first, then reverse (B7)
      car.speed -= CAR.BRAKE * dt;
      if (car.speed < 0) car.speed = 0;
    } else {
      car.speed -= CAR.ACCEL * dt;
    }
  }

  // Rolling friction; snap tiny speeds to rest (B3).
  car.speed *= Math.exp(-CAR.DRAG * dt);
  if (throttle === 0 && Math.abs(car.speed) < CAR.STOP_EPS) car.speed = 0;
  car.speed = clamp(car.speed, -CAR.MAX_REV, CAR.MAX_FWD);   // clamp (B4)

  // Steering: authority scales with speed and reverses when backing up (B5).
  const speedFactor = clamp(Math.abs(car.speed) / CAR.TURN_SPEED_REF, 0, 1);
  const dir = Math.sign(car.speed) || 0;
  car.heading += steerIn * CAR.TURN * speedFactor * dir * dt;
  car.heading = wrapAngle(car.heading);      // keep in [0, 2π) (B6)

  // Integrate position.
  car.x += Math.cos(car.heading) * car.speed * dt;
  car.y += Math.sin(car.heading) * car.speed * dt;

  // Off-track penalty: heavy friction + a lower cap in the rough (C1).
  // `wasOffTrack` turns the continuous off-track condition into the discrete
  // event lives are charged against — game.offTrack stays the single source of
  // truth, with no parallel excursion flag to drift out of sync.
  const wasOffTrack = game.offTrack;
  game.offTrack = !isOnTrack(car.x, car.y);
  if (game.offTrack) {
    car.speed *= Math.exp(-OFFROAD.DRAG * dt);
    car.speed = clamp(car.speed, -OFFROAD.MAX, OFFROAD.MAX);
    if (!REDUCED_MOTION && Math.abs(car.speed) > 40) { spawnDust(car); spawnDust(car); }
  }

  // World-edge backstop (C2): clamp, then bounce off. Steering authority scales
  // with speed, so killing speed at the wall also kills the ability to turn away
  // from it — the car re-enters the wall next step and stays there. Reflecting
  // leaves the nose pointing away, so the next dab of throttle drives clear.
  const m = CAR.W;
  let bounced = 0;                                   // 0 none · 1 vertical · 2 horizontal
  if (car.x < m)           { car.x = m;           bounced = 1; }
  if (car.x > WORLD_W - m) { car.x = WORLD_W - m; bounced = 1; }
  if (car.y < m)           { car.y = m;           bounced = 2; }
  if (car.y > WORLD_H - m) { car.y = WORLD_H - m; bounced = 2; }
  if (bounced) {
    car.heading = wrapAngle(bounced === 1 ? Math.PI - car.heading : -car.heading);
    car.speed *= WALL_RESTITUTION;
  }

  // One life per excursion, charged on the way out — after the backstop, so a
  // bounce onto the grass counts, and before updateLap(), so the lap in progress
  // can't be completed on the very step the race ends.
  if (game.offTrack && !wasOffTrack && loseLife()) return;

  updateLap(car);

  // Age dust particles.
  for (let i = game.dust.length - 1; i >= 0; i--) {
    const p = game.dust[i];
    p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
    if (p.life <= 0) game.dust.splice(i, 1);
  }

  // Defensive: never let a non-finite value persist (B9). Only the car was
  // suspect, so repair the car and void the lap in progress — the laps already
  // completed, the total time and the session best all stand.
  if (!Number.isFinite(car.x) || !Number.isFinite(car.y)) {
    placeCarAtGrid();
    game.lapTime = 0;
    game.nextCp = 0;
  }
}

// Spend one life. Returns true if that was the last one, so the caller can bail
// out of the rest of the step. Sets state and arms a timer — nothing more: the
// cue and the announcement belong to the render pass, not to update().
function loseLife() {
  if (game.lives <= 0) return false;
  game.lives--;
  game.lifeFlash = LIFE_FLASH;
  if (game.lives > 0) return false;
  enterGameOver();
  return true;
}

// Nothing to tear down: stepGame() already freezes the world for any state that
// isn't 'racing', which stops the car and both timers on its own.
function enterGameOver() { game.state = 'gameover'; }

function isOnTrack(x, y) { return distToPath(x, y) <= HALF_W; }

function distToPath(x, y) {
  const p = TRACK.path, n = p.length;
  let best = Infinity;
  for (let i = 0; i < n; i++) {
    const a = p[i], b = p[(i + 1) % n];
    best = Math.min(best, distPointSeg(x, y, a.x, a.y, b.x, b.y));
  }
  return best;
}

function updateLap(car) {
  const pos = { x: car.x, y: car.y };

  // Pass the checkpoints strictly in order (D4): only the *next* one is tested,
  // so skipping ahead or going backward can't advance it. Tested the same way as
  // the start line — the movement segment must CROSS the gate — so a fast car
  // can't tunnel through, and the gate tested is the gate drawn.
  if (game.nextCp < CP_INDICES.length && isOnTrack(car.x, car.y)) {
    const gate = CP_GATES[game.nextCp];
    if (segIntersect(game.prev, pos, gate.a, gate.b)) game.nextCp++;
  }

  // Start/finish: the car's movement segment must cross the line AND move in the
  // racing direction (dot > 0). Reversing over it never counts (D3); firing only
  // on the crossing means sitting on the line can't re-trigger (D2).
  if (segIntersect(game.prev, pos, start.a, start.b)) {
    const forward = (pos.x - game.prev.x) * start.dir.x + (pos.y - game.prev.y) * start.dir.y > 0;
    if (forward && game.nextCp >= CP_INDICES.length) completeLap();
  }
  game.prev.x = car.x;
  game.prev.y = car.y;
}

function completeLap() {
  game.lapsDone++;
  game.lap = game.lapsDone + 1;
  game.lastLap = game.lapTime;

  const isBest = game.best === null || game.lapTime < game.best;
  if (isBest) game.best = game.lapTime;

  game.lapTime = 0;           // fresh timing for the next lap (D5)
  game.nextCp = 0;            // every checkpoint must be re-cleared

  showToast(`LAP ${game.lapsDone} · ${fmtTime(game.lastLap)}`, isBest);
}

function spawnDust(car) {
  if (game.dust.length > 140) return;
  const back = car.heading + Math.PI;
  game.dust.push({
    x: car.x + Math.cos(back) * CAR.W * 0.5 + rand(-4, 4),
    y: car.y + Math.sin(back) * CAR.W * 0.5 + rand(-4, 4),
    vx: rand(-22, 22), vy: rand(-22, 22),
    size: rand(2, 4), life: 0.5, max: 0.5,
  });
}

/* -------------------------------------------------------------------------
   5. RENDER  (reads state, never mutates it)
   ------------------------------------------------------------------------- */

let ctx;

function render() {
  drawBackground();
  drawTrack();
  drawCheckpoints();
  drawDust();
  drawCar(game.car);
  if (game.offTrack && game.state === 'racing') drawOffTrackCue();
  if (game.lifeFlash > 0 && !REDUCED_MOTION) drawLifeLostCue();
  drawVignette();
  updateHud();
  updateScreens();
}

function drawBackground() {
  ctx.fillStyle = COLOR.grass;
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);
}

function tracePath() {
  const p = TRACK.path;
  ctx.beginPath();
  ctx.moveTo(p[0].x, p[0].y);
  for (let i = 1; i < p.length; i++) ctx.lineTo(p[i].x, p[i].y);
  ctx.closePath();
}

function drawTrack() {
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  tracePath(); ctx.lineWidth = TRACK.width + 12; ctx.strokeStyle = COLOR.dirtEdge; ctx.stroke();
  tracePath(); ctx.lineWidth = TRACK.width;      ctx.strokeStyle = COLOR.dirt;     ctx.stroke();

  // Faint dashed centerline — a racing-line guide that makes the harder corners
  // readable (helps K/UX without adding difficulty).
  ctx.save();
  ctx.setLineDash([14, 16]);
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  tracePath();
  ctx.stroke();
  ctx.restore();

  drawStartLine();
}

function drawStartLine() {
  const p0 = TRACK.path[0];
  const ang = Math.atan2(start.dir.y, start.dir.x);
  ctx.save();
  ctx.translate(p0.x, p0.y);
  ctx.rotate(ang);
  const depth = 26, cols = 2, rows = 6;
  const w = depth, h = TRACK.width;
  const sqW = w / cols, sqH = h / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.fillStyle = (r + c) % 2 ? '#f7f4ef' : '#1a1a1a';
      ctx.fillRect(-w / 2 + c * sqW, -h / 2 + r * sqH, sqW + 0.5, sqH + 0.5);
    }
  }
  ctx.restore();
}

// Checkpoint gates across the track: passed = green, next = yellow, upcoming = faint.
function drawCheckpoints() {
  ctx.save();
  ctx.lineWidth = 4;
  for (let k = 0; k < CP_GATES.length; k++) {
    const gate = CP_GATES[k];          // the exact segment updateLap() tests
    ctx.strokeStyle =
      k < game.nextCp ? 'rgba(90,220,120,0.55)'
      : k === game.nextCp ? 'rgba(255,211,78,0.85)'
      : 'rgba(255,255,255,0.26)';
    ctx.beginPath();
    ctx.moveTo(gate.a.x, gate.a.y);
    ctx.lineTo(gate.b.x, gate.b.y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawDust() {
  for (const p of game.dust) {
    ctx.fillStyle = `rgba(${COLOR.dust},${(p.life / p.max) * 0.5})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, TAU);
    ctx.fill();
  }
}

function drawCar(car) {
  const { W, H } = CAR;
  ctx.save();
  ctx.translate(car.x, car.y);

  // Soft drop shadow. The offset is applied BEFORE the rotation so it stays in
  // world space — offsetting after would make the shadow swing around the car as
  // it turns, as if the light source orbited it.
  ctx.save();
  ctx.translate(3, 5);
  ctx.rotate(car.heading);
  ctx.fillStyle = COLOR.shadow;
  roundRect(-W / 2, -H / 2, W, H, 5);
  ctx.fill();
  ctx.restore();

  ctx.rotate(car.heading);

  // Wheels.
  ctx.fillStyle = COLOR.wheel;
  roundRect(-W / 2 + 4, -H / 2 - 2, 8, 4, 2); ctx.fill();
  roundRect( W / 2 - 12, -H / 2 - 2, 8, 4, 2); ctx.fill();
  roundRect(-W / 2 + 4,  H / 2 - 2, 8, 4, 2); ctx.fill();
  roundRect( W / 2 - 12,  H / 2 - 2, 8, 4, 2); ctx.fill();

  // Body.
  ctx.fillStyle = COLOR.car;
  roundRect(-W / 2, -H / 2, W, H, 5);
  ctx.fill();

  // Windshield + bright nose marker.
  ctx.fillStyle = COLOR.windshield;
  roundRect(W / 2 - 14, -H / 2 + 3, 7, H - 6, 2); ctx.fill();
  ctx.fillStyle = COLOR.carAccent;
  roundRect(W / 2 - 4, -3, 5, 6, 2); ctx.fill();

  ctx.restore();
}

function drawOffTrackCue() {
  ctx.fillStyle = 'rgba(180,40,20,0.10)';
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);
  ctx.save();
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(0,0,0,0.55)';
  ctx.fillStyle = '#fff';
  ctx.strokeText('OFF TRACK', WORLD_W / 2, 34);
  ctx.fillText('OFF TRACK', WORLD_W / 2, 34);
  ctx.restore();
}

// Brief full-world red pulse when a life is spent. Drawn where the player's eyes
// already are — on the track, not on the HUD. Fades with game.lifeFlash.
function drawLifeLostCue() {
  const t = game.lifeFlash / LIFE_FLASH;
  ctx.fillStyle = `rgba(200,40,30,${(0.34 * t).toFixed(3)})`;
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);
}

function drawVignette() {
  const g = ctx.createRadialGradient(
    WORLD_W / 2, WORLD_H / 2, WORLD_H * 0.35,
    WORLD_W / 2, WORLD_H / 2, WORLD_H * 0.8
  );
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.14)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);
}

/* -------------------------------------------------------------------------
   HUD + screens (DOM overlay)
   ------------------------------------------------------------------------- */

function updateHud() {
  setText('speed', Math.round(Math.abs(game.car.speed)));
  setText('lives', game.lives);
  setText('lap', game.lap);
  setText('time', fmtTime(game.lapTime));
  setText('best', fmtTime(game.best));
  // Total is continuous across laps and stops with the world — raceTime only
  // advances inside update(), which only runs while racing (D5/D7).
  setText('race', fmtTime(game.raceTime));
}

let lastCountLabel = null;
let lastLivesAnnounced = null;      // render-side memos: turn a value into an edge
let lastStateAnnounced = null;
function updateScreens() {
  toggleHidden('titleScreen', game.state !== 'title');
  toggleHidden('pauseScreen', game.state !== 'paused');
  toggleHidden('gameoverScreen', game.state !== 'gameover');
  if (canvas) canvas.classList.toggle('is-playing', game.state === 'racing');

  // Game-over result, composed live — there is nothing left to mutate it.
  if (game.state === 'gameover') {
    setText('goLaps', game.lapsDone);
    setText('goBest', fmtTime(game.best));
  }

  // Announcements. update() must never touch the DOM, so both events are turned
  // back into edges here, the same way the countdown label already is.
  if (game.state === 'gameover' && lastStateAnnounced !== 'gameover') {
    showToast(`GAME OVER · ${game.lapsDone} LAP${game.lapsDone === 1 ? '' : 'S'} · PRESS ENTER`);
  } else if (game.lives !== lastLivesAnnounced && lastLivesAnnounced !== null
             && game.lives < lastLivesAnnounced) {
    showToast(`OFF TRACK · ${game.lives} ${game.lives === 1 ? 'LIFE' : 'LIVES'} LEFT`);
  }
  lastLivesAnnounced = game.lives;
  lastStateAnnounced = game.state;

  const cd = document.getElementById('countdown');
  let label = null;
  if (game.state === 'countdown') label = String(Math.max(1, Math.ceil(game.countdown)));
  else if (game.goFlash > 0) label = 'GO!';

  if (cd) {
    if (label) {
      cd.classList.remove('is-hidden');
      if (label !== lastCountLabel) {
        cd.textContent = label;
        cd.classList.remove('pop'); void cd.offsetWidth; cd.classList.add('pop');
      }
    } else {
      cd.classList.add('is-hidden');
    }
  }
  lastCountLabel = label;

  // In-race controls hint: visible while racing until the first drive input.
  const hint = document.getElementById('hint');
  if (hint) {
    if (game.state === 'racing') {
      hint.style.display = '';
      hint.classList.toggle('is-hidden', game.started);
    } else {
      hint.style.display = 'none';
    }
  }
}

let toastTimer = null;
function showToast(msg, best) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.innerHTML = msg + (best ? ' <span class="toast__best">NEW BEST!</span>' : '');
  el.classList.toggle('toast--best', !!best);
  el.classList.add('is-show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-show'), 2200);
}

/* -------------------------------------------------------------------------
   6. LOOP + INIT
   ------------------------------------------------------------------------- */

let lastTime = null;
let accumulator = 0;
let booted = false;
let canvas;

function stepGame(dt) {
  if (game.goFlash > 0) game.goFlash = Math.max(0, game.goFlash - dt);
  if (game.lifeFlash > 0) game.lifeFlash = Math.max(0, game.lifeFlash - dt);

  if (game.state === 'countdown') {
    game.countdown -= dt;
    if (game.countdown <= 0) { game.state = 'racing'; game.goFlash = 0.7; }
    return;
  }
  if (game.state !== 'racing') return;   // title / paused: freeze the world
  update(dt);
}

function frame(now) {
  if (lastTime === null) { lastTime = now; requestAnimationFrame(frame); return; }

  let elapsed = (now - lastTime) / 1000;
  lastTime = now;
  if (elapsed > MAX_FRAME) elapsed = MAX_FRAME;

  accumulator += elapsed;
  let steps = 0;
  while (accumulator >= STEP && steps < MAX_STEPS) {
    stepGame(STEP);
    accumulator -= STEP;
    steps++;
  }
  if (steps === MAX_STEPS) accumulator = 0;

  render();
  requestAnimationFrame(frame);
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  ctx.setTransform(canvas.width / WORLD_W, 0, 0, canvas.height / WORLD_H, 0, 0);
}

function init() {
  if (booted) return;
  booted = true;

  canvas = document.getElementById('game');
  ctx = canvas.getContext('2d');
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());   // M2

  buildStart();
  buildGates();
  resetSession();
  game.state = 'title';
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  requestAnimationFrame(frame);
}

/* -------------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------------- */

function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
function rand(a, b) { return a + Math.random() * (b - a); }
function norm(x, y) { const m = Math.hypot(x, y) || 1; return { x: x / m, y: y / m }; }

function wrapAngle(a) { a %= TAU; return a < 0 ? a + TAU : a; }

// Unit tangent at a path vertex (central difference, wrapping the closed loop).
function tangentAt(i) {
  const p = TRACK.path, n = p.length;
  const a = p[(i - 1 + n) % n], b = p[(i + 1) % n];
  return norm(b.x - a.x, b.y - a.y);
}

// The gate across the track at vertex i: the corridor's exact cross-section,
// measured along the angle bisector. A corner is WIDER on the inside of the turn
// than a straight is — the two inner edges meet at HALF_W/sin(θ/2) — while the
// outside is capped by the round join at HALF_W. Spanning exactly that means no
// on-track line can slip past a checkpoint, and a plain half-width segment would
// (it under-reaches every corner). Pure: safe to call from update and render.
function gateAt(i) {
  const p = TRACK.path, n = p.length, v = p[i];
  const u = norm(p[(i - 1 + n) % n].x - v.x, p[(i - 1 + n) % n].y - v.y);
  const w = norm(p[(i + 1) % n].x - v.x, p[(i + 1) % n].y - v.y);
  const sx = u.x + w.x, sy = u.y + w.y;
  const slen = Math.hypot(sx, sy);            // = 2·cos(θ/2)

  if (slen < 1e-6) {                          // straight vertex: bisector undefined
    const t = tangentAt(i);
    return {
      a: { x: v.x - t.y * HALF_W, y: v.y + t.x * HALF_W },
      b: { x: v.x + t.y * HALF_W, y: v.y - t.x * HALF_W },
    };
  }

  const bx = sx / slen, by = sy / slen;       // bisector, into the inside of the turn
  const inner = HALF_W / Math.sqrt(Math.max(0, 1 - (slen / 2) ** 2));
  return {
    a: { x: v.x + bx * inner,  y: v.y + by * inner  },
    b: { x: v.x - bx * HALF_W, y: v.y - by * HALF_W },
  };
}

// Distance from a point to a segment.
function distPointSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
  t = clamp(t, 0, 1);
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

// Do segments p1p2 and p3p4 cross?
function segIntersect(p1, p2, p3, p4) {
  const d = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
  if (d === 0) return false;
  const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / d;
  const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / d;
  return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = String(value);
}
function toggleHidden(id, hidden) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('is-hidden', hidden);
}

// m:ss.cc; null → placeholder. Fixed shape so the HUD width is stable (I3/I4).
function fmtTime(t) {
  if (t == null) return '--:--';
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  const cs = Math.floor((t * 100) % 100);
  return `${m}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

// Path a rounded rectangle (caller fills/strokes).
function roundRect(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x,     y + h, r);
  ctx.arcTo(x,     y + h, x,     y,     r);
  ctx.arcTo(x,     y,     x + w, y,     r);
  ctx.closePath();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
