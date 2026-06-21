// 表示フォーマット。内部計算は常に「円・実数」で行い、表示時にのみ丸める（R）。

/** 円 → ¥1,234,567（四捨五入） */
export function yen(value: number): string {
  return '¥' + Math.round(value).toLocaleString('ja-JP');
}

/** 円 → 符号つき（+¥… / −¥…） */
export function signedYen(value: number): string {
  const rounded = Math.round(value);
  const sign = rounded >= 0 ? '+' : '−';
  return sign + '¥' + Math.abs(rounded).toLocaleString('ja-JP');
}

/** 円 → 「1,284万円」（小数1桁・初心者向けの桁の読み補助） */
export function manYen(value: number): string {
  const man = Math.round(value / 1000) / 10; // 1万円未満を小数1桁に丸め
  return `${man.toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円`;
}

/** 年（実数）→ 「17年6ヶ月」/「20年」/「8ヶ月」 */
export function yearsMonths(years: number): string {
  const totalMonths = Math.max(0, Math.round(years * 12));
  const y = Math.floor(totalMonths / 12);
  const m = totalMonths % 12;
  if (totalMonths === 0) return 'すぐに達成';
  if (m === 0) return `${y}年`;
  if (y === 0) return `${m}ヶ月`;
  return `${y}年${m}ヶ月`;
}

/** 0.05 のような割合 → 「5%」「4.5%」 */
export function percent(rPercent: number): string {
  const v = Math.round(rPercent * 10) / 10;
  return `${v.toLocaleString('ja-JP', { maximumFractionDigits: 1 })}%`;
}
