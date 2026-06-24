import type { CharacterDef } from '../types/game';

interface Props {
  def: CharacterDef;
  affordable: boolean;
  /** 0..1 remaining cooldown (0 = ready). */
  cooldown: number;
  onSummon: () => void;
}

/** Bottom-row deploy card used during battle. */
export function UnitCard({ def, affordable, cooldown, onSummon }: Props) {
  const ready = cooldown <= 0 && affordable;
  return (
    <button
      className={`unit-card ${ready ? '' : 'unit-card--off'}`}
      style={{ '--accent': def.color } as React.CSSProperties}
      disabled={!ready}
      onClick={onSummon}
    >
      <div className="unit-card__emoji">{def.emoji}</div>
      <div className="unit-card__name">{def.name}</div>
      <div className="unit-card__cost">🪙{def.cost}</div>
      {cooldown > 0 && (
        <div className="unit-card__cd" style={{ height: `${cooldown * 100}%` }} />
      )}
    </button>
  );
}
