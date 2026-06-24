import type { BattleUnit as Unit } from '../types/game';
import { BattleUnit } from './BattleUnit';
import { HpBar } from './HpBar';

interface Props {
  units: Unit[];
  allyBaseHp: number;
  allyBaseMax: number;
  enemyBaseHp: number;
  enemyBaseMax: number;
}

export function BattleField({ units, allyBaseHp, allyBaseMax, enemyBaseHp, enemyBaseMax }: Props) {
  return (
    <div className="field">
      <div className="field__sky" />
      <div className="field__ground" />

      {/* Ally base (left) */}
      <div className="base base--ally">
        <div className="base__tower">🏰</div>
        <div className="base__hp">
          <HpBar value={allyBaseHp} max={allyBaseMax} height={7} />
        </div>
      </div>

      {/* Enemy base (right) */}
      <div className="base base--enemy">
        <div className="base__tower">🏯</div>
        <div className="base__hp">
          <HpBar value={enemyBaseHp} max={enemyBaseMax} height={7} />
        </div>
      </div>

      {/* Units */}
      <div className="field__units">
        {units.map((u) => (
          <BattleUnit key={u.uid} unit={u} />
        ))}
      </div>
    </div>
  );
}
