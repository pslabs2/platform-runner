# Asset Register

Every file in `public/assets/` must be listed here. Only CC0 / public-domain
assets are allowed (no paid, no attribution-required licenses), and all assets
are stored locally — no hotlinking.

| Asset | Source | License | Path | Used for |
|---|---|---|---|---|
| Pixel Platformer (Kenney) | https://kenney.nl/assets/pixel-platformer | CC0 1.0 | `kenney/pixel-platformer/` | Characters, tiles, items, flags, HUD |

## Procedurally generated (no license needed)

- Parallax backgrounds (generated with Phaser `Graphics` → textures)
- Particle textures (generated at boot)
- Sound effects (Web Audio API synthesis)

## How to add the Kenney pack

1. Download `kenney_pixel-platformer.zip` from the source above.
2. Extract `Tilemap/tilemap_packed.png`, `Tilemap/tilemap-characters_packed.png`
   and `License.txt` into `public/assets/kenney/pixel-platformer/`.
3. Load as spritesheets with `frameWidth: 18, frameHeight: 18`.

Credit (optional but appreciated): "Art by Kenney.nl".
