import { BadRequestException } from '@nestjs/common';

export function buildPackDraw(packRarity: string): string[] {
  const randomFrom = (pool: string[], count: number): string[] =>
    Array.from(
      { length: count },
      () => pool[Math.floor(Math.random() * pool.length)],
    );

  switch (packRarity) {
    case 'common':
      return ['common'];
    case 'uncommon':
      return ['common', 'uncommon'];
    case 'rare':
      return ['rare', ...randomFrom(['common', 'uncommon'], 2)];
    case 'epic':
      return ['epic', ...randomFrom(['uncommon', 'rare'], 3)];
    case 'legendary':
      return ['legendary', ...randomFrom(['rare', 'epic'], 4)];
    default:
      throw new BadRequestException(`Unsupported pack rarity: ${packRarity}`);
  }
}
