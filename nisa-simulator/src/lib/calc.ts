import type {
  ChartPoint,
  CompareResult,
  ComputedResult,
  LimitResult,
  PatternInputs,
  ResultDetail,
  SolveResult,
} from '../types';
import { NISA, principalTotal } from './nisaRules';

const EPS = 1e-12;

/** 年率 → 月利。r_monthly = (1 + r_annual)^(1/12) − 1 */
export function monthlyRate(rAnnual: number): number {
  return Math.pow(1 + rAnnual, 1 / 12) - 1;
}

/**
 * 年金現価係数の分子: ((1+r_m)^m − 1) / r_m。
 * r_m → 0 では m に収束するため、割り算の「前」に分岐して0除算・桁落ちを回避（D）。
 */
function annuityFactor(rm: number, m: number): number {
  return Math.abs(rm) < EPS ? m : (Math.pow(1 + rm, m) - 1) / rm;
}

export interface FVParams {
  P: number;
  C: number;
  years: number;
  rAnnual: number;
}

/** パターン1: 将来価値 FV = P(1+r_m)^m + C·annuity */
export function futureValue({ P, C, years, rAnnual }: FVParams): number {
  const rm = monthlyRate(rAnnual);
  const m = years * 12;
  return P * Math.pow(1 + rm, m) + C * annuityFactor(rm, m);
}

/** パターン2: 毎月いくら必要？（C を逆算） */
export function solveMonthly(args: {
  goal: number;
  P: number;
  years: number;
  rAnnual: number;
}): SolveResult {
  const { goal, P, years, rAnnual } = args;
  const rm = monthlyRate(rAnnual);
  const m = years * 12;
  const af = annuityFactor(rm, m);
  if (af <= 0) return { kind: 'unreachable', reason: '積立期間が短すぎます。' };
  const C = (goal - P * Math.pow(1 + rm, m)) / af;
  if (!Number.isFinite(C)) return { kind: 'unreachable', reason: '計算できませんでした。' };
  if (C <= 0) return { kind: 'already' }; // 初期投資だけで目標に到達
  return { kind: 'ok', value: C };
}

/** パターン4: 初期投資額いくら必要？（P を逆算） */
export function solveInitial(args: {
  goal: number;
  C: number;
  years: number;
  rAnnual: number;
}): SolveResult {
  const { goal, C, years, rAnnual } = args;
  const rm = monthlyRate(rAnnual);
  const m = years * 12;
  const growth = Math.pow(1 + rm, m);
  if (!(growth > 0)) return { kind: 'unreachable', reason: '計算できませんでした。' };
  const P = (goal - C * annuityFactor(rm, m)) / growth;
  if (!Number.isFinite(P)) return { kind: 'unreachable', reason: '計算できませんでした。' };
  if (P <= 0) return { kind: 'already' }; // 積立だけで目標に到達
  return { kind: 'ok', value: P };
}

/** パターン3: 何年かかる？（整数月で二分探索。E のガード節を先出し） */
export function solveYears(args: {
  goal: number;
  P: number;
  C: number;
  rAnnual: number;
}): SolveResult {
  const { goal, P, C, rAnnual } = args;
  if (P >= goal) return { kind: 'ok', value: 0 }; // 今すぐ達成

  const rm = monthlyRate(rAnnual);
  // 増えない条件: 月利≤0 かつ 積立≤0 → 永久に未達
  if (rm <= 0 && C <= 0) {
    return {
      kind: 'unreachable',
      reason: '想定リターンが0%以下で積立もないため、資産は増えません。',
    };
  }

  const fvAtMonth = (m: number) => P * Math.pow(1 + rm, m) + C * annuityFactor(rm, m);
  const MAX_M = 100 * 12;
  if (fvAtMonth(MAX_M) < goal) {
    return {
      kind: 'unreachable',
      reason: '100年以内には到達しません。積立額か想定リターンを上げてみましょう。',
    };
  }

  // f(m) = fvAtMonth(m) − goal は単調増加。初めて goal に到達する整数月を求める。
  let lo = 0;
  let hi = MAX_M;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (fvAtMonth(mid) < goal) lo = mid;
    else hi = mid;
  }
  return { kind: 'ok', value: hi / 12 }; // hi=初到達月（切り上げ方向）→ 年へ
}

/**
 * NISA vs 課税口座（簡易）。
 * 仮定: 最終時点で含み益に一律 20.315% 課税・手数料無視。元本割れ時は節税0でガード（Q）。
 */
export function compareNisaVsTaxable(args: {
  principal: number;
  gain: number;
}): CompareResult {
  const { principal, gain } = args;
  const taxableGainBase = Math.max(gain, 0);
  const taxSaved = taxableGainBase * NISA.taxRate;
  const nisaFinal = principal + gain;
  const taxableFinal = principal + gain - taxSaved;
  return { principal, gain, nisaFinal, taxableFinal, taxSaved };
}

/** NISA制度上限チェック。使う定数は年120万・生涯1,800万のみ（N）。 */
export function checkLimits(args: { monthly: number; principal: number }): LimitResult {
  const { monthly, principal } = args;
  const monthlyOver = monthly * 12 > NISA.annualTsumitateCap;
  const lifetimeOver = principal > NISA.lifetimeCap;
  const messages: string[] = [];
  if (monthlyOver) {
    const capMan = NISA.annualTsumitateCap / 12 / 10000; // 月10万
    messages.push(
      `毎月の積立額が、つみたて投資枠の目安（月${capMan}万円）を超えています。`,
    );
  }
  if (lifetimeOver) {
    const lifeMan = NISA.lifetimeCap / 10000; // 1800万
    messages.push(`投資元本の累計が、生涯投資枠（${lifeMan.toLocaleString('ja-JP')}万円）を超えています。`);
  }
  return { monthlyOver, lifetimeOver, messages };
}

/** 成長グラフ用の系列（整数年）。課税系列は compareNisaVsTaxable を各年に適用（単一ソース）。 */
export function buildGrowthSeries({ P, C, years, rAnnual }: FVParams): ChartPoint[] {
  const lastYear = Math.max(1, Math.round(years));
  const points: ChartPoint[] = [];
  for (let y = 0; y <= lastYear; y++) {
    const fv = futureValue({ P, C, years: y, rAnnual });
    const principal = principalTotal(P, C, y);
    const gain = fv - principal;
    const { taxableFinal } = compareNisaVsTaxable({ principal, gain });
    points.push({ year: y, principal, nisa: fv, taxable: taxableFinal });
  }
  return points;
}

/** detail（最終資産・元本・運用益・比較・上限・系列）を組み立てる共通処理。 */
function buildDetail(P: number, C: number, years: number, rAnnual: number): ResultDetail {
  const finalValue = futureValue({ P, C, years, rAnnual });
  const principal = principalTotal(P, C, years);
  const gain = finalValue - principal;
  return {
    finalValue,
    principal,
    gain,
    monthly: C,
    years,
    compare: compareNisaVsTaxable({ principal, gain }),
    limits: checkLimits({ monthly: C, principal }),
    series: buildGrowthSeries({ P, C, years, rAnnual }),
  };
}

/**
 * パターン横断の統合計算。UIはこの ComputedResult を消費する。
 * rPercent(年率%) → rAnnual(小数) はここで変換する。
 */
export function computeResult(input: PatternInputs): ComputedResult {
  const rAnnual = input.rPercent / 100;

  switch (input.pattern) {
    case 1: {
      const { P, C, years } = input;
      const detail = buildDetail(P, C, years, rAnnual);
      return { pattern: 1, answer: { kind: 'ok', value: detail.finalValue }, detail };
    }
    case 2: {
      const { goal, P, years } = input;
      const answer = solveMonthly({ goal, P, years, rAnnual });
      if (answer.kind === 'unreachable') return { pattern: 2, answer };
      const C = answer.kind === 'ok' ? answer.value : 0; // already → 積立0で投影
      return { pattern: 2, answer, detail: buildDetail(P, C, years, rAnnual) };
    }
    case 3: {
      const { goal, P, C } = input;
      const answer = solveYears({ goal, P, C, rAnnual });
      if (answer.kind === 'unreachable') return { pattern: 3, answer };
      const years = answer.kind === 'ok' ? answer.value : 0;
      return { pattern: 3, answer, detail: buildDetail(P, C, years, rAnnual) };
    }
    case 4: {
      const { goal, C, years } = input;
      const answer = solveInitial({ goal, C, years, rAnnual });
      if (answer.kind === 'unreachable') return { pattern: 4, answer };
      const P = answer.kind === 'ok' ? answer.value : 0; // already → 初期0で投影
      return { pattern: 4, answer, detail: buildDetail(P, C, years, rAnnual) };
    }
  }
}
