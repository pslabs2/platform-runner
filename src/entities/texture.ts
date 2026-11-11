import Phaser from 'phaser';

type EntityTexture = 'player' | 'platform' | 'coin' | 'hazard' | 'walker' | 'checkpoint';

const TEXTURES: Record<EntityTexture, { fallback: string; asset: string; frame: number }> = {
  player: { fallback: 'runner-player', asset: 'kenney-characters', frame: 0 },
  platform: { fallback: 'runner-platform', asset: 'kenney-tiles', frame: 0 },
  coin: { fallback: 'runner-coin', asset: 'kenney-tiles', frame: 1 },
  hazard: { fallback: 'runner-hazard', asset: 'kenney-tiles', frame: 2 },
  walker: { fallback: 'runner-walker', asset: 'kenney-characters', frame: 1 },
  checkpoint: { fallback: 'runner-checkpoint', asset: 'kenney-tiles', frame: 3 },
};

export function entityTexture(
  scene: Phaser.Scene,
  entity: EntityTexture,
): { key: string; frame?: number } {
  const texture = TEXTURES[entity];
  return scene.textures.exists(texture.asset)
    ? { key: texture.asset, frame: texture.frame }
    : { key: texture.fallback };
}
