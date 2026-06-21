/**
 * NISA制度の定数。レビュー反映:
 *  - checkLimits が「実際に計算で使う」定数と、解説セクションの「表示専用」定数を分離。
 *  - 死蔵定数による仕様ブレを防ぐ。
 */
export const NISA = {
  // --- checkLimits が参照する（計算用）---
  annualTsumitateCap: 1_200_000, // つみたて投資枠 年120万（= 月10万）
  lifetimeCap: 18_000_000, // 生涯投資枠 1,800万
  taxRate: 0.20315, // 運用益への課税（簡易）

  // --- 解説セクションの表示専用（ロジックでは未使用）---
  display: {
    growthAnnualCap: 2_400_000, // 成長投資枠 年240万
    totalAnnualCap: 3_600_000, // 両枠合計 年360万
    lifetimeGrowthCap: 12_000_000, // 生涯のうち成長投資枠 1,200万
  },
} as const;

/** 投資元本の累計（比較・上限チェックで共有する単一定義）。 */
export function principalTotal(P: number, C: number, years: number): number {
  return P + C * years * 12;
}
