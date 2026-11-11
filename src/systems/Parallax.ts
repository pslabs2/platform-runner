import Phaser from 'phaser';
import { paletteForZone } from '../config/theme';

export class Parallax {
  private readonly farLayer: Phaser.GameObjects.TileSprite;
  private readonly nearLayer: Phaser.GameObjects.TileSprite;
  private readonly cloudLayer: Phaser.GameObjects.TileSprite;
  private readonly camera: Phaser.Cameras.Scene2D.Camera;

  constructor(private readonly scene: Phaser.Scene) {
    this.camera = scene.cameras.main;
    this.createLayerTexture('runner-far', 480, 100, 0x8db0d0, 0.7);
    this.createLayerTexture('runner-near', 480, 100, 0x5b8c5a, 0.35);
    this.createCloudTexture();
    this.farLayer = scene.add.tileSprite(240, 160, 480, 130, 'runner-far').setScrollFactor(0);
    this.nearLayer = scene.add.tileSprite(240, 218, 480, 100, 'runner-near').setScrollFactor(0);
    this.cloudLayer = scene.add.tileSprite(240, 90, 480, 100, 'runner-clouds').setScrollFactor(0);
    this.farLayer.setDepth(-30);
    this.nearLayer.setDepth(-20);
    this.cloudLayer.setDepth(-10);
    this.setZone(1);
  }

  update(delta: number): void {
    const seconds = delta / 1000;
    this.farLayer.tilePositionX += seconds * 5;
    this.nearLayer.tilePositionX += seconds * 12;
    this.cloudLayer.tilePositionX += seconds * 2;
  }

  setZone(zone: number): void {
    const palette = paletteForZone(zone);
    this.camera.setBackgroundColor(palette.sky);
    this.farLayer.setTint(palette.far);
    this.nearLayer.setTint(palette.near);
  }

  private createLayerTexture(
    key: string,
    width: number,
    height: number,
    color: number,
    heightFactor: number,
  ): void {
    if (this.scene.textures.exists(key)) return;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, Math.floor(height * (1 - heightFactor)), width, height * heightFactor);
    graphics.fillCircle(65, height * 0.7, 42);
    graphics.fillCircle(125, height * 0.75, 58);
    graphics.fillCircle(210, height * 0.68, 46);
    graphics.fillCircle(325, height * 0.75, 62);
    graphics.fillCircle(430, height * 0.68, 50);
    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }

  private createCloudTexture(): void {
    if (this.scene.textures.exists('runner-clouds')) return;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xffffff, 0.75);
    graphics.fillRect(42, 30, 66, 12);
    graphics.fillRect(58, 22, 38, 12);
    graphics.fillRect(252, 58, 52, 10);
    graphics.fillRect(267, 50, 25, 10);
    graphics.generateTexture('runner-clouds', 480, 100);
    graphics.destroy();
  }
}
