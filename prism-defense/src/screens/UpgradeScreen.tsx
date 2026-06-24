import { useState } from 'react';
import type { GameState } from '../hooks/useGameState';
import { CHARACTERS, MAX_LEVEL, levelStats, upgradeCost } from '../data/characters';
import { PrimaryButton } from '../components/PrimaryButton';
import { CurrencyDisplay } from '../components/CurrencyDisplay';

interface Props {
  game: GameState;
}

export function UpgradeScreen({ game }: Props) {
  const [burst, setBurst] = useState(false);

  const doUpgrade = (id: string) => {
    if (game.upgradeCharacter(id)) {
      setBurst(true);
      setTimeout(() => setBurst(false), 600);
    }
  };

  return (
    <div className="screen">
      <div className="screen-title">
        ⬆️ 強化 <span style={{ marginLeft: 'auto' }}><CurrencyDisplay icon="🪙" value={game.save.coins} /></span>
      </div>

      {CHARACTERS.map((def) => {
        const level = game.save.characters[def.id]?.level ?? 1;
        const maxed = level >= MAX_LEVEL;
        const cost = upgradeCost(level);
        const cur = levelStats(def, level);
        const next = levelStats(def, Math.min(MAX_LEVEL, level + 1));
        const can = !maxed && game.save.coins >= cost;
        return (
          <div key={def.id} className="glass" style={{ padding: 14, marginBottom: 12 }}>
            <div className="row">
              <div
                className="char-card__sprite"
                style={{ width: 56, height: 56, margin: 0, background: `radial-gradient(circle at 50% 35%, #fff, ${def.color}33)` }}
              >
                <span style={{ fontSize: 30 }}>{def.emoji}</span>
              </div>
              <div className="col" style={{ flex: 1 }}>
                <div style={{ fontWeight: 900 }}>{def.name} <span className="muted" style={{ fontSize: 12 }}>Lv.{level}</span></div>
                <div style={{ fontSize: 12, marginTop: 2 }}>
                  ❤️ {cur.hp}{!maxed && <span className="muted"> → {next.hp}</span>}
                  {'　'}⚔️ {cur.atk}{!maxed && <span className="muted"> → {next.atk}</span>}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              {maxed ? (
                <PrimaryButton variant="ghost" block disabled>MAX LEVEL ⭐</PrimaryButton>
              ) : (
                <PrimaryButton variant="accent" block disabled={!can} onClick={() => doUpgrade(def.id)}>
                  強化する 🪙{cost}
                </PrimaryButton>
              )}
            </div>
          </div>
        );
      })}

      {burst && (
        <div className="upg-burst"><span>UP! ✨</span></div>
      )}
    </div>
  );
}
