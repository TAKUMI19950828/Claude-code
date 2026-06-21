/** 想定リターンの「目安から選ぶ」チップ。数値は一般的な過去実績ベースの目安（保証ではない）。 */
export interface ReturnPreset {
  label: string;
  short: string;
  rPercent: number;
  emoji: string;
}

export const RETURN_PRESETS: ReturnPreset[] = [
  { label: '全世界株式インデックス', short: '全世界株式', rPercent: 5, emoji: '🌍' },
  { label: 'S&P500（米国株式）', short: 'S&P500', rPercent: 7, emoji: '🇺🇸' },
  { label: '国内株式インデックス', short: '国内株式', rPercent: 4, emoji: '🗾' },
  { label: 'バランス型（株式＋債券）', short: 'バランス型', rPercent: 3, emoji: '⚖️' },
  { label: '預金・低リスク', short: '預金・低リスク', rPercent: 0.2, emoji: '🐷' },
];

export const RETURN_DISCLAIMER =
  'これらはあくまで過去の実績にもとづく一般的な目安です。将来の運用成果を保証するものではありません。';
