import type { CharacterDef } from '../types/game';
import { levelStats } from '../data/characters';
import { CharacterSprite } from './CharacterSprite';

interface Props {
  def: CharacterDef;
  level: number;
  onClick?: () => void;
}

/** Roster tile shown in the Characters screen. */
export function CharacterCard({ def, level, onClick }: Props) {
  const { hp, atk } = levelStats(def, level);
  return (
    <button className="char-card glass" onClick={onClick} style={{ '--accent': def.color } as React.CSSProperties}>
      <span className={`pill pill--${def.rarity} char-card__rarity`}>{def.rarity}</span>
      <div className="char-card__sprite" style={{ background: `radial-gradient(circle at 50% 35%, #fff, ${def.color}33)` }}>
        <CharacterSprite def={def} className="char-card__img" />
      </div>
      <div className="char-card__name">{def.name}</div>
      <div className="char-card__role muted">{def.role}</div>
      <div className="char-card__lv">Lv.{level}</div>
      <div className="char-card__stats">
        <span>❤️ {hp}</span>
        <span>⚔️ {atk}</span>
      </div>
    </button>
  );
}
