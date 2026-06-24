import type { GameState } from '../hooks/useGameState';
import { STAGES } from '../data/stages';
import { StageCard } from '../components/StageCard';
import { PrimaryButton } from '../components/PrimaryButton';

interface Props {
  game: GameState;
  onStart: (stageId: string) => void;
  onHome: () => void;
}

export function StageSelectScreen({ game, onStart, onHome }: Props) {
  return (
    <div className="screen">
      <div className="screen-title">⚔️ ステージ選択</div>
      <div className="stage-list">
        {STAGES.map((stage, i) => (
          <StageCard
            key={stage.id}
            stage={stage}
            index={i}
            unlocked={game.isStageUnlocked(stage.id)}
            cleared={game.save.clearedStages.includes(stage.id)}
            onStart={() => onStart(stage.id)}
          />
        ))}
      </div>
      <div className="back-btn">
        <PrimaryButton variant="ghost" block onClick={onHome}>
          🏠 ホームに戻る
        </PrimaryButton>
      </div>
    </div>
  );
}
