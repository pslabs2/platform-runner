# Acceptance Criteria

## Build & quality
- [ ] `npm install`, `npm run dev`, `npm run build`, `npm run test`, `npm run lint` all succeed.
- [ ] TypeScript strict mode, no `any` without justification.
- [ ] Unit tests cover: seeded generator determinism, reachability of every
      generated gap across zones 1–20, difficulty caps, scoring/combo, leaderboard
      (sorting, top-10 trim, corrupt-data recovery).
- [ ] GitHub Actions workflow builds, tests, and deploys to GitHub Pages.

## Gameplay
- [ ] Player auto-runs; jump and double-jump work; no triple-jump.
- [ ] Coyote time, jump buffering and variable jump height are noticeable and configurable.
- [ ] Platforms are procedurally generated, endless, and always reachable.
- [ ] Zones end at a checkpoint; dying respawns at the last checkpoint with a lives system.
- [ ] Speed, gaps and hazards increase per zone per `GAME_DESIGN.md`.
- [ ] Score = distance + coins (with combo) + checkpoint bonus.

## Presentation
- [ ] Pixel-perfect rendering at 480×270, integer-scaled; no blurry or shimmering sprites.
- [ ] Kenney Pixel Platformer art used; licenses listed in `public/assets/ASSETS.md`.
- [ ] Multi-layer parallax background; zone palette changes.
- [ ] Particles (dust, double-jump puff, coin sparkle, checkpoint burst), screen shake, hit-stop, squash/stretch.
- [ ] Procedural SFX for jump, double-jump, coin, checkpoint, hurt, game over; mute toggle persists.

## Screens & UX
- [ ] Title, HUD, Pause, Game Over, Leaderboard scenes.
- [ ] Top-10 leaderboard in `localStorage` with 3-letter initials; survives reload.
- [ ] Keyboard and touch controls; works on a phone in landscape; portrait shows rotate hint.
- [ ] Auto-pause when tab is hidden.

## Performance
- [ ] Steady 60 FPS during a 10-minute run on desktop and a modern phone.
- [ ] No growth in object count over time (pooling verified).
