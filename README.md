# platform-runner

A retro pixel-art endless platformer built with Phaser 4, TypeScript and Vite.
It has double-jump, procedurally generated zones with checkpoints, progressive
difficulty and a local high-score leaderboard.

## Run locally

```bash
npm ci
npm run dev
```

Use Space, W or ↑ to jump/double-jump; release early for a shorter jump. Use S
or ↓ to fast-fall. Touch players can tap the left two-thirds to jump and use
the on-screen fast-fall and pause controls. If the Kenney sheets are not
installed, the game uses generated 18×18 placeholder art; see
[asset instructions](public/assets/ASSETS.md).

Run `npm run build`, `npm run test` and `npm run lint` to validate changes.
For deployment, set the repository's Pages source to **GitHub Actions** once;
pushes to `main` then run the test/build/deploy workflow.

## Docs

- [Game design](docs/GAME_DESIGN.md)
- [Technical spec](docs/TECH_SPEC.md)
- [Research notes](docs/RESEARCH.md) (Phaser 4 changes, assets, techniques)
- [Acceptance criteria](docs/ACCEPTANCE.md)
- [Asset register](public/assets/ASSETS.md)
- [Copilot instructions](.github/copilot-instructions.md)
