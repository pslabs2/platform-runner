# Research Notes

Verified on 2026-11-11. Most LLM training data and online tutorials target
**Phaser 3**. Read this before writing code.

## Versions (npm, 2026-11-11)

- `phaser` latest: **4.2.1** (4.0.0 "Caladan" released 2026-04-10)
- `vite` latest: 8.x · `typescript` latest: 7.x
- Official template `phaserjs/template-vite-ts` pins `phaser@4.0.0`, `vite@^6`, `typescript@~5.7`.
  Either set is fine. Pick versions that build cleanly together and pin them.

## Phaser 4 vs Phaser 3: what affects this game

Source: [Phaser v4.0.0 changelog](https://github.com/phaserjs/phaser/blob/master/changelog/v4/4.0/CHANGELOG-v4.0.0.md)
and its `MIGRATION-GUIDE.md` (same folder).

| Topic | Phaser 4 behavior |
|---|---|
| Renderer | New WebGL renderer built from render nodes. **Canvas renderer is deprecated**, so use `AUTO`/`WEBGL`. |
| `roundPixels` | **Defaults to `false`** in v4. Applies only to axis-aligned, unscaled objects. Set it `true` explicitly for pixel art. |
| `pixelArt` | Still supported (nearest-neighbor). There's also a new `smoothPixelArt` option for rotated or scaled pixel art. Use `pixelArt` here. |
| FX / Masks | Replaced by **Filters**, which work on any game object or camera. `preFX`/`postFX` from v3 is gone. Bloom is `Phaser.Actions.AddEffectBloom()`. |
| Tint | `setTintFill()` is removed. Use `setTint(c).setTintMode(Phaser.TintModes.FILL)`, which is handy for the white hit-flash. |
| TileSprite | Rewritten. Supports atlas/spritesheet frames, but **no texture cropping**. Fine for parallax. |
| Geometry | `Geom.Point` removed. Use `Phaser.Math.Vector2`. |
| Math | `Math.TAU` now equals 2π. `Math.PI2` removed. |
| Structs | `Phaser.Struct.Set/Map` replaced by native `Set`/`Map`. |
| Texture generation | `Create.GenerateTexture` and `TextureManager.generate` are removed. To build textures procedurally, draw with `Graphics` and call `generateTexture()`, or use a `DynamicTexture`, which **needs `.render()`** in v4. |
| Camera | Rewritten matrices. `scrollX/scrollY/zoom/startFollow` work as before. |
| Lighting | `gameObject.setLighting(true)` (optional, not needed here). |
| Arcade Physics | Same API as v3. v4 fixes group collisions and static group `refresh()`. |

**Rule:** when unsure about an API, check `node_modules/phaser/types/phaser.d.ts`.

## Official resources

- API docs: https://docs.phaser.io/api-documentation/api-documentation
- Phaser 4 examples: https://phaser.io/examples (filter by v4)
- Template: https://github.com/phaserjs/template-vite-ts. Note that its `log.js` pings `gryzor.co` on dev/build, so **don't include it**.

## Assets

- **Kenney Pixel Platformer** (CC0 1.0): 200+ sprites in an **18×18** grid. Includes
  terrain tiles, characters, enemies, items, flags and HUD elements, as both
  tilesheets and separate PNGs.
  https://kenney.nl/assets/pixel-platformer (mirror: https://kenney-assets.itch.io/pixel-platformer)
- Optional extras, also CC0 from Kenney: *Pixel Platformer Farm/Food/Industrial
  Expansion* (for zone themes) and *Pixel UI Pack* (menus).
- Kenney licenses are CC0. No attribution is required, but credit
  "Art by Kenney.nl" anyway.

## Game feel references (concepts to implement)

- **Coyote time**: you can still jump for a few ms after leaving a ledge.
- **Jump buffering**: a jump pressed shortly before landing fires on landing.
- **Variable jump height**: cut upward velocity when jump is released.
- **Squash and stretch, hit-stop, screen shake, particles**: the cheap "juice"
  that makes the game feel modern.
- Further reading: "Juice it or lose it" (Jonasson & Purho, GDC Europe 2012),
  "Math for Game Programmers: Building a Better Jump" (Kyle Pittman, GDC 2016).

## Procedural generation approach

- Chunk-based generation from a seeded PRNG (mulberry32 or sfc32, about 10 lines of TS).
- Validate each gap with jump-arc kinematics (see TECH_SPEC). Never trust
  random values without checking that the jump is possible.
- Difficulty goes up per zone. Each new hazard is introduced alone first, then mixed with others.

## Procedural audio

Web Audio API with an `OscillatorNode` (square/triangle) plus a `GainNode`
envelope and frequency ramps. Jump is a rising square blip, coin is two quick
high notes, hurt is a falling noise burst. Phaser's sound manager isn't needed
for these. Resume the `AudioContext` on the first user gesture, because
browsers enforce an autoplay policy.

## Leaderboard

`localStorage` stores about 5 MB per origin and is synchronous. It can throw in
private mode or when the quota is full, so wrap it in try/catch and fall back
to in-memory storage.
