// ===== Core domain types =====

export type Screen =
  | 'home'
  | 'stages'
  | 'battle'
  | 'characters'
  | 'upgrade'
  | 'gacha'
  | 'missions';

export type Rarity = 'N' | 'R' | 'SR' | 'SSR';

export type Range = 'short' | 'long';

/** Static definition of a playable heroine. Add new entries to extend the roster. */
export interface CharacterDef {
  id: string;
  name: string;
  role: string;
  rarity: Rarity;
  emoji: string;
  /** Path to a sprite image (under /public). Falls back to `emoji` if absent. */
  sprite?: string;
  /** Theme color used across cards / battle sprites. */
  color: string;
  cost: number;
  baseHp: number;
  baseAtk: number;
  /** Pixels per second the unit walks toward the enemy base. */
  speed: number;
  range: Range;
  /** Cooldown between summons, in seconds. */
  cooldown: number;
  description: string;
}

/** Static definition of an enemy type. */
export interface EnemyDef {
  id: string;
  name: string;
  emoji: string;
  color: string;
  hp: number;
  atk: number;
  speed: number;
  /** Funds rewarded to the player when defeated. */
  reward: number;
}

/** A timed enemy spawn within a stage. */
export interface SpawnEvent {
  /** Seconds after battle start. */
  at: number;
  enemyId: string;
}

export interface StageDef {
  id: string;
  name: string;
  recommendedLevel: number;
  stamina: number;
  rewardCoins: number;
  baseHp: number;
  enemyBaseHp: number;
  spawns: SpawnEvent[];
}

// ===== Persistent save data =====

export interface CharacterProgress {
  level: number;
}

export interface MissionProgress {
  firstClear: boolean;
  firstUpgrade: boolean;
  firstGacha: boolean;
}

export interface SaveData {
  coins: number;
  playerLevel: number;
  clearedStages: string[];
  /** characterId -> progress */
  characters: Record<string, CharacterProgress>;
  missions: MissionProgress;
  gachaItems: string[];
}

// ===== Live battle entities =====

export type Team = 'ally' | 'enemy';

export interface BattleUnit {
  uid: string;
  defId: string;
  team: Team;
  name: string;
  emoji: string;
  color: string;
  hp: number;
  maxHp: number;
  atk: number;
  speed: number;
  range: Range;
  reward: number;
  /** Horizontal position 0 (ally base) .. 100 (enemy base), in %. */
  x: number;
  /** Cooldown timer for this unit's own attacks. */
  attackTimer: number;
  /** Transient visual flag for the hit shake. */
  hitFlash: number;
}
