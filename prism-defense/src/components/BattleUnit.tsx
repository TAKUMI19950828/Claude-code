import type { BattleUnit as Unit } from '../types/game';

interface Props {
  unit: Unit;
}

/** A single SD sprite walking on the battlefield. */
export function BattleUnit({ unit }: Props) {
  const isAlly = unit.team === 'ally';
  // x is 0 (ally base) .. 100 (enemy base).
  return (
    <div
      className={`bunit ${isAlly ? 'bunit--ally' : 'bunit--enemy'} ${unit.hitFlash > 0 ? 'bunit--hit' : ''}`}
      style={{ left: `${unit.x}%` }}
    >
      <div className="bunit__hp">
        <div
          className="bunit__hp-fill"
          style={{ width: `${Math.max(0, (unit.hp / unit.maxHp) * 100)}%` }}
        />
      </div>
      <div
        className="bunit__sprite"
        style={{ background: `radial-gradient(circle at 50% 40%, #fff, ${unit.color}55)` }}
      >
        <span style={{ transform: isAlly ? 'scaleX(1)' : 'scaleX(-1)' }}>{unit.emoji}</span>
      </div>
    </div>
  );
}
