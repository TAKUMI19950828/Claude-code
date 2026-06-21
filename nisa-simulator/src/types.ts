// ===== ドメイン型 =====

export type Pattern = 1 | 2 | 3 | 4;

/** 各ソルバーの戻り値（判別共用体）。UIは kind で分岐する。 */
export type SolveResult =
  | { kind: 'ok'; value: number }
  | { kind: 'already' } // 既に達成可能（解 ≤ 0）
  | { kind: 'unreachable'; reason: string };

/** パターン別の入力（rPercent は年率%のまま保持。計算境界で /100 する）。 */
export interface Inputs1 {
  P: number;
  C: number;
  years: number;
  rPercent: number;
}
export interface Inputs2 {
  goal: number;
  P: number;
  years: number;
  rPercent: number;
}
export interface Inputs3 {
  goal: number;
  P: number;
  C: number;
  rPercent: number;
}
export interface Inputs4 {
  goal: number;
  C: number;
  years: number;
  rPercent: number;
}

export interface InputsByPattern {
  1: Inputs1;
  2: Inputs2;
  3: Inputs3;
  4: Inputs4;
}

export type PatternInputs =
  | ({ pattern: 1 } & Inputs1)
  | ({ pattern: 2 } & Inputs2)
  | ({ pattern: 3 } & Inputs3)
  | ({ pattern: 4 } & Inputs4);

// ===== 計算結果型 =====

export interface CompareResult {
  principal: number;
  gain: number;
  nisaFinal: number;
  taxableFinal: number;
  taxSaved: number;
}

export interface LimitResult {
  monthlyOver: boolean;
  lifetimeOver: boolean;
  messages: string[];
}

export interface ChartPoint {
  year: number;
  principal: number;
  nisa: number;
  taxable: number;
}

/** 結果の詳細（answer が ok / already のとき算出可能）。 */
export interface ResultDetail {
  finalValue: number; // NISA最終資産（非課税）= 将来価値
  principal: number; // 投資元本累計
  gain: number; // 運用益
  monthly: number; // 毎月積立額（上限チェック用）
  years: number; // 期間（解決後）
  compare: CompareResult;
  limits: LimitResult;
  series: ChartPoint[];
}

export interface ComputedResult {
  pattern: Pattern;
  /** パターンごとの「答え」。p1=常にFV / p2=毎月 / p3=年数 / p4=初期 */
  answer: SolveResult;
  detail?: ResultDetail;
}
