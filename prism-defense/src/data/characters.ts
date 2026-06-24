import type { CharacterDef } from '../types/game';

/**
 * Playable heroines. To add a new character, append an entry here and it will
 * automatically appear in the roster / battle deck / gacha pool.
 */
export const CHARACTERS: CharacterDef[] = [
  {
    id: 'akari',
    name: 'アカリ',
    role: '近距離アタッカー',
    rarity: 'R',
    emoji: '🌸',
    color: '#ff7ab6',
    cost: 100,
    baseHp: 120,
    baseAtk: 25,
    speed: 14,
    range: 'short',
    cooldown: 3,
    description: 'ピンク色の元気なヒロイン。前線を駆け抜けて敵を切り込む。',
  },
  {
    id: 'miu',
    name: 'ミウ',
    role: '遠距離サポート',
    rarity: 'SR',
    emoji: '💧',
    color: '#7cc7ff',
    cost: 180,
    baseHp: 80,
    baseAtk: 35,
    speed: 9,
    range: 'long',
    cooldown: 5,
    description: '水色のおっとりヒロイン。後方から魔法で援護する。',
  },
  {
    id: 'ririka',
    name: 'リリカ',
    role: '高耐久ディフェンダー',
    rarity: 'SSR',
    emoji: '🔮',
    color: '#a98bff',
    cost: 220,
    baseHp: 260,
    baseAtk: 18,
    speed: 8,
    range: 'short',
    cooldown: 7,
    description: '紫色のクールなヒロイン。壁となって仲間を守り抜く。',
  },
];

export const getCharacter = (id: string): CharacterDef | undefined =>
  CHARACTERS.find((c) => c.id === id);

/** Stat growth per level. Kept simple & data-driven for easy tuning. */
export const levelStats = (def: CharacterDef, level: number) => ({
  hp: Math.round(def.baseHp * (1 + (level - 1) * 0.15)),
  atk: Math.round(def.baseAtk * (1 + (level - 1) * 0.12)),
});

/** Coin cost to upgrade a character from `level` to `level + 1`. */
export const upgradeCost = (level: number): number => 80 + (level - 1) * 60;

export const MAX_LEVEL = 10;
