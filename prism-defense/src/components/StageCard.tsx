import type { StageDef } from '../types/game';
import { PrimaryButton } from './PrimaryButton';

interface Props {
  stage: StageDef;
  index: number;
  unlocked: boolean;
  cleared: boolean;
  onStart: () => void;
}

export function StageCard({ stage, index, unlocked, cleared, onStart }: Props) {
  return (
    <div className={`stage-card glass ${unlocked ? '' : 'stage-card--locked'}`}>
      <div className="stage-card__thumb">
        <span className="stage-card__no">{index + 1}</span>
        {cleared && <span className="stage-card__clear">CLEAR ⭐</span>}
        {!unlocked && <span className="stage-card__lock">🔒</span>}
      </div>
      <div className="stage-card__body">
        <div className="stage-card__name">{stage.name}</div>
        <div className="stage-card__meta muted">
          <span>推奨 Lv.{stage.recommendedLevel}</span>
          <span>⚡{stage.stamina}</span>
          <span>🪙{stage.rewardCoins}</span>
        </div>
      </div>
      <PrimaryButton size="sm" disabled={!unlocked} onClick={onStart}>
        {unlocked ? '出撃' : 'ロック'}
      </PrimaryButton>
    </div>
  );
}
