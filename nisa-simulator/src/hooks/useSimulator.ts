import { useMemo, useReducer } from 'react';
import type { ComputedResult, InputsByPattern, Pattern, PatternInputs } from '../types';
import { computeResult } from '../lib/calc';
import { decodeParams, hasShareParams } from '../lib/params';

export interface SimState {
  pattern: Pattern;
  inputs: InputsByPattern;
  shared: boolean; // 共有リンクで開かれた直後か
}

export type SimAction =
  | { type: 'setPattern'; pattern: Pattern }
  | { type: 'setField'; field: string; value: number }
  | { type: 'applyPreset'; rPercent: number }
  | { type: 'dismissShared' };

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

    case 'dismissShared':
      return { ...state, shared: false };
  }
}

/** URLは遅延初期化で1回だけ読む（初期化レース回避・M）。 */
function init(): SimState {
  const search = typeof window !== 'undefined' ? window.location.search : '';
  const { pattern, inputs } = decodeParams(search);
  return { pattern, inputs, shared: hasShareParams(search) };
}

export function useSimulator() {
  const [state, dispatch] = useReducer(reducer, undefined, init);

  const currentInputs = state.inputs[state.pattern];

  // 計算は純関数なので render 中に算出（effect不要）。入力が変われば即再計算される。
  const result: ComputedResult = useMemo(() => {
    const input = { pattern: state.pattern, ...currentInputs } as PatternInputs;
    return computeResult(input);
  }, [state.pattern, currentInputs]);

  return { state, dispatch, currentInputs, result };
}
