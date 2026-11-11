import Phaser from 'phaser';
import { gameAudio } from '../systems/Audio';

export interface MenuButton {
  container: Phaser.GameObjects.Container;
  setHighlighted(highlighted: boolean): void;
  activate(): void;
}

const IDLE_FILL = 0x306082;
const IDLE_STROKE = 0x8be9fd;
const HIGHLIGHT_FILL = 0x38b764;
const HIGHLIGHT_STROKE = 0xffcd75;

export function createButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  callback: () => void,
  width = 140,
): MenuButton {
  const background = scene.add.rectangle(0, 0, width, 28, IDLE_FILL).setStrokeStyle(2, IDLE_STROKE);
  const text = scene.add.text(0, 0, label, {
    fontFamily: 'monospace',
    fontSize: '13px',
    color: '#ffffff',
  }).setOrigin(0.5);
  const container = scene.add.container(x, y, [background, text]).setSize(width, 28);
  container.setInteractive(
    new Phaser.Geom.Rectangle(-width / 2, -14, width, 28),
    Phaser.Geom.Rectangle.Contains,
  );
  const activate = (): void => {
    gameAudio.play('click');
    callback();
  };
  container.on('pointerdown', activate);
  return {
    container,
    activate,
    setHighlighted(highlighted: boolean): void {
      background.setFillStyle(highlighted ? HIGHLIGHT_FILL : IDLE_FILL);
      background.setStrokeStyle(2, highlighted ? HIGHLIGHT_STROKE : IDLE_STROKE);
    },
  };
}
