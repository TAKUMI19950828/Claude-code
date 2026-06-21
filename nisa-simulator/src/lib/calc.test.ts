import { describe, expect, it } from 'vitest';
import {
  buildGrowthSeries,
  checkLimits,
  compareNisaVsTaxable,
  computeResult,
  futureValue,
  monthlyRate,
  solveInitial,
  solveMonthly,
  solveYears,
} from './calc';
import { NISA } from './nisaRules';

describe('monthlyRate', () => {
  it('年率5%を月利に換算（複利の整合）', () => {
    const rm = monthlyRate(0.05);
    expect(Math.pow(1 + rm, 12) - 1).toBeCloseTo(0.05, 10);
  });
  it('年率0%は月利0%', () => {
    expect(monthlyRate(0)).toBeCloseTo(0, 12);
  });
});

describe('futureValue', () => {
  it('r=0 のとき FV = P + C·m', () => {
    const fv = futureValue({ P: 1_000_000, C: 30_000, years: 20, rAnnual: 0 });
    expect(fv).toBeCloseTo(1_000_000 + 30_000 * 240, 6);
  });

  it('積立だけ・r=0 は単純合計', () => {
    expect(futureValue({ P: 0, C: 10_000, years: 10, rAnnual: 0 })).toBeCloseTo(1_200_000, 6);
  });

  it('r>0 では元本合計より大きい（運用益が出る）', () => {
    const P = 1_000_000;
    const C = 30_000;
    const years = 20;
    const fv = futureValue({ P, C, years, rAnnual: 0.05 });
    expect(fv).toBeGreaterThan(P + C * years * 12);
  });

  it('初期投資のみの複利（既知値）', () => {
    // P=1,000,000, r=5%, 10年 → 月利複利で約1,647,009
    const fv = futureValue({ P: 1_000_000, C: 0, years: 10, rAnnual: 0.05 });
    expect(fv).toBeCloseTo(1_000_000 * Math.pow(1.05, 10), 2);
  });
});

describe('逆算の往復整合（丸め前の実数で検証）', () => {
  const rAnnual = 0.04;

  it('solveMonthly → futureValue ≈ goal', () => {
    const goal = 10_000_000;
    const P = 500_000;
    const years = 25;
    const r = solveMonthly({ goal, P, years, rAnnual });
    expect(r.kind).toBe('ok');
    if (r.kind === 'ok') {
      expect(futureValue({ P, C: r.value, years, rAnnual })).toBeCloseTo(goal, 0);
    }
  });

  it('solveInitial → futureValue ≈ goal', () => {
    const goal = 8_000_000;
    const C = 20_000;
    const years = 20;
    const r = solveInitial({ goal, C, years, rAnnual });
    expect(r.kind).toBe('ok');
    if (r.kind === 'ok') {
      expect(futureValue({ P: r.value, C, years, rAnnual })).toBeCloseTo(goal, 0);
    }
  });

  it('solveYears → futureValue(解いた年数) ≳ goal（初到達月で切り上げ）', () => {
    const goal = 5_000_000;
    const P = 300_000;
    const C = 15_000;
    const r = solveYears({ goal, P, C, rAnnual });
    expect(r.kind).toBe('ok');
    if (r.kind === 'ok') {
      const fv = futureValue({ P, C, years: r.value, rAnnual });
      expect(fv).toBeGreaterThanOrEqual(goal - 1); // 切り上げなので goal 以上
      // 1ヶ月手前では未達であること
      const fvPrev = futureValue({ P, C, years: r.value - 1 / 12, rAnnual });
      expect(fvPrev).toBeLessThan(goal);
    }
  });

  it('r=0 でも逆算が往復一致（solveMonthly）', () => {
    const goal = 3_600_000;
    const P = 0;
    const years = 10;
    const r = solveMonthly({ goal, P, years, rAnnual: 0 });
    expect(r.kind).toBe('ok');
    if (r.kind === 'ok') {
      expect(r.value).toBeCloseTo(30_000, 6); // 360万 / 120ヶ月
      expect(futureValue({ P, C: r.value, years, rAnnual: 0 })).toBeCloseTo(goal, 6);
    }
  });
});

describe('エッジケース', () => {
  it('solveMonthly: 初期投資だけで目標到達 → already', () => {
    const r = solveMonthly({ goal: 1_000_000, P: 2_000_000, years: 10, rAnnual: 0.03 });
    expect(r.kind).toBe('already');
  });

  it('solveInitial: 積立だけで目標到達 → already', () => {
    // C=30,000 × 240ヶ月 = 720万（r>0でさらに増える）> 目標500万
    const r = solveInitial({ goal: 5_000_000, C: 30_000, years: 20, rAnnual: 0.05 });
    expect(r.kind).toBe('already');
  });

  it('solveYears: 初期投資が既に目標以上 → 0年', () => {
    const r = solveYears({ goal: 1_000_000, P: 1_500_000, C: 10_000, rAnnual: 0.05 });
    expect(r).toEqual({ kind: 'ok', value: 0 });
  });

  it('solveYears: r≤0 かつ 積立なし → unreachable', () => {
    const r = solveYears({ goal: 2_000_000, P: 1_000_000, C: 0, rAnnual: 0 });
    expect(r.kind).toBe('unreachable');
  });

  it('solveYears: 100年以内に到達しない → unreachable（数学的不可能ではない）', () => {
    // 低リターン・小額積立で1億は100年でも届かない
    const r = solveYears({ goal: 100_000_000, P: 0, C: 1_000, rAnnual: 0.001 });
    expect(r.kind).toBe('unreachable');
    if (r.kind === 'unreachable') expect(r.reason).toContain('100年');
  });

  it('solveYears: 低リターンでも十分な期間があれば到達できる', () => {
    const r = solveYears({ goal: 5_000_000, P: 0, C: 30_000, rAnnual: 0.002 });
    expect(r.kind).toBe('ok');
  });
});

describe('compareNisaVsTaxable', () => {
  it('運用益に20.315%課税・NISAは非課税で差が出る', () => {
    const principal = 7_200_000;
    const gain = 5_000_000;
    const c = compareNisaVsTaxable({ principal, gain });
    expect(c.nisaFinal).toBeCloseTo(principal + gain, 6);
    expect(c.taxSaved).toBeCloseTo(gain * NISA.taxRate, 6);
    expect(c.taxableFinal).toBeCloseTo(principal + gain * (1 - NISA.taxRate), 6);
    expect(c.nisaFinal - c.taxableFinal).toBeCloseTo(c.taxSaved, 6);
  });

  it('運用益0なら節税0', () => {
    const c = compareNisaVsTaxable({ principal: 1_000_000, gain: 0 });
    expect(c.taxSaved).toBe(0);
    expect(c.nisaFinal).toBe(c.taxableFinal);
  });

  it('運用益が負でも節税は0でガード', () => {
    const c = compareNisaVsTaxable({ principal: 1_000_000, gain: -50_000 });
    expect(c.taxSaved).toBe(0);
  });
});

describe('checkLimits', () => {
  it('毎月10万円ちょうどは超過しない', () => {
    const r = checkLimits({ monthly: 100_000, principal: 1_000_000 });
    expect(r.monthlyOver).toBe(false);
  });
  it('毎月10万円超で monthlyOver', () => {
    const r = checkLimits({ monthly: 100_001, principal: 1_000_000 });
    expect(r.monthlyOver).toBe(true);
    expect(r.messages.length).toBeGreaterThan(0);
  });
  it('元本累計1,800万円超で lifetimeOver', () => {
    const r = checkLimits({ monthly: 50_000, principal: 18_000_001 });
    expect(r.lifetimeOver).toBe(true);
  });
});

describe('buildGrowthSeries', () => {
  it('0年目は元本=NISA=課税（運用益ゼロ）', () => {
    const s = buildGrowthSeries({ P: 1_000_000, C: 30_000, years: 20, rAnnual: 0.05 });
    expect(s[0].year).toBe(0);
    expect(s[0].nisa).toBeCloseTo(s[0].principal, 6);
    expect(s[0].taxable).toBeCloseTo(s[0].principal, 6);
  });
  it('最終年は NISA ≥ 課税（非課税が有利）', () => {
    const s = buildGrowthSeries({ P: 1_000_000, C: 30_000, years: 20, rAnnual: 0.05 });
    const last = s[s.length - 1];
    expect(last.nisa).toBeGreaterThanOrEqual(last.taxable);
  });
});

describe('computeResult（パターン横断）', () => {
  it('パターン1: 答え=将来価値、detailあり', () => {
    const r = computeResult({ pattern: 1, P: 1_000_000, C: 30_000, years: 20, rPercent: 5 });
    expect(r.answer.kind).toBe('ok');
    expect(r.detail).toBeDefined();
    if (r.answer.kind === 'ok') {
      expect(r.answer.value).toBeCloseTo(r.detail!.finalValue, 6);
    }
  });

  it('パターン2: rPercent が正しく小数換算される', () => {
    const r = computeResult({ pattern: 2, goal: 10_000_000, P: 500_000, years: 25, rPercent: 4 });
    expect(r.answer.kind).toBe('ok');
    if (r.answer.kind === 'ok' && r.detail) {
      expect(futureValue({ P: 500_000, C: r.answer.value, years: 25, rAnnual: 0.04 })).toBeCloseTo(
        10_000_000,
        0,
      );
    }
  });

  it('パターン3: unreachable のとき detail なし', () => {
    const r = computeResult({ pattern: 3, goal: 100_000_000, P: 0, C: 1_000, rPercent: 0.1 });
    expect(r.answer.kind).toBe('unreachable');
    expect(r.detail).toBeUndefined();
  });

  it('パターン4: already のときも detail は算出（積立だけで到達の投影）', () => {
    const r = computeResult({ pattern: 4, goal: 5_000_000, C: 30_000, years: 20, rPercent: 5 });
    expect(r.answer.kind).toBe('already');
    expect(r.detail).toBeDefined();
  });
});
