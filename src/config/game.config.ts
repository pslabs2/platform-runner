import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { TitleScene } from '../scenes/TitleScene';
import { GameScene } from '../scenes/GameScene';
import { HUDScene } from '../scenes/HUDScene';
import { PauseScene } from '../scenes/PauseScene';
import { GameOverScene } from '../scenes/GameOverScene';
import { LeaderboardScene } from '../scenes/LeaderboardScene';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from './screen';
import { PHYSICS } from './physics';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#1d2b53',
  scale: {
    mode: Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: PHYSICS.gravity },
      debug: false,
    },
  },
  input: { activePointers: 2 },
  scene: [
    BootScene,
    PreloadScene,
    TitleScene,
    GameScene,
    HUDScene,
    PauseScene,
    GameOverScene,
    LeaderboardScene,
  ],
};
