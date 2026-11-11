import Phaser from 'phaser';
import { gameAudio } from '../systems/Audio';

export function createButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  callback: () => void,
  width = 140,
): Phaser.GameObjects.Container {
  const background = scene.add.rectangle(0, 0, width, 28, 0x306082).setStrokeStyle(2, 0x8be9fd);
  const text = scene.add.text(0, 0, label, {
    fontFamily: 'monospace',
    fontSize: '13px',
    color: '#ffffff',
  }).setOrigin(0.5);
  const button = scene.add.container(x, y, [background, text]).setSize(width, 28);
  button.setInteractive(
    new Phaser.Geom.Rectangle(-width / 2, -14, width, 28),
    Phaser.Geom.Rectangle.Contains,
  );
  button.on('pointerover', () => background.setFillStyle(0x38b764));
  button.on('pointerout', () => background.setFillStyle(0x306082));
  button.on('pointerdown', () => {
    gameAudio.play('click');
    callback();
  });
  return button;
}
