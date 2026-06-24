import { useState } from 'react';
import type { GameState } from '../hooks/useGameState';
import { CHARACTERS, levelStats } from '../data/characters';
import { CharacterCard } from '../components/CharacterCard';
import { Modal } from '../components/Modal';
import { PrimaryButton } from '../components/PrimaryButton';

interface Props {
  game: GameState;
  onUpgrade: () => void;
}

export function CharactersScreen({ game, onUpgrade }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const openDef = CHARACTERS.find((c) => c.id === openId);
  const openLevel = openId ? game.save.characters[openId]?.level ?? 1 : 1;

  return (
    <div className="screen">
      <div className="screen-title">👧 キャラクター</div>
      <div className="char-grid">
        {CHARACTERS.map((def) => (
          <CharacterCard
            key={def.id}
            def={def}
            level={game.save.characters[def.id]?.level ?? 1}
            onClick={() => setOpenId(def.id)}
          />
        ))}
      </div>

      <Modal open={!!openDef} onClose={() => setOpenId(null)}>
        {openDef && (
          <>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className={`pill pill--${openDef.rarity}`}>{openDef.rarity}</span>
              <span className="muted" style={{ fontWeight: 800 }}>Lv.{openLevel}</span>
            </div>
            <div className="detail-sprite">
              {openDef.sprite ? (
                <img src={openDef.sprite} alt={openDef.name} style={{ width: 110, height: 110, objectFit: 'contain' }} />
              ) : (
                openDef.emoji
              )}
            </div>
            <div style={{ textAlign: 'center', fontWeight: 900, fontSize: 20 }}>{openDef.name}</div>
            <div className="muted" style={{ textAlign: 'center', fontSize: 12, marginBottom: 10 }}>
              {openDef.role}
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, margin: '0 0 8px' }}>{openDef.description}</p>
            {(() => {
              const { hp, atk } = levelStats(openDef, openLevel);
              return (
                <>
                  <div className="stat-row"><span>❤️ HP</span><b>{hp}</b></div>
                  <div className="stat-row"><span>⚔️ 攻撃力</span><b>{atk}</b></div>
                  <div className="stat-row"><span>🎯 射程</span><b>{openDef.range === 'long' ? '長め' : '近距離'}</b></div>
                  <div className="stat-row"><span>👟 速度</span><b>{openDef.speed}</b></div>
                  <div className="stat-row"><span>🪙 コスト</span><b>{openDef.cost}</b></div>
                  <div className="stat-row"><span>⏱ クールタイム</span><b>{openDef.cooldown}秒</b></div>
                </>
              );
            })()}
            <div className="row" style={{ marginTop: 14, gap: 8 }}>
              <PrimaryButton variant="ghost" block onClick={() => setOpenId(null)}>閉じる</PrimaryButton>
              <PrimaryButton variant="accent" block onClick={() => { setOpenId(null); onUpgrade(); }}>
                ⬆️ 強化へ
              </PrimaryButton>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
