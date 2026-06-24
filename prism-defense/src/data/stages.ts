import type { StageDef } from '../types/game';

/**
 * Stage definitions. `spawns` is a simple timeline of enemy appearances.
 * Add a new stage by appending here; unlock order follows array order.
 */
export const STAGES: StageDef[] = [
  {
    id: 'stage1',
    name: 'はじまりの草原',
    recommendedLevel: 1,
    stamina: 5,
    rewardCoins: 300,
    baseHp: 1200,
    enemyBaseHp: 350,
    spawns: [
      { at: 2, enemyId: 'slime' },
      { at: 6, enemyId: 'slime' },
      { at: 11, enemyId: 'bat' },
      { at: 16, enemyId: 'slime' },
      { at: 20, enemyId: 'bat' },
      { at: 26, enemyId: 'slime' },
      { at: 30, enemyId: 'bat' },
    ],
  },
  {
    id: 'stage2',
    name: '夕焼け商店街',
    recommendedLevel: 3,
    stamina: 8,
    rewardCoins: 500,
    baseHp: 1400,
    enemyBaseHp: 550,
    spawns: [
      { at: 2, enemyId: 'slime' },
      { at: 5, enemyId: 'bat' },
      { at: 9, enemyId: 'bat' },
      { at: 13, enemyId: 'slime' },
      { at: 16, enemyId: 'golem' },
      { at: 22, enemyId: 'bat' },
      { at: 26, enemyId: 'slime' },
      { at: 30, enemyId: 'bat' },
      { at: 34, enemyId: 'golem' },
    ],
  },
  {
    id: 'stage3',
    name: 'きらめき学園前',
    recommendedLevel: 5,
    stamina: 10,
    rewardCoins: 800,
    baseHp: 1500,
    enemyBaseHp: 800,
    spawns: [
      { at: 2, enemyId: 'bat' },
      { at: 5, enemyId: 'slime' },
      { at: 8, enemyId: 'golem' },
      { at: 13, enemyId: 'bat' },
      { at: 16, enemyId: 'bat' },
      { at: 20, enemyId: 'golem' },
      { at: 25, enemyId: 'slime' },
      { at: 29, enemyId: 'bat' },
      { at: 33, enemyId: 'golem' },
      { at: 38, enemyId: 'golem' },
    ],
  },
];

export const getStage = (id: string): StageDef | undefined =>
  STAGES.find((s) => s.id === id);
