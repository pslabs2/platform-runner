import Phaser from 'phaser';
import { gameConfig } from './config/game.config';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from './config/screen';

const game = new Phaser.Game(gameConfig);

function applyIntegerZoom(): void {
  const zoom = Math.max(
    1,
    Math.floor(Math.min(window.innerWidth / SCREEN_WIDTH, window.innerHeight / SCREEN_HEIGHT)),
  );
  game.scale.setZoom(zoom);
  game.canvas.style.width = `${SCREEN_WIDTH * zoom}px`;
  game.canvas.style.height = `${SCREEN_HEIGHT * zoom}px`;
}

window.addEventListener('resize', applyIntegerZoom);
applyIntegerZoom();
