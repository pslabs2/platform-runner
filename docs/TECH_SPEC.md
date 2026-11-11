# Technical Spec — Platform Runner

## Stack

| Tool | Version | Notes |
|---|---|---|
| phaser | ^4.2 | WebGL renderer, Arcade Physics |
| typescript | ^5.7 (strict) | `noUncheckedIndexedAccess: true` |
| vite | ^6 or newer | `base: './'` so the build works on GitHub Pages |
| vitest | latest | pure-logic tests only |
| eslint + typescript-eslint | latest | |

The official `phaserjs/template-vite-ts` is a good reference for the
Vite/Phaser wiring, but **don't copy its `log.js`** (it sends build telemetry).

## Folder layout

```
index.html
src/
  main.ts                    # boots Phaser
  config/
    game.config.ts           # Phaser.Types.Core.GameConfig
    physics.ts               # gravity, jump velocity, coyote/buffer ms, etc.
    difficulty.ts            # per-zone curve parameters (pure data)
    theme.ts                 # zone palettes and tile frame mappings
  scenes/
    BootScene.ts
    PreloadScene.ts
    TitleScene.ts
    GameScene.ts
    HUDScene.ts              # runs in parallel with GameScene
    PauseScene.ts
    GameOverScene.ts
    LeaderboardScene.ts
  entities/
    Player.ts                # Arcade sprite + state machine
    Platform.ts
    Coin.ts
    Hazard.ts                # spikes, crumbling, moving, walker
    Checkpoint.ts
  systems/
    LevelGenerator.ts        # pure: seed + zone -> ChunkSpec[]
    ChunkSpawner.ts          # turns ChunkSpec into pooled game objects
    Difficulty.ts            # pure: zone -> DifficultyParams
    Reachability.ts          # pure: can the player clear gap/height at speed?
    ScoreSystem.ts           # pure: distance, coins, combo
    InputController.ts       # keyboard + touch -> intents (jumpPressed, jumpHeld...)
    Parallax.ts              # procedurally generated background layers
    Effects.ts               # particles, shake, hit-stop, squash/stretch
    Audio.ts                 # Web Audio procedural SFX
    Rng.ts                   # seeded PRNG (e.g. mulberry32)
  storage/
    LeaderboardStore.ts      # interface
    LocalLeaderboardStore.ts # localStorage implementation
    Settings.ts              # mute, etc.
  ui/
    Button.ts, Banner.ts, TouchControls.ts
tests/
  LevelGenerator.test.ts, Reachability.test.ts, Difficulty.test.ts,
  ScoreSystem.test.ts, LocalLeaderboardStore.test.ts
public/assets/
  kenney/pixel-platformer/   # CC0 tilesheets (see ASSETS.md)
  ASSETS.md
```

## Game config

```ts
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,           // WebGL preferred; Canvas is deprecated in v4
  width: 480,
  height: 270,
  pixelArt: true,              // nearest-neighbor sampling
  roundPixels: true,           // v4 default is false; v4 only applies it to axis-aligned, unscaled objects
  backgroundColor: '#1d2b53',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    // Prefer integer zoom: compute and set via scale.setZoom on resize if FIT looks blurry.
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 1400 }, debug: false },
  },
  input: { activePointers: 2 },
  scene: [/* ... */],
};
```

## Physics constants (starting values — tune in `config/physics.ts`)

| Constant | Value |
|---|---|
| gravity.y | 1400 px/s² |
| jumpVelocity | -420 px/s |
| doubleJumpVelocity | -380 px/s |
| jumpCutMultiplier | 0.45 (applied to vy on early release) |
| maxFallSpeed | 600 px/s |
| fastFallSpeed | 750 px/s |
| coyoteTimeMs | 100 |
| jumpBufferMs | 120 |
| tileSize | 18 px |

## Procedural generation

- **Chunks**: the world is a sequence of chunks (~8–16 tiles wide). Each chunk is
  a `ChunkSpec` (pure data: platforms, coins, hazards, relative positions).
- `LevelGenerator.generateZone(seed, zone)` returns `ChunkSpec[]`; same input ⇒
  same output. Last chunk contains a `Checkpoint`. First chunk after a
  checkpoint is a flat safe runway.
- **Reachability check**: compute the max horizontal distance reachable for a
  given height delta using the jump arc
  (`t = time in air`, `x = runSpeed * t`, `y = v0*t + ½gt²`, single and double jump).
  Reject/regenerate any gap that exceeds 85% of that maximum (safety margin).
- **Streaming**: keep ~2 chunks ahead of the camera; recycle objects behind
  the camera back into pools.
- **Floating-point drift**: for very long runs, consider periodically rebasing
  world coordinates (shift everything left) once x exceeds ~1,000,000 px.

## Player state machine

`Running → Jumping → DoubleJumping → Falling → Landing → Running`, plus `Hurt`
and `Dead`. Animations: run, jump, fall, hurt (use Kenney character frames).

## Leaderboard

```ts
export interface ScoreEntry { initials: string; score: number; zone: number; date: string }
export interface LeaderboardStore {
  getTop(limit?: number): Promise<ScoreEntry[]>;
  submit(entry: ScoreEntry): Promise<number /* rank, -1 if not ranked */>;
  isHighScore(score: number): Promise<boolean>;
}
```

- `LocalLeaderboardStore` keeps the top 10 under key `platform-runner:leaderboard:v1`.
- Validate and clamp parsed data; corrupt JSON ⇒ reset to empty, never throw.
- Async interface so an online backend can be added later without changes to scenes.

## Responsiveness & performance

- Integer scaling, letterboxed. Handle orientation change; show a
  "rotate your device" hint in portrait on phones.
- Pause automatically on `visibilitychange` / blur.
- Target 60 FPS. Pool everything, avoid per-frame allocations in `update()`,
  pack sprites into a single atlas or spritesheet, use `TileSprite` for parallax.
- Bundle: put Phaser in its own chunk (`manualChunks`).

## Deployment

GitHub Pages via a GitHub Actions workflow (`.github/workflows/deploy.yml`):
`npm ci && npm run test && npm run build`, then upload `dist/`.
