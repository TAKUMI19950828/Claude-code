import type { InputsByPattern, Pattern } from '../types';

/** 入力の許容レンジ（スライダー範囲＝クランプ範囲）。 */
export const RANGE = {
  P: [0, 10_000_000],
  C: [0, 300_000],
  years: [1, 40],
  rPercent: [0, 10],
  goal: [100_000, 100_000_000],
} as const;

/** スライダーの刻み。 */
export const STEP = {
  P: 10_000,
  C: 1_000,
  years: 1,
  rPercent: 0.1,
  goal: 100_000,
} as const;

/** 初回表示で即結果が出るよう、各パターンに既定値を用意。 */
export const DEFAULTS: InputsByPattern = {
  1: { P: 1_000_000, C: 30_000, years: 20, rPercent: 5 },
  2: { goal: 10_000_000, P: 1_000_000, years: 20, rPercent: 5 },
  3: { goal: 10_000_000, P: 1_000_000, C: 30_000, rPercent: 5 },
  4: { goal: 10_000_000, C: 30_000, years: 20, rPercent: 5 },
};

type RangeKey = keyof typeof RANGE;

export function clampField(value: number, key: RangeKey): number {
  const [lo, hi] = RANGE[key];
  return Math.min(hi, Math.max(lo, value));
}

/** parse → clamp → default。NaN/Infinity/欠損は安全に default へ劣化（F）。 */
function readNum(sp: URLSearchParams, urlKey: string, rangeKey: RangeKey, def: number): number {
  const raw = sp.get(urlKey);
  if (raw == null || raw === '') return def;
  const v = Number(raw);
  return Number.isFinite(v) ? clampField(v, rangeKey) : def;
}

export interface DecodedParams {
  pattern: Pattern;
  inputs: InputsByPattern;
}

/**
 * URLクエリ → { pattern, inputs }。
 * 不正なパターンは 1 に、欠損/不正な値は default にフォールバックする。
 */
export function decodeParams(search: string): DecodedParams {
  const sp = new URLSearchParams(search);
  const p = Number(sp.get('p'));
  const pattern: Pattern = p === 1 || p === 2 || p === 3 || p === 4 ? p : 1;

  const inputs: InputsByPattern = {
    1: { ...DEFAULTS[1] },
    2: { ...DEFAULTS[2] },
    3: { ...DEFAULTS[3] },
    4: { ...DEFAULTS[4] },
  };

  // URLには現在パターンのキーだけが乗る想定。該当パターンのみ読み込む。
  switch (pattern) {
    case 1:
      inputs[1] = {
        P: readNum(sp, 'P', 'P', DEFAULTS[1].P),
        C: readNum(sp, 'C', 'C', DEFAULTS[1].C),
        years: readNum(sp, 'y', 'years', DEFAULTS[1].years),
        rPercent: readNum(sp, 'r', 'rPercent', DEFAULTS[1].rPercent),
      };
      break;
    case 2:
      inputs[2] = {
        goal: readNum(sp, 'G', 'goal', DEFAULTS[2].goal),
        P: readNum(sp, 'P', 'P', DEFAULTS[2].P),
        years: readNum(sp, 'y', 'years', DEFAULTS[2].years),
        rPercent: readNum(sp, 'r', 'rPercent', DEFAULTS[2].rPercent),
      };
      break;
    case 3:
      inputs[3] = {
        goal: readNum(sp, 'G', 'goal', DEFAULTS[3].goal),
        P: readNum(sp, 'P', 'P', DEFAULTS[3].P),
        C: readNum(sp, 'C', 'C', DEFAULTS[3].C),
        rPercent: readNum(sp, 'r', 'rPercent', DEFAULTS[3].rPercent),
      };
      break;
    case 4:
      inputs[4] = {
        goal: readNum(sp, 'G', 'goal', DEFAULTS[4].goal),
        C: readNum(sp, 'C', 'C', DEFAULTS[4].C),
        years: readNum(sp, 'y', 'years', DEFAULTS[4].years),
        rPercent: readNum(sp, 'r', 'rPercent', DEFAULTS[4].rPercent),
      };
      break;
  }

  return { pattern, inputs };
}

const intStr = (v: number) => String(Math.round(v));
const rStr = (v: number) => String(Math.round(v * 10) / 10);

/** { pattern, inputs } → URLクエリ文字列（常に円・素の整数。% は小数1桁）。 */
export function encodeParams(pattern: Pattern, inputs: InputsByPattern): string {
  const sp = new URLSearchParams();
  sp.set('p', String(pattern));
  switch (pattern) {
    case 1: {
      const i = inputs[1];
      sp.set('P', intStr(i.P));
      sp.set('C', intStr(i.C));
      sp.set('y', intStr(i.years));
      sp.set('r', rStr(i.rPercent));
      break;
    }
    case 2: {
      const i = inputs[2];
      sp.set('G', intStr(i.goal));
      sp.set('P', intStr(i.P));
      sp.set('y', intStr(i.years));
      sp.set('r', rStr(i.rPercent));
      break;
    }
    case 3: {
      const i = inputs[3];
      sp.set('G', intStr(i.goal));
      sp.set('P', intStr(i.P));
      sp.set('C', intStr(i.C));
      sp.set('r', rStr(i.rPercent));
      break;
    }
    case 4: {
      const i = inputs[4];
      sp.set('G', intStr(i.goal));
      sp.set('C', intStr(i.C));
      sp.set('y', intStr(i.years));
      sp.set('r', rStr(i.rPercent));
      break;
    }
  }
  return sp.toString();
}

/** 共有用の完全URL（origin + pathname + クエリ）。 */
export function buildShareUrl(pattern: Pattern, inputs: InputsByPattern): string {
  const base =
    typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  return `${base}?${encodeParams(pattern, inputs)}`;
}

/** URLが共有リンク（パラメータ付き）かどうか。 */
export function hasShareParams(search: string): boolean {
  return new URLSearchParams(search).has('p');
}
