export const ZONE_PALETTES = [
  { sky: 0x1d2b53, far: 0x306082, near: 0x5b8c5a, ground: 0x38b764 },
  { sky: 0x463239, far: 0x9a6b45, near: 0xd9a441, ground: 0xeecf6d },
  { sky: 0x243b53, far: 0x4d648d, near: 0x8db0d0, ground: 0xd9efff },
  { sky: 0x141b3a, far: 0x352c66, near: 0x614f8a, ground: 0xa57aa6 },
] as const;

export function paletteForZone(zone: number) {
  return ZONE_PALETTES[Math.floor((Math.max(1, zone) - 1) / 2) % ZONE_PALETTES.length]!;
}
