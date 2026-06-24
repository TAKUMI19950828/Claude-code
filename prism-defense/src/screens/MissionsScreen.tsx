import type { GameState } from '../hooks/useGameState';
import type { MissionProgress } from '../types/game';

interface Props {
  game: GameState;
}

const MISSIONS: { key: keyof MissionProgress; title: string; reward: string }[] = [
  { key: 'firstClear', title: '初めてステージをクリアする', reward: '⭐ ×3' },
  { key: 'firstUpgrade', title: 'キャラを1回強化する', reward: '🪙 ×100' },
  { key: 'firstGacha', title: 'ガチャを1回引く', reward: '💎 ×1' },
];

export function MissionsScreen({ game }: Props) {
  const done = game.save.missions;
  const total = MISSIONS.filter((m) => done[m.key]).length;

  return (
    <div className="screen">
      <div className="screen-title">📋 ミッション <span className="muted" style={{ fontSize: 14, marginLeft: 'auto' }}>{total}/{MISSIONS.length}</span></div>

      {MISSIONS.map((m) => {
        const complete = done[m.key];
        return (
          <div key={m.key} className="glass mission">
            <div className={`mission__check ${complete ? 'mission__check--done' : 'mission__check--todo'}`}>
              {complete ? '✓' : ''}
            </div>
            <div className="col" style={{ flex: 1 }}>
              <div className="mission__title">{m.title}</div>
              <div className="muted" style={{ fontSize: 11 }}>報酬 {m.reward}</div>
            </div>
            <div
              className="mission__status"
              style={{ color: complete ? 'var(--c-success)' : 'var(--c-warning)' }}
            >
              {complete ? 'クリア！' : '未達成'}
            </div>
          </div>
        );
      })}
    </div>
  );
}
