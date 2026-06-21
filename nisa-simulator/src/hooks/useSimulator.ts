import { useReducer } from 'react';
import type { ComputedResult, InputsByPattern, Pattern, PatternInputs } from '../types';
import { computeResult } from '../lib/calc';
import { decodeParams, hasShareParams } from '../lib/params';

/** 計算スナップショット（「計算する」押下時点の入力で固定した結果）。 */
interface CalcSnapshot {
  id: number; // カウントアップの再アニメ用
  sig: string; // 陳腐化検出用
  pattern: Pattern;
  result: ComputedResult;
}

export interface SimState {
  pattern: Pattern;
  inputs: InputsByPattern;
  shared: boolean; // 共有リンクで開かれた直後か
  calc: CalcSnapshot | null;
}

export type SimAction =
  | { type: 'setPattern'; pattern: Pattern }
  | { type: 'setField'; field: string; value: number }
  | { type: 'applyPreset'; rPercent: number }
  | { type: 'calculate' };

function signature(pattern: Pattern, inputs: InputsByPattern): string {
  return `${pattern}:${JSON.stringify(inputs[pattern])}`;
}

function compute(pattern: Pattern, inputs: InputsByPattern): ComputedResult {
  return computeResult({ pattern, ...inputs[pattern] } as PatternInputs);
}

function reducer(state: SimState, action: SimAction): SimState {
  switch (action.type) {
    case 'setPattern':
      return { ...state, pattern: action.pattern, shared: false };

    case 'setField': {
      const current = state.inputs[state.pattern] as unknown as Record<string, number>;
      if (!(action.field in current)) return state;
      const updated = { ...current, [action.field]: action.value };
      return {
        ...state,
        shared: false,
        inputs: { ...state.inputs, [state.pattern]: updated } as InputsByPattern,
      };
    }

    case 'applyPreset': {
      const current = state.inputs[state.pattern] as unknown as Record<string, number>;
      const updated = { ...current, rPercent: action.rPercent };
      return {
        ...state,
        shared: false,
        inputs: { ...state.inputs, [state.pattern]: updated } as InputsByPattern,
      };
    }

    case 'calculate':
      return {
        ...state,
        calc: {
          id: (state.calc?.id ?? 0) + 1,
          sig: signature(state.pattern, state.inputs),
          pattern: state.pattern,
          result: compute(state.pattern, state.inputs),
        },
      };
  }
}

/** URLは遅延初期化で1回だけ読む。共有リンク時は自動で計算済みにする。 */
function init(): SimState {
  const search = typeof window !== 'undefined' ? window.location.search : '';
  const { pattern, inputs } = decodeParams(search);
  const shared = hasShareParams(search);
  const calc: CalcSnapshot | null = shared
    ? { id: 1, sig: signature(pattern, inputs), pattern, result: compute(pattern, inputs) }
    : null;
  return { pattern, inputs, shared, calc };
}

export function useSimulator() {
  const [state, dispatch] = useReducer(reducer, undefined, init);

  const currentInputs = state.inputs[state.pattern];
  const showResult = !!state.calc && state.calc.pattern === state.pattern;
  const stale = showResult && state.calc!.sig !== signature(state.pattern, state.inputs);

  return {
    state,
    dispatch,
    currentInputs,
    result: state.calc?.result ?? null,
    calcId: state.calc?.id ?? 0,
    showResult,
    stale,
  };
}
