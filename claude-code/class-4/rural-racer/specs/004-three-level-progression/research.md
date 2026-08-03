# Phase 0 Research: Three-Level Progression

**Feature**: `004-three-level-progression` | **Date**: 2026-07-31

The spec carries zero `NEEDS CLARIFICATION` markers — the four decisions that mattered were settled
by the author before specification. There are no dependencies or integrations to research; the
project has none. What follows is eight implementation decisions, each with the alternatives
rejected, and one of them (R7) is the only part of this feature that could have been quietly wrong,
so it was settled numerically **before** this plan was written.

---

## R1. How the active track is selected (FR-001, FR-010)

**The problem.** `TRACK` (`game.js:42`), `CP_INDICES` (`:65`) and `HALF_W` (`:61`) are `const`s.
Eleven call sites read them: `distToPath`, `isOnTrack`, `tangentAt`, `gateAt`, `buildStart`,
`buildGates`, `placeCarAtGrid`, `updateLap`, `tracePath`, `drawTrack`, `drawStartLine`. Three of
them run every step.

**Decision**: `TRACKS` is a `const` array of three definitions. `game.level` is the index. The
active track is reached through two pure accessors:

```js
function track() { return TRACKS[game.level]; }
function halfW() { return track().width / 2; }
```

`start` and `CP_GATES` stay exactly as they are — derived caches rebuilt by the existing
`buildStart()` / `buildGates()`.

**Rationale**: the constitution's *State ownership* rule (`constitution.md:164`) permits
module-level `let` only for the loop driver, canvas handles and render-only caches. A track index is
none of those; it is simulation state, and simulation state lives on `game`. Deriving the track from
it keeps exactly one definition of "which track is being played" (Principle IV), and it means the
existing cache-rebuild functions need no new callers beyond `enterLevel()`.

`checkpoints` moves onto the track object because the checkpoint list is a property *of a track*,
not of the game. A parallel `CP_INDICES_BY_LEVEL` array would be a second thing to keep in step with
`TRACKS` — a fact with two definitions.

**Alternatives considered**:

| Alternative | Rejected because |
|---|---|
| `let TRACK = TRACKS[0]`, reassigned by `loadTrack(i)` | Zero call-site changes, which is genuinely attractive. But it is module-level mutable simulation state, which `constitution.md:164` forbids, and it creates a second source of truth: `TRACK` and `game.level` could disagree. |
| Keep `TRACK` as an alias updated alongside `TRACKS[game.level]` | Two definitions of the active track. This is the exact shape of the `CP_RADIUS` defect feature 002 existed to remove. |
| Copy the chosen track's fields onto `game` at each level change | Turns three read-only facts into three mutable ones and invites them to drift from `TRACKS`. |
| Pass the track as a parameter through every function | Correct and explicit, but it rewrites eleven signatures and their call sites for no benefit in a single-track-at-a-time game. |
| Keep one width for all three tracks so `HALF_W` stays a `const` | Removes the difficulty lever the author explicitly chose. `halfW()` costs a property read and a divide (R6). |

---

## R2. Where level state is cleared — a fourth reset scope (FR-008, FR-009, FR-027, FR-029)

**Decision**: insert a **level** lifetime between the existing car and race scopes:

| Function | Lifetime | Clears |
|---|---|---|
| `placeCarAtGrid()` | car | car, `prev`, dust, `offTrack` — **unchanged** |
| `resetLevel()` | level | + `started`, **`lives`**, `lifeFlash`, `lap`, `lapsDone`, `nextCp`, `lapTime`, `lastLap` |
| `resetRace()` | run | + `raceTime`, `runLaps`, then `enterLevel(0)` |
| `resetSession()` | session | + `bests` |

`enterLevel(i)` = `game.level = i; buildStart(); buildGates(); resetLevel();`

**Rationale**: features 002 and 003 established the rule that an operation clears its own lifetime
and nothing wider. Levels are a genuinely new lifetime, so they get a scope rather than being
smuggled into an existing one. The payoff is that **"lives refill each level" is one line moving
from `resetRace()` into `resetLevel()`** — and because `resetRace()` calls `enterLevel(0)` which
calls `resetLevel()`, restart and start-after-game-over inherit it with no further code.

**Order inside `enterLevel()` is load-bearing**: `placeCarAtGrid()` (via `resetLevel()`) reads
`start.dir` to position and orient the car, so `buildStart()` must run first. Rebuilding the gates
before the car is placed also means `game.prev` is set on the new track, so no spurious line
crossing can fire on the first step of the level.

**Alternatives considered**: clearing level state inline in `completeLap()` — rejected, it puts
lifetime management in lap logic and would need duplicating for the restart path; a single
`resetRace()` that also handles levels — rejected, that is the "one function, three lifetimes"
mistake that made pressing R wipe the best lap in the first place.

---

## R3. Two new states, and what they cost (FR-005, FR-011, FR-012, FR-015)

**Decision**: `game.state` gains `'levelup'` and `'finished'`, joining `title | countdown | racing |
paused | gameover`.

**Rationale**: `stepGame()` (`game.js:697`) already reads `if (game.state !== 'racing') return;`,
and `togglePause()` (`:245`) already acts only on `racing` and `paused`. So **FR-011 and FR-015 —
car frozen, both timers stopped, pause inert — are satisfied by the state machine that already
exists, in both new states, with no new code.** `render()` keeps running, so the frozen scene stays
behind the panel. This is the same result feature 003 got from adding `'gameover'`, and it is the
reason to spend a state rather than a boolean.

`completeLap()` therefore does one new thing:

```js
if (game.lapsDone >= LAPS_PER_LEVEL) {
  game.state = game.level < TRACKS.length - 1 ? 'levelup' : 'finished';
}
```

**The precedence question this settles.** If the last life is spent on the third lap of a level,
which wins? Game over — structurally, not by a rule. `update()` already returns early when
`loseLife()` ends the race (`:330`, established in feature 003 R3), so `updateLap()` never runs on
that step and the lap cannot complete. The spec's edge case is satisfied by code that is already
there.

**Alternatives considered**: a `game.levelCleared` boolean alongside `racing` — rejected, every
existing state guard would need a second condition and "is the world running" would have two
answers; auto-advancing with no interstitial — rejected, FR-006 requires a key press, and a timed
advance takes control away exactly when the player wants to read their result.

---

## R4. Best lap: per level to read, per session to keep (FR-033, FR-034, FR-035)

**The collision.** The author chose "BEST shows the current level's best lap". The obvious
implementation — reset `game.best` at each level change — reads identically in the HUD and is
wrong: the restart control returns to level 1 (FR-028), so restarting would destroy every record.
`constitution.md:142` forbids that outright: *"Restart MUST NOT destroy session records."*

**Decision**: `game.bests = [null, null, null]`, one slot per level, on the **session** lifetime.
`updateHud()` and `completeLap()` both index `game.bests[game.level]`.

**Rationale**: this satisfies the author's requirement exactly — the readout only ever shows a time
set on the track being driven — while keeping records on the lifetime the constitution requires.
It also gives the victory panel something worth reporting: three comparable times rather than one
meaningless minimum. Only `resetSession()` clears it, so only a page reload does.

**Alternatives considered**:

| Alternative | Rejected because |
|---|---|
| Single `game.best`, reset on level change | Destroyed by restart. Violates Principle VI. |
| Single `game.best` across all three tracks (today's behaviour) | Compares laps on a 2072 px wide-corridor track with laps on a 2395 px narrow one. The number is not meaningful and the author rejected it. |
| `bests` keyed by track name rather than index | Same information, plus a string key to keep in sync with `TRACKS`. Index is already the level. |
| Per-run bests as well as per-session | Two more fields and a second readout for a distinction no requirement asks for. |

---

## R5. Where the DOM writes go — and closing the standing violation (FR-036, FR-038)

**The problem.** `completeLap()` calls `showToast()`, which does `document.getElementById()` and
writes `innerHTML`. `completeLap()` is reached from `update()`. **That is a DOM write from the
update path, which Principle II forbids.** Feature 003 identified it, deliberately routed around it
to keep its diff scoped, and logged closing it as the next experiment (PHR 0010).

This feature adds two more player-visible events to that same function. Copying the pattern would
leave three DOM writes in `update()`.

**Decision**: move the lap toast to `updateScreens()` behind a `lastRunLapsAnnounced` memo, joining
`lastLivesAnnounced` and `lastStateAnnounced` (`game.js:612-614`). `completeLap()` then touches no
DOM at all, and **the file is left with zero Principle II exceptions.**

`game.runLaps` is monotonic across a run, which makes it a safe memo key — unlike `lapsDone`, which
resets at each level. The announcement chain is a single `else if` ladder, because the toast is one
slot:

```
finished → levelup → gameover → lap completed → life lost
```

State events outrank lap events: on the third lap of a level both fire, and "LEVEL 1 CLEARED" is
the more useful of the two.

**Rationale**: the pattern is already proven twice in this exact function. Closing the violation is
a handful of lines and is *cheaper* here than preserving it, because preserving it would mean
maintaining two different announcement mechanisms side by side in one feature.

**Note on scope**: this is a change beyond the literal requirements. It is included because the
alternative is not "leave it alone" but "add two more of them" — the smallest viable diff for this
feature is the one that unifies the path, not the one that forks it.

---

## R6. The accessor in the hot path (Performance budget)

**The concern.** `halfW()` is called by `isOnTrack()`, which runs at least once per step, and
`distToPath()` is called alongside it.

**Measured, not assumed**: `distToPath()` does a full `distPointSeg` — two subtractions, a dot
product, a clamp and a `Math.hypot` — for **every segment** of the path: 14 for level 1, 14 for
level 2, 19 for level 3. `halfW()` adds one array index, one property read and one divide per
`isOnTrack` call. That is under 1% of the work already being done in the same call, and V8 inlines
both accessors trivially since neither branches.

**Decision**: use the accessors directly, with no caching. Caching `halfW()` into a local at the top
of `update()` was considered and rejected — it would be a fourth place the active track's width is
known, for a saving that does not exist.

**Verification**: confirmed by frame-rate observation on all three levels in
[quickstart.md](./quickstart.md) L11, not by assertion here.

---

## R7. Authoring the tracks against a harness, not by eye

**This is the only part of the feature that could be quietly wrong**, so it was settled before the
plan was written rather than during implementation. A throwaway harness (`tracks-check.mjs`, in the
scratchpad, outside the repository) re-implements the pure geometry from `game.js` and applies seven
constraints to all three tracks. **Level 1 is the control: it is today's shipped circuit, so any
constraint it fails is a wrong constraint, not a wrong track.**

| # | Constraint | Why it exists |
|---|---|---|
| **C1** | Checkpoint interior angle ≥ 85° | `gateAt()` reaches `halfW/sin(θ/2)` on the inside of a turn. An acute checkpoint draws a gate far out into the grass. Level 1's tightest checkpoint is 87.0°; that set the bar. |
| **C2** | The gate covers the whole corridor at the vertex | The feature-002 property. If the gate under-spans, an on-track racing line slips past and the lap is silently voided. |
| **C3** | The starting grid is on the track, with the car's half-length of margin | `placeCarAtGrid()` spawns 26 px *backwards* along `path[0]→path[1]`. At a sharp start vertex the car spawns in the grass and loses a life before the countdown ends. |
| **C4** | Every vertex ≥ `halfW + 8` from all four edges, and every gate drawn inside the play area | The world-edge backstop must never be reachable by normal racing. |
| **C5** | Points far apart *along the loop* stay > `width` apart *in the plane* | `isOnTrack` is distance-to-**any**-segment, so two corridors passing close together fuse into one — an on-track shortcut that checkpoint ordering only partly blocks. |
| **C6** | Exactly 4 checkpoints, smallest gap ≥ 12% of the lap | Evenly spread checkpoints are what make ordering a real constraint. |
| **C7** | No corner tighter than 70° | Below that the corridor folds back on itself and the corner stops being driveable. |

**Result: 51 assertions, ALL PASSED.**

**Two findings from running it.**

1. **C2 was wrong on its first run**, reporting 180 px and 152 px "leaks" on levels 2 and 3. The
   test sampled the bisector out to a fixed radius, which walked clean off the local corridor and
   into a *different, unrelated part of the loop* — on-track, but nothing to do with that gate. The
   fix is to stop at the first off-track sample in each direction, which is what the property
   actually says. The tracks were never wrong; the test was. **C5 is what guarantees those distant
   corridors are disjoint in the first place**, so the two constraints are load-bearing for each
   other.

2. **The first draft of level 2 was easier than level 1**, which fails FR-020. It had 2 corners
   under 120° against level 1's 6, and its narrower corridor did not make up for it — a fast track
   with two corners is not a harder track. It was rewritten with an S-kink and a left-side sequence.
   Without C7's measured corner census this would have been discovered by a human, after
   implementation, or not at all.

**The tracks, as settled:**

| Level | Name | Width | Vertices | Corners < 120° | Tightest | Lap | Corridor ÷ car |
|---|---|---|---|---|---|---|---|
| 1 | Meadow Loop | 82 | 14 | 6 | 77.6° | 2072 px | 2.41 |
| 2 | Mill Creek | 72 | 14 | 8 | 75.4° | 2158 px | 2.12 |
| 3 | Quarry Ridge | 62 | 19 | 12 | 78.9° | 2395 px | 1.82 |

**The difficulty claim, stated honestly.** Two measures rise monotonically: corridor width relative
to the car (2.41 → 2.12 → 1.82) and the number of corners demanding a real speed reduction
(6 → 8 → 12). **The single tightest corner does not** (77.6° → 75.4° → 78.9°) and is not claimed to.
FR-020 is therefore *supported* by measurement but **closed only by SC-008**, which needs a human
across repeated trials. The harness measures the ladder; it does not judge it.

Character, for the record: **Mill Creek** is a long bottom straight into a right-hand sweep, a
proper S-kink, then a deep V-notch dive at the top and a technical left side. **Quarry Ridge** is a
serpentine with no long straight at all — a bottom double-chicane, two kinks up the right, and three
alternating tight corners down the left.

---

## R8. Presenting level and lap progress (FR-031, FR-032, FR-036, FR-040)

**Decision**:

- `LAP` (top row, existing) becomes `n/3` — lap within the level over laps required.
- A new `LEVEL` panel showing `n/3` goes in `.hud__row--bottom`, between `LIVES` and `SPEED`.
- `BEST` (top row, existing) indexes `game.bests[game.level]`; no new panel.
- The level name appears on the level-cleared panel and is announced with it.

**Rationale**: the bottom row is already `justify-content: space-between` from feature 003, so a
third panel lays out as left/centre/right with no CSS change at all. The top row already carries
four panels and a fifth would crowd it. `LAP` reading `2/3` instead of `2` costs nothing — the
existing `min-width: 3ch` on `.hud__value` already reserves exactly three characters, so FR-040
holds without touching the stylesheet.

**Alternatives considered**: a fifth top-row panel — rejected, five panels overflow a narrow stage;
three pips per lap — rejected for the same reason feature 003 rejected hearts, it encodes one fact
twice and needs a parallel `aria-label`; putting the level name permanently in the HUD — rejected,
it is a fixed string that changes twice a run and would cost a variable-width panel.

---

## Cross-cutting confirmations

- **No dependency, build step, storage or network** is introduced by any decision above.
- **No decision puts a canvas call or DOM write in the update path**, and R5 *removes* the one that
  was already there.
- **No decision introduces a wall-clock read** or any new time-dependent code; `raceTime` already
  integrates from the fixed `dt` and this feature changes only when it is reset.
- **`gateAt()` is not touched.** It was proven correct in feature 002 and re-proven here on two new
  tracks; any simplification of it re-opens that defect.
- **`game.level` is the single definition** of which track is being played; every consumer derives
  from it (R1).
- Every decision above is covered by at least one success criterion and one step in
  [quickstart.md](./quickstart.md).
