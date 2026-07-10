import { useMemo, useState } from 'react'
import { diagnose, formatYen, JUDGE_META } from '../utils/diagnose'
import { dataNote } from '../data/averages'
import { ageGroups } from '../data/categories'

const badgeClass = {
  high: 'bg-judge-high/15 text-judge-high border-judge-high/30',
  mid: 'bg-judge-mid/15 text-[#c07800] border-judge-mid/30',
  low: 'bg-judge-low/15 text-judge-low border-judge-low/30',
}

const barColor = {
  high: 'bg-judge-high',
  mid: 'bg-judge-mid',
  low: 'bg-judge-low',
}

export default function ResultScreen({ ageKey, answers, onRestart }) {
  const result = useMemo(() => diagnose(ageKey, answers), [ageKey, answers])
  const [copied, setCopied] = useState(false)
  const ageLabel = ageGroups.find((a) => a.key === ageKey)?.label || '同世代'

  const shareText = buildShareText(result, ageLabel)

  const handleShare = () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText,
    )}&url=${encodeURIComponent(url)}&hashtags=お金づかい診断`
    window.open(intent, '_blank', 'noopener,noreferrer')
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${window.location.href}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      {/* ヘッダー */}
      <div className="mb-6 text-center animate-pop-in">
        <div className="mb-2 text-6xl animate-float">🎉</div>
        <p className="inline-block rounded-full bg-white/70 px-4 py-1 text-sm font-bold text-pop-purple shadow-card">
          {ageLabel}の平均とくらべた結果
        </p>
        <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
          <span className="bg-gradient-to-r from-pop-pink via-pop-purple to-pop-blue bg-clip-text text-transparent">
            {result.typeName}
          </span>
        </h1>
      </div>

      {/* 一言コメント */}
      <div className="card mb-6 border-4 border-white p-5 animate-pop-in">
        <div className="flex items-start gap-3">
          <span className="text-3xl">💬</span>
          <p className="text-base font-bold leading-relaxed text-slate-700">
            {result.comment}
          </p>
        </div>
      </div>

      {/* 合計比較 */}
      <TotalCard result={result} />

      {/* 項目別の比較一覧 */}
      <div className="mb-6 space-y-3">
        {result.items.map((item, i) => (
          <ItemCard key={item.key} item={item} delay={i * 40} />
        ))}
      </div>

      {/* アクション */}
      <div className="sticky bottom-4 z-10 flex flex-col gap-3">
        <button onClick={handleShare} className="btn-pop w-full">
          𝕏 結果をシェアする
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleCopy} className="btn-ghost">
            {copied ? '✅ コピーしたよ' : '📋 テキストをコピー'}
          </button>
          <button onClick={onRestart} className="btn-ghost">
            🔄 もう一度診断する
          </button>
        </div>
      </div>

      {/* 注記 */}
      <p className="mt-8 text-center text-[11px] leading-relaxed text-slate-400">
        ※ {dataNote}
        <br />
        あくまで娯楽としてお楽しみください。
      </p>
    </div>
  )
}

function TotalCard({ result }) {
  const meta = JUDGE_META[result.totalLevel]
  const sign = result.totalDiff >= 0 ? '+' : '−'
  return (
    <div className="card mb-6 overflow-hidden p-5 animate-pop-in">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-extrabold">💰 支出合計</h2>
        <span className={`rounded-full border px-3 py-1 text-sm font-bold ${badgeClass[result.totalLevel]}`}>
          {meta.emoji} {meta.label}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-2xl bg-pop-purple/10 py-3">
          <p className="text-xs font-bold text-slate-500">あなた</p>
          <p className="text-2xl font-extrabold text-pop-purple">
            ¥{formatYen(result.total)}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-100 py-3">
          <p className="text-xs font-bold text-slate-500">同世代平均</p>
          <p className="text-2xl font-extrabold text-slate-600">
            ¥{formatYen(result.avgTotal)}
          </p>
        </div>
      </div>
      <p className="mt-3 text-center text-sm font-bold text-slate-500">
        平均との差： {sign}¥{formatYen(Math.abs(result.totalDiff))}
      </p>
    </div>
  )
}

function ItemCard({ item, delay }) {
  const meta = JUDGE_META[item.level]
  const sign = item.diff >= 0 ? '+' : '−'
  // バー表示： あなた・平均を最大値基準でスケール
  const scaleMax = Math.max(item.value, item.avg, 1)
  const youW = (item.value / scaleMax) * 100
  const avgW = (item.avg / scaleMax) * 100

  return (
    <div
      className="card p-4 animate-pop-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{item.emoji}</span>
          <span className="font-bold">{item.label}</span>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${badgeClass[item.level]}`}>
          {meta.emoji} {meta.label}
        </span>
      </div>

      {/* あなた */}
      <div className="mb-1.5">
        <div className="mb-1 flex items-center justify-between text-xs font-bold">
          <span className="text-slate-500">あなた</span>
          <span className="text-slate-800">¥{formatYen(item.value)}</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor[item.level]}`}
            style={{ width: `${youW}%` }}
          />
        </div>
      </div>

      {/* 平均 */}
      <div>
        <div className="mb-1 flex items-center justify-between text-xs font-bold">
          <span className="text-slate-400">平均</span>
          <span className="text-slate-500">¥{formatYen(item.avg)}</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-300 transition-all duration-700"
            style={{ width: `${avgW}%` }}
          />
        </div>
      </div>

      <p className="mt-2 text-right text-xs font-bold text-slate-500">
        差分： <span className={item.diff >= 0 ? 'text-judge-high' : 'text-judge-low'}>
          {sign}¥{formatYen(Math.abs(item.diff))}
        </span>
      </p>
    </div>
  )
}

function buildShareText(result, ageLabel) {
  const t = result.topItem
  let head = `【お金づかい診断】私は「${result.typeName}」でした！`
  if (t) {
    if (t.level === 'high') {
      head += `\n${t.emoji}${t.label}が${ageLabel}の平均より多め！`
    } else if (t.level === 'low') {
      head += `\n${t.emoji}${t.label}は${ageLabel}の平均よりひかえめ！`
    }
  }
  head += `\n支出合計 ¥${formatYen(result.total)}（平均 ¥${formatYen(result.avgTotal)}）`
  head += `\nあなたも診断してみて👇`
  return head
}
