import type { Screen } from '../types/game';

interface Item {
  screen: Screen;
  label: string;
  icon: string;
}

const ITEMS: Item[] = [
  { screen: 'home', label: 'ホーム', icon: '🏠' },
  { screen: 'stages', label: '出撃', icon: '⚔️' },
  { screen: 'characters', label: 'キャラ', icon: '👧' },
  { screen: 'gacha', label: 'ガチャ', icon: '🎁' },
  { screen: 'missions', label: 'ミッション', icon: '📋' },
];

interface Props {
  current: Screen;
  onNavigate: (s: Screen) => void;
}

export function BottomNav({ current, onNavigate }: Props) {
  return (
    <nav className="bottom-nav">
      {ITEMS.map((it) => (
        <button
          key={it.screen}
          className={current === it.screen ? 'active' : ''}
          onClick={() => onNavigate(it.screen)}
        >
          <span className="ico">{it.icon}</span>
          <span>{it.label}</span>
        </button>
      ))}
    </nav>
  );
}
