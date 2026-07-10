import { useEffect, useMemo, useRef, useState } from 'react'
import { categories } from '../data/categories'
import { formatYen } from '../utils/diagnose'

export default function AmountScreen({ answers, onChange, onComplete, onBack }) {
  const [index, setIndex] = useState(0)
  const [anim, setAnim] = useState('animate-fade-slide')
  const cat = categories[index]
  const total = categories.length

  // 現在の入力値（未回答は空文字扱い）
  const raw = answers[cat.key]
  const value = raw === undefined || raw === null ? '' : Number(raw)

  const progress = Math.round(((index + (value !== '' ? 1 : 0)) / total) * 100)

  const setValue = (v) => onChange(cat.key, v)

  const goNext = () => {
    // 未入力なら 0 円として確定
    if (value === '') setValue(0)
    if (index < total - 1) {
      setAnim('')
      requestAnimationFrame(() => {
        setIndex((i) => i + 1)
        setAnim('animate-fade-slide')
      })
    } else {
      onComplete()
    }
  }

  const goPrev = () => {
    if (index === 0) {
      onBack()
      return
    }
    setAnim('')
    requestAnimationFrame(() => {
      setIndex((i) => i - 1)
      setAnim('animate-fade-slide')
    })
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col px-5 py-6">
      {/* 進捗バー */}
      <div className="mb-6 pt-2">
        <div className="mb-2 flex items-center justify-between text-sm font-bold text-slate-500">
          <button onClick={goPrev} className="text-pop-purple/70 hover:text-pop-purple">
            ← もどる
          </button>
          <span>
            {index + 1} / {total} 問
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-white/70 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-pop-pink via-pop-purple to-pop-blue transition-all duration-500 ease-out"
            style={{ width: `${Math.max(progress, 4)}%` }}
          />
        </div>
      </div>

      {/* カード（項目ごとにふわっと切り替え） */}
      <div key={cat.key} className={`card flex-1 p-6 sm:p-8 ${anim}`}>
        <div className="mb-6 text-center">
          <div className="mb-3 text-6xl animate-float">{cat.emoji}</div>
          <h2 className="text-2xl font-extrabold">{cat.label}</h2>
          <p className="mt-2 text-sm font-medium text-slate-500">{cat.hint}</p>
          <p className="mt-1 text-xs font-medium text-slate-400">1ヶ月あたりの金額（円）</p>
        </div>

        <AmountInput
          value={value}
          onChange={setValue}
          max={cat.slider.max}
          step={cat.slider.step}
        />

        {/* わからない / 使ってない */}
        <button
          onClick={() => {
            setValue(0)
            goNext()
          }}
          className="mt-5 w-full rounded-2xl border-2 border-dashed border-slate-300 bg-white/50 py-3 text-sm font-bold text-slate-500 transition active:scale-95 hover:border-pop-purple/40 hover:text-pop-purple"
        >
          🤔 わからない / 使ってない（0円）
        </button>

        <button onClick={goNext} className="btn-pop mt-4 w-full">
          {index < total - 1 ? '次へ 👉' : '結果をみる 🎉'}
        </button>
      </div>
    </div>
  )
}

function AmountInput({ value, onChange, max, step }) {
  const [text, setText] = useState(value === '' ? '' : String(value))
  const composing = useRef(false)

  // 外部（スライダー・もどる）で値が変わったら表示テキストも同期
  useEffect(() => {
    if (composing.current) return
    setText(value === '' ? '' : String(value))
  }, [value])

  const display = useMemo(
    () => (value === '' ? '0' : formatYen(value)),
    [value],
  )

  const handleText = (e) => {
    const digits = e.target.value.replace(/[^0-9]/g, '')
    setText(digits)
    onChange(digits === '' ? 0 : Number(digits))
  }

  return (
    <div>
      {/* 大きめの金額表示 */}
      <div className="mb-4 flex items-end justify-center gap-1">
        <span className="pb-1 text-2xl font-bold text-pop-purple">¥</span>
        <span className="text-5xl font-extrabold tabular-nums tracking-tight text-slate-800">
          {display}
        </span>
      </div>

      {/* スライダー */}
      <input
        type="range"
        min={0}
        max={max}
        step={step}
        value={value === '' ? 0 : Math.min(value, max)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-gradient-to-r from-pop-mint via-pop-blue to-pop-pink"
        aria-label="金額スライダー"
      />
      <div className="mt-1 flex justify-between text-xs font-medium text-slate-400">
        <span>0円</span>
        <span>{formatYen(max)}円+</span>
      </div>

      {/* テンキー風の直接入力 */}
      <div className="mt-5">
        <label className="mb-2 block text-center text-xs font-bold text-slate-500">
          数字で直接入力もOK 👇
        </label>
        <div className="flex items-center gap-2 rounded-2xl border-2 border-pop-purple/30 bg-white px-4 py-3 focus-within:border-pop-purple">
          <span className="text-xl font-bold text-pop-purple">¥</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={text}
            onChange={handleText}
            onCompositionStart={() => (composing.current = true)}
            onCompositionEnd={(e) => {
              composing.current = false
              handleText(e)
            }}
            placeholder="0"
            className="w-full bg-transparent text-right text-2xl font-extrabold tabular-nums text-slate-800 outline-none placeholder:text-slate-300"
            aria-label="金額を直接入力"
          />
          <span className="text-sm font-bold text-slate-400">円</span>
        </div>
        {/* クイック加算ボタン */}
        <div className="mt-3 grid grid-cols-4 gap-2">
          {[1000, 5000, 10000, 30000].map((amt) => (
            <button
              key={amt}
              onClick={() => onChange((value === '' ? 0 : value) + amt)}
              className="rounded-xl bg-pop-purple/10 py-2 text-sm font-bold text-pop-purple transition active:scale-95 hover:bg-pop-purple/20"
            >
              +{amt / 1000}千
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
