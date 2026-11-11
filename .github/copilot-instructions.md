# Copilot Instructions — Platform Runner

A retro pixel-art, browser-based endless platformer with procedurally generated
levels and checkpoints. Read these docs **before writing code**:

1. `docs/GAME_DESIGN.md` — what the game is and how it should feel
2. `docs/TECH_SPEC.md` — architecture, folder layout, config values
3. `docs/RESEARCH.md` — verified Phaser 4 facts and pitfalls (v3 knowledge is often wrong)
4. `docs/ACCEPTANCE.md` — the definition of done
5. `public/assets/ASSETS.md` — which art to use and its licenses

## Stack (do not substitute)

- **Phaser 4** (`phaser@^4.2`) with **Arcade Physics** only — no Matter, Box2D, Rapier.
- **TypeScript** (strict) + **Vite**. npm as the package manager.
- **Vitest** for unit tests of pure logic (generator, difficulty, storage, scoring).
- No UI framework (no React/Vue). HUD and menus are Phaser scenes.
- No backend. Leaderboard uses `localStorage` behind an interface.

## Commands

```bash
npm install
npm run dev        # vite dev server
npm run build      # tsc --noEmit && vite build
npm run test       # vitest run
npm run lint       # eslint + tsc --noEmit
```

## Conventions

- Phaser 4 APIs only. If unsure whether an API exists in v4, check
  `node_modules/phaser/types/phaser.d.ts` — never guess from Phaser 3 memory.
- Keep game logic that doesn't need Phaser (level generation, difficulty curve,
  scoring, leaderboard) in plain TS modules under `src/systems/` / `src/storage/`
  so it is unit-testable without a canvas.
- All tunable numbers (gravity, speeds, jump velocity, timings) live in
  `src/config/`. No magic numbers in scenes/entities.
- Procedural generation must be **seeded** (deterministic for a given seed).
- Use object pools (Arcade `Group` with `maxSize` + `get()`/`killAndHide`)
  for platforms, coins, hazards, particles. Never create/destroy per frame.
- Pixel-perfect: integer positions for static art, integer camera zoom,
  `pixelArt: true`. Do not use non-integer scale on sprites.
- Do **not** copy `log.js` or telemetry scripts from Phaser's official templates.
- Assets: only CC0 assets stored in `public/assets/`, each recorded in
  `public/assets/ASSETS.md`. No remote asset URLs, no attribution-required licenses.
- Small, focused files (one class per file). Named exports.

## Definition of done

Every item in `docs/ACCEPTANCE.md` passes, `npm run build`, `npm run lint` and
`npm run test` succeed, and the game runs at 60 FPS on a mid-range laptop and a
modern phone.
