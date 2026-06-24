import type { EnemyDef } from '../types/game';

export const ENEMIES: EnemyDef[] = [
  {
    id: 'slime',
    name: 'スライム',
    emoji: '🟣',
    color: '#b58bff',
    hp: 60,
    atk: 12,
    speed: 11,
    reward: 30,
  },
  {
    id: 'bat',
    name: 'こうもり',
    emoji: '🦇',
    color: '#6c5b9e',
    hp: 45,
    atk: 15,
    speed: 17,
    reward: 35,
  },
  {
    id: 'golem',
    name: 'ゴーレム',
    emoji: '🗿',
    color: '#8a8f9c',
    hp: 220,
    atk: 28,
    speed: 6,
    reward: 80,
  },
];

export const getEnemy = (id: string): EnemyDef | undefined =>
  ENEMIES.find((e) => e.id === id);
