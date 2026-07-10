import { useState } from 'react'
import { ageGroups, genders } from '../data/categories'

export default function AttributeScreen({ initial, onSubmit, onBack }) {
  const [ageKey, setAgeKey] = useState(initial?.ageKey || '')
  const [genderKey, setGenderKey] = useState(initial?.genderKey || '')

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col justify-center px-5 py-10">
      <div className="card animate-pop-in p-6 sm:p-8">
        <button
          onClick={onBack}
          className="mb-4 text-sm font-bold text-pop-purple/70 transition hover:text-pop-purple"
        >
          ← もどる
        </button>

        <h2 className="mb-1 text-2xl font-extrabold">まずはあなたのことを教えて！</h2>
        <p className="mb-6 text-sm font-medium text-slate-500">
          比較する「同世代の平均」を選ぶために使うよ📊
        </p>

        {/* 年代（必須） */}
        <div className="mb-7">
          <p className="mb-3 font-bold">
            年代 <span className="text-pop-pink">*必須</span>
          </p>
          <div className="grid grid-cols-3 gap-3">
            {ageGroups.map((a) => {
              const active = ageKey === a.key
              return (
                <button
                  key={a.key}
                  onClick={() => setAgeKey(a.key)}
                  className={`flex flex-col items-center gap-1 rounded-3xl border-2 px-2 py-4 font-bold transition active:scale-95 ${
                    active
                      ? 'border-transparent bg-gradient-to-br from-pop-pink to-pop-purple text-white shadow-pop'
                      : 'border-pop-purple/20 bg-white/70 text-slate-700 hover:border-pop-purple/50'
                  }`}
                >
                  <span className="text-2xl">{a.emoji}</span>
                  <span className="text-sm">{a.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 性別（任意・スキップ可） */}
        <div className="mb-8">
          <p className="mb-3 font-bold">
            性別 <span className="text-xs font-medium text-slate-400">（任意・答えなくてもOK）</span>
          </p>
          <div className="grid grid-cols-4 gap-2">
            {genders.map((g) => {
              const active = genderKey === g.key
              return (
                <button
                  key={g.key}
                  onClick={() => setGenderKey(active ? '' : g.key)}
                  className={`flex flex-col items-center gap-1 rounded-2xl border-2 px-1 py-3 text-xs font-bold transition active:scale-95 ${
                    active
                      ? 'border-transparent bg-pop-blue text-white shadow-card'
                      : 'border-pop-blue/20 bg-white/70 text-slate-600 hover:border-pop-blue/50'
                  }`}
                >
                  <span className="text-lg">{g.emoji}</span>
                  <span>{g.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <button
          disabled={!ageKey}
          onClick={() => onSubmit({ ageKey, genderKey })}
          className="btn-pop w-full disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
        >
          次へすすむ 👉
        </button>
        {!ageKey && (
          <p className="mt-3 text-center text-xs font-bold text-pop-pink">
            年代を選んでね！
          </p>
        )}
      </div>
    </div>
  )
}
