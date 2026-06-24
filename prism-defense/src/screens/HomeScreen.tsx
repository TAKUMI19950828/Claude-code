import type { Screen } from '../types/game';
import { PrimaryButton } from '../components/PrimaryButton';
import { CharacterSprite } from '../components/CharacterSprite';
import { getCharacter } from '../data/characters';

interface Props {
  onNavigate: (s: Screen) => void;
}

const MENU: { screen: Screen; ico: string; label: string; desc: string }[] = [
  { screen: 'characters', ico: '👧', label: 'キャラ', desc: '仲間を確認' },
  { screen: 'upgrade', ico: '⬆️', label: '強化', desc: 'もっと強く' },
  { screen: 'gacha', ico: '🎁', label: 'ガチャ', desc: 'お楽しみ' },
  { screen: 'missions', ico: '📋', label: 'ミッション', desc: '報酬GET' },
];

export function HomeScreen({ onNavigate }: Props) {
  return (
    <div className="screen">
      <div className="home-hero">
        <div className="home-hero__sub">PRISM DEFENSE</div>
        <div className="home-hero__title">プリズムディフェンス！</div>
        <div className="home-hero__sd sd-bounce">
          <CharacterSprite def={getCharacter('akari')!} size={150} />
        </div>
        <div className="home-hero__friends">
          <CharacterSprite def={getCharacter('miu')!} size={56} />
          <CharacterSprite def={getCharacter('ririka')!} size={56} />
        </div>
      </div>

      <div style={{ margin: '0 4px 14px' }}>
        <PrimaryButton size="lg" block onClick={() => onNavigate('stages')}>
          ⚔️ 出撃する
        </PrimaryButton>
      </div>

      <div className="home-menu">
        {MENU.map((m) => (
          <button key={m.screen} className="menu-card" onClick={() => onNavigate(m.screen)}>
            <span className="menu-card__ico">{m.ico}</span>
            <span className="menu-card__label">{m.label}</span>
            <span className="menu-card__desc">{m.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
