import Phaser from 'phaser';
import type { MenuButton } from './Button';

export interface MenuNavigatorOptions {
  // Letter/Space keys are disabled while a scene needs them for text entry.
  letterKeys?: () => boolean;
  confirmKeys?: boolean;
  enabled?: () => boolean;
}

export class MenuNavigator {
  private selected = 0;

  constructor(
    scene: Phaser.Scene,
    private readonly buttons: MenuButton[],
    private readonly options: MenuNavigatorOptions = {},
  ) {
    buttons.forEach((button, index) => {
      button.container.on('pointerover', () => this.select(index));
    });
    this.select(0);
    const onKey = (event: KeyboardEvent): void => this.handleKey(event);
    scene.input.keyboard?.on('keydown', onKey);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.input.keyboard?.off('keydown', onKey);
    });
  }

  activateSelected(): void {
    this.buttons[this.selected]?.activate();
  }

  private select(index: number): void {
    this.selected = (index + this.buttons.length) % this.buttons.length;
    this.buttons.forEach((button, i) => button.setHighlighted(i === this.selected));
  }

  private handleKey(event: KeyboardEvent): void {
    if (event.repeat || this.options.enabled?.() === false) return;
    const letters = this.options.letterKeys?.() ?? true;
    if (event.code === 'ArrowUp' || (letters && event.code === 'KeyW')) {
      this.select(this.selected - 1);
    } else if (event.code === 'ArrowDown' || (letters && event.code === 'KeyS')) {
      this.select(this.selected + 1);
    } else if (
      (this.options.confirmKeys ?? true) &&
      (event.code === 'Enter' || event.code === 'NumpadEnter' || (letters && event.code === 'Space'))
    ) {
      this.activateSelected();
    }
  }
}
