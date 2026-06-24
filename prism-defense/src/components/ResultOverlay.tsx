import { PrimaryButton } from './PrimaryButton';

interface Props {
  result: 'win' | 'lose';
  rewardCoins: number;
  onClose: () => void;
}

export function ResultOverlay({ result, rewardCoins, onClose }: Props) {
  const win = result === 'win';
  return (
    <div className="result-overlay">
      <div className={`result-banner ${win ? 'result-banner--win' : 'result-banner--lose'}`}>
        {win ? 'VICTORY!' : 'DEFEAT...'}
      </div>
      {win && (
        <div className="result-reward glass">
          <span style={{ fontSize: 40 }}>🎁</span>
          <div>
            <div className="muted" style={{ fontSize: 12 }}>獲得報酬</div>
            <div style={{ fontWeight: 900, fontSize: 22 }}>🪙 +{rewardCoins}</div>
          </div>
        </div>
      )}
      {!win && <div className="result-sub muted">もう一度挑戦してみよう！</div>}
      <PrimaryButton size="lg" variant={win ? 'primary' : 'sub'} onClick={onClose}>
        {win ? 'やった！' : 'もどる'}
      </PrimaryButton>
    </div>
  );
}
