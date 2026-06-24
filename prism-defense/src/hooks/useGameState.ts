import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { SaveData } from '../types/game';
import { CHARACTERS, MAX_LEVEL, levelStats, upgradeCost } from '../data/characters';
import { getCharacter } from '../data/characters';
import { STAGES } from '../data/stages';

const STORAGE_KEY = 'prism-defense-save-v1';

const defaultSave = (): SaveData => ({
  coins: 500,
  playerLevel: 1,
  clearedStages: [],
  characters: Object.fromEntries(CHARACTERS.map((c) => [c.id, { level: 1 }])),
  missions: { firstClear: false, firstUpgrade: false, firstGacha: false },
  gachaItems: [],
});

/**
 * Central game state hook. Wraps the persisted save and exposes intent-style
 * actions so screens never mutate storage directly.
 */
export function useGameState() {
  const [save, setSave] = useLocalStorage<SaveData>(STORAGE_KEY, defaultSave());

  // Heal any missing keys when the roster grows between versions.
  const safeSave = useMemo<SaveData>(() => {
    const base = defaultSave();
    return {
      ...base,
      ...save,
      characters: { ...base.characters, ...save.characters },
      missions: { ...base.missions, ...save.missions },
    };
  }, [save]);

  const addCoins = useCallback(
    (amount: number) => setSave((s) => ({ ...s, coins: Math.max(0, s.coins + amount) })),
    [setSave],
  );

  const isStageUnlocked = useCallback(
    (stageId: string): boolean => {
      const idx = STAGES.findIndex((s) => s.id === stageId);
      if (idx <= 0) return true;
      return safeSave.clearedStages.includes(STAGES[idx - 1].id);
    },
    [safeSave.clearedStages],
  );

  const clearStage = useCallback(
    (stageId: string, reward: number) => {
      setSave((s) => {
        const cleared = s.clearedStages.includes(stageId)
          ? s.clearedStages
          : [...s.clearedStages, stageId];
        // First clear of a *new* stage grants full reward + a player level.
        const isNew = !s.clearedStages.includes(stageId);
        return {
          ...s,
          coins: s.coins + reward,
          clearedStages: cleared,
          playerLevel: isNew ? s.playerLevel + 1 : s.playerLevel,
          missions: { ...s.missions, firstClear: true },
        };
      });
    },
    [setSave],
  );

  const upgradeCharacter = useCallback(
    (charId: string): boolean => {
      const cur = safeSave.characters[charId];
      if (!cur || cur.level >= MAX_LEVEL) return false;
      const cost = upgradeCost(cur.level);
      if (safeSave.coins < cost) return false;
      setSave((s) => ({
        ...s,
        coins: s.coins - cost,
        characters: {
          ...s.characters,
          [charId]: { level: (s.characters[charId]?.level ?? 1) + 1 },
        },
        missions: { ...s.missions, firstUpgrade: true },
      }));
      return true;
    },
    [safeSave, setSave],
  );

  const pullGacha = useCallback((): string | null => {
    if (safeSave.coins < 100) return null;
    const pool = ['✨ プリズムのかけら', '🪙 コイン +50', '🎀 リボン', '⭐ スターピース', '💎 ジェム'];
    const result = pool[Math.floor(Math.random() * pool.length)];
    setSave((s) => ({
      ...s,
      coins: s.coins - 100 + (result.includes('コイン') ? 50 : 0),
      gachaItems: [result, ...s.gachaItems].slice(0, 30),
      missions: { ...s.missions, firstGacha: true },
    }));
    return result;
  }, [safeSave.coins, setSave]);

  /** Resolve final battle stats for a character given its saved level. */
  const charStats = useCallback((charId: string) => {
    const def = getCharacter(charId)!;
    const level = safeSave.characters[charId]?.level ?? 1;
    const { hp, atk } = levelStats(def, level);
    return { def, level, hp, atk };
  }, [safeSave.characters]);

  const resetSave = useCallback(() => setSave(defaultSave()), [setSave]);

  return {
    save: safeSave,
    addCoins,
    isStageUnlocked,
    clearStage,
    upgradeCharacter,
    pullGacha,
    charStats,
    resetSave,
  };
}

export type GameState = ReturnType<typeof useGameState>;
