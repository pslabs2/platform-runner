# Game Design — Platform Runner

## Pitch

A fast, juicy, retro pixel-art auto-runner. The hero sprints right through
endless, procedurally generated **zones**. Double-jump across gaps, dodge
hazards, grab coins, and hit **checkpoints** that let you keep going after a
fall. One more run, every time.

## Core loop

1. Title → press Jump / tap to start.
2. Hero auto-runs; the player only controls jumping (and optional fast-fall).
3. Each zone is a stretch of generated chunks ending at a **checkpoint flag**.
4. Falling or touching a hazard costs a **life** and respawns you at the last checkpoint.
5. Run ends when lives hit 0 → Game Over → enter 3-letter initials if it's a top-10 score.

## Controls

| Action | Keyboard | Touch |
|---|---|---|
| Jump / double-jump | Space, W, ↑ | Tap anywhere (left 2/3 of screen) |
| Variable jump height | Release early = shorter jump | Release early |
| Fast-fall | S, ↓ (in air) | Tap the bottom-right button |
| Pause | Esc, P | Pause button top-right |
| Mute | M | Settings in pause menu |

Gamepad (A = jump) is a nice-to-have.

## Mechanics

- **Auto-run**: horizontal speed set by the difficulty curve; player never steers.
- **Double-jump**: one extra jump in the air, reset when touching ground. The
  second jump has a distinct sound, a particle puff, and a short squash/stretch.
- **Game-feel helpers** (required): coyote time (~100 ms), jump buffering
  (~120 ms), variable jump height (cut upward velocity on release), and a
  terminal fall speed.
- **Checkpoints**: flag at the end of each zone. Touching it saves position,
  plays a fanfare and particle burst, and gives +1 life (max 5).
- **Lives**: start with 3. Brief invulnerability blink after respawn (1.5 s).
- **Coins**: arcs and lines that guide the player along good jump paths.
- **Hazards** (unlocked progressively): spikes, gaps, crumbling platforms,
  moving platforms (vertical then horizontal), and later simple enemies (walkers).

## Scoring

- Distance: 1 point per tile travelled.
- Coins: +10 each. A **combo** multiplier rises when coins are collected without
  touching the ground (x2, x3, max x5), displayed with a pop animation.
- Checkpoint bonus: +100 × zone number.
- Score shown in HUD with a smooth count-up tween.

## Progressive difficulty

Difficulty is a function of zone number (`zone`, starting at 1):

| Parameter | Zone 1 | Grows per zone | Cap |
|---|---|---|---|
| Run speed (px/s) | 160 | +12 | 320 |
| Max gap width | 2 tiles | +0.5 | must stay reachable with double-jump at current speed |
| Max height delta | 1 tile | +0.5 | 4 tiles |
| Hazard chance per chunk | 0% | +8% | 60% |
| Zone length (chunks) | 6 | +1 | 14 |

New hazard types unlock at zones 2 (spikes), 3 (crumbling), 4 (moving
vertical), 5 (moving horizontal), 6 (walkers). A short "NEW HAZARD!" banner
appears the first time each appears.

**Fairness rule:** every generated gap/height combination must be reachable
using the physics constants at the current run speed (see TECH_SPEC). The first
chunk after a checkpoint is always a safe flat runway.

## Visual style — retro pixel art

- Base resolution **480 × 270** (16:9), integer-scaled to fit the screen.
- Kenney *Pixel Platformer* (18×18 tiles) for characters, tiles, items, flags, HUD.
- **Parallax**: 3–4 procedurally generated layers (sky gradient, far mountains,
  near hills, clouds) with different scroll factors.
- **Zone themes**: color palette shifts every few zones (grass → desert → snow
  → night) via tile frames and parallax colors.
- **Juice**: dust on run/land, puff on double-jump, coin sparkle, screen shake on
  hit, hit-stop (~60 ms) on death, squash/stretch on jump/land, tweened HUD.

## Audio

Procedurally generated retro SFX using the Web Audio API (jump, double-jump,
coin, checkpoint, hurt, game over, UI click). Optional simple chiptune loop.
Mute setting persists in `localStorage`.

## Screens

Boot → Preloader (progress bar) → Title (best score, Play, Leaderboard,
How to play) → Game + HUD overlay → Pause overlay → Game Over (score, new-best
flash, initials entry) → Leaderboard (top 10).

## Out of scope (v1)

Online leaderboard, accounts, monetization, level editor, multiplayer.
