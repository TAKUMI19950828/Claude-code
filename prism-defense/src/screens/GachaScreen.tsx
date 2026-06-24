import { useState } from 'react';
import type { GameState } from '../hooks/useGameState';
import { PrimaryButton } from '../components/PrimaryButton';
import { CurrencyDisplay } from '../components/CurrencyDisplay';

interface Props {
  game: GameState;
}

export function GachaScreen({ game }: Props) {
  const [phase, setPhase] = useState<'idle' | 'spin' | 'result'>('idle');
  const [result, setResult] = useState<string | null>(null);

  const pull = () => {
    if (phase === 'spin') return;
    const r = game.pullGacha();
    if (!r) return;
    setResult(r);
    setPhase('spin');
    setTimeout(() => setPhase('result'), 720);
  };

  const canPull = game.save.coins >= 100;

  return (
    <div className="screen">
      <div className="screen-title">
        🎁 ガチャ <span style={{ marginLeft: 'auto' }}><CurrencyDisplay icon="🪙" value={game.save.coins} /></span>
      </div>

      <div className="glass gacha-stage">
        {phase === 'result' ? (
          <div className="gacha-result">
            <div className="gacha-result__card">{result?.split(' ')[0]}</div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>{result}</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>を手に入れた！</div>
            <div style={{ marginTop: 16 }}>
              <PrimaryButton variant="sub" onClick={() => setPhase('idle')}>もどる</PrimaryButton>
            </div>
          </div>
        ) : (
          <>
            <div className={`gacha-orb ${phase === 'spin' ? 'gacha-orb--spin' : ''}`}>💎</div>
            <div className="muted" style={{ fontSize: 13, margin: '10px 0' }}>
              キラめくプリズムから何が出るかな？
            </div>
            <PrimaryButton size="lg" disabled={!canPull || phase === 'spin'} onClick={pull}>
              🪙100 で1回引く
            </PrimaryButton>
            {!canPull && <div style={{ color: 'var(--c-danger)', fontSize: 12, marginTop: 8, fontWeight: 800 }}>コインが足りないよ！</div>}
          </>
        )}
      </div>

      {game.save.gachaItems.length > 0 && (
        <div className="glass" style={{ padding: 14, marginTop: 14 }}>
          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 6 }}>📜 これまでの結果</div>
          <div className="gacha-history">
            {game.save.gachaItems.map((it, i) => (
              <span key={i}>{it}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
