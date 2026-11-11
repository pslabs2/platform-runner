import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Rectangle;

  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    this.add.text(240, 114, 'LOADING...', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5);
    this.add.rectangle(240, 145, 184, 12, 0x141b3a).setStrokeStyle(1, 0x8be9fd);
    this.progressBar = this.add.rectangle(150, 145, 0, 8, 0x38b764).setOrigin(0, 0.5);
    this.load.on(Phaser.Loader.Events.PROGRESS, (progress: number) => {
      this.progressBar.width = 176 * progress;
    });

    const assetPath = `${import.meta.env.BASE_URL}assets/kenney/pixel-platformer/`;
    this.load.spritesheet('kenney-tiles', `${assetPath}tilemap_packed.png`, {
      frameWidth: 18,
      frameHeight: 18,
    });
    this.load.spritesheet('kenney-characters', `${assetPath}tilemap-characters_packed.png`, {
      frameWidth: 18,
      frameHeight: 18,
    });
  }

  create(): void {
    this.createFallback('runner-player', (graphics) => {
      graphics.fillStyle(0x38b764).fillRect(3, 2, 12, 15);
      graphics.fillStyle(0xf4f4f4).fillRect(10, 5, 4, 4);
      graphics.fillStyle(0x1d2b53).fillRect(12, 6, 2, 2);
      graphics.fillStyle(0x2d1b00).fillRect(4, 15, 5, 3).fillRect(11, 15, 4, 3);
    });
    this.createFallback('runner-platform', (graphics) => {
      graphics.fillStyle(0x8f563b).fillRect(0, 4, 18, 14);
      graphics.fillStyle(0x38b764).fillRect(0, 1, 18, 5);
      graphics.fillStyle(0xa7f070).fillRect(2, 1, 5, 2);
    });
    this.createFallback('runner-coin', (graphics) => {
      graphics.fillStyle(0xffcd75).fillCircle(9, 9, 7);
      graphics.fillStyle(0xfff1a8).fillRect(7, 4, 4, 10);
    });
    this.createFallback('runner-hazard', (graphics) => {
      graphics.fillStyle(0xd95763).fillRect(1, 5, 16, 13);
      graphics.fillStyle(0xfff1a8).fillRect(4, 2, 3, 8).fillRect(11, 2, 3, 8);
    });
    this.createFallback('runner-walker', (graphics) => {
      graphics.fillStyle(0xd95763).fillRect(2, 5, 14, 11);
      graphics.fillStyle(0xf4f4f4).fillRect(4, 7, 4, 4).fillRect(11, 7, 4, 4);
      graphics.fillStyle(0x1d2b53).fillRect(6, 8, 2, 2).fillRect(12, 8, 2, 2);
    });
    this.createFallback('runner-checkpoint', (graphics) => {
      graphics.fillStyle(0xf4f4f4).fillRect(7, 1, 3, 17);
      graphics.fillStyle(0xd95763).fillRect(9, 2, 8, 6);
      graphics.fillStyle(0xffcd75).fillRect(2, 16, 14, 2);
    });
    this.createFallback('runner-particle', (graphics) => {
      graphics.fillStyle(0xfff1a8).fillRect(2, 2, 14, 14);
    });
    this.scene.start('TitleScene');
  }

  private createFallback(
    key: string,
    draw: (graphics: Phaser.GameObjects.Graphics) => void,
  ): void {
    if (this.textures.exists(key)) return;
    const graphics = this.add.graphics();
    draw(graphics);
    graphics.generateTexture(key, 18, 18);
    graphics.destroy();
  }
}
