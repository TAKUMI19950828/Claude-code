import { describe, expect, it } from 'vitest';
import { DEFAULTS, decodeParams, encodeParams } from './params';
import type { InputsByPattern } from '../types';

describe('decodeParams：安全な劣化', () => {
  it('空クエリ → パターン1＋既定値', () => {
    const { pattern, inputs } = decodeParams('');
    expect(pattern).toBe(1);
    expect(inputs[1]).toEqual(DEFAULTS[1]);
  });

  it('不正なパターン(p=5) → 1にフォールバック', () => {
    expect(decodeParams('?p=5').pattern).toBe(1);
    expect(decodeParams('?p=abc').pattern).toBe(1);
  });

  it('数値でない値 → 既定値にフォールバック', () => {
    const { inputs } = decodeParams('?p=1&P=abc&C=&y=xx&r=NaN');
    expect(inputs[1]).toEqual(DEFAULTS[1]);
  });

  it('範囲外の値 → クランプ', () => {
    const { inputs } = decodeParams('?p=1&P=999999999&C=-5000&y=200&r=-50');
    expect(inputs[1].P).toBe(10_000_000); // 上限
    expect(inputs[1].C).toBe(0); // 下限
    expect(inputs[1].years).toBe(40); // 上限
    expect(inputs[1].rPercent).toBe(0); // 下限
  });

  it('欠損キー → 既定値（p=2 で G 欠損）', () => {
    const { inputs } = decodeParams('?p=2&P=2000000');
    expect(inputs[2].goal).toBe(DEFAULTS[2].goal);
    expect(inputs[2].P).toBe(2_000_000);
  });

  it('Infinity → 既定値', () => {
    const { inputs } = decodeParams('?p=1&P=Infinity');
    expect(inputs[1].P).toBe(DEFAULTS[1].P);
  });
});

describe('encode → decode の往復一致', () => {
  it('パターン3の往復で値が保たれる', () => {
    const inputs: InputsByPattern = {
      ...DEFAULTS,
      3: { goal: 8_000_000, P: 500_000, C: 25_000, rPercent: 4.5 },
    };
    const q = encodeParams(3, inputs);
    const decoded = decodeParams('?' + q);
    expect(decoded.pattern).toBe(3);
    expect(decoded.inputs[3]).toEqual({ goal: 8_000_000, P: 500_000, C: 25_000, rPercent: 4.5 });
  });

  it('該当パターンのキーのみ付与される', () => {
    const q = encodeParams(4, DEFAULTS);
    const sp = new URLSearchParams(q);
    expect(sp.has('G')).toBe(true);
    expect(sp.has('C')).toBe(true);
    expect(sp.has('y')).toBe(true);
    expect(sp.has('r')).toBe(true);
    expect(sp.has('P')).toBe(false); // パターン4にPは無い
  });
});
