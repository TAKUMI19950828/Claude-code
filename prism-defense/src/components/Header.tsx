import { CurrencyDisplay } from './CurrencyDisplay';

interface Props {
  title: string;
  playerLevel: number;
  coins: number;
}

export function Header({ title, playerLevel, coins }: Props) {
  return (
    <header className="header">
      <div className="header__avatar">🌸</div>
      <div className="col">
        <span className="header__title">{title}</span>
        <span className="header__level">Lv.{playerLevel}</span>
      </div>
      <div className="header__spacer" />
      <CurrencyDisplay icon="🪙" value={coins} />
    </header>
  );
}
