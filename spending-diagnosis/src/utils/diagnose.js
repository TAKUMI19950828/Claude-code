// 診断ロジック
// - 各項目： 入力額 − 平均額 の差分を計算
// - 差分の割合で「高い / 平均的 / 低い」を判定
//   高い： 平均 +20% 以上 / 低い： 平均 −20% 以下 / それ以外： 平均的
// - 合計支出も同様に判定
// - 一番乖離が大きい項目を抽出してコメントを自動生成

import { categories } from '../data/categories'
import { averages } from '../data/averages'

export const THRESHOLD = 0.2 // ±20%

export function judge(value, avg) {
  if (!avg) return value > 0 ? 'high' : 'mid'
  const ratio = (value - avg) / avg
  if (ratio >= THRESHOLD) return 'high'
  if (ratio <= -THRESHOLD) return 'low'
  return 'mid'
}

export const JUDGE_META = {
  high: { label: '高い', emoji: '🔥', color: 'high' },
  mid: { label: '平均的', emoji: '😊', color: 'mid' },
  low: { label: '低い', emoji: '🧊', color: 'low' },
}

// 貯金・投資は「多いほど良い」ので、判定の意味づけを反転させて表示に使う
const POSITIVE_KEYS = new Set(['saving'])

export function diagnose(ageKey, answers) {
  const avgMap = averages[ageKey] || {}

  const items = categories.map((cat) => {
    const value = Number(answers[cat.key] ?? 0)
    const avg = avgMap[cat.key] ?? 0
    const diff = value - avg
    const ratio = avg ? diff / avg : 0
    const level = judge(value, avg)
    return {
      ...cat,
      value,
      avg,
      diff,
      ratio,
      level,
      positive: POSITIVE_KEYS.has(cat.key),
    }
  })

  const total = items.reduce((s, i) => s + i.value, 0)
  const avgTotal = items.reduce((s, i) => s + i.avg, 0)
  const totalDiff = total - avgTotal
  const totalLevel = judge(total, avgTotal)

  // 支出項目（貯金以外）から最大乖離を抽出
  const spendItems = items.filter((i) => !i.positive)
  const topItem = [...spendItems].sort(
    (a, b) => Math.abs(b.ratio) - Math.abs(a.ratio),
  )[0]

  const savingItem = items.find((i) => i.key === 'saving')

  return {
    items,
    total,
    avgTotal,
    totalDiff,
    totalLevel,
    topItem,
    savingItem,
    comment: buildComment({ topItem, savingItem, totalLevel, total, avgTotal }),
    typeName: buildTypeName(spendItems),
  }
}

// 一番差が大きい項目にフォーカスした一言コメントを生成
function buildComment({ topItem, savingItem, totalLevel, total, avgTotal }) {
  if (!topItem) return 'バランスよく使えていて、とっても堅実タイプ！'

  const times = topItem.avg ? topItem.value / topItem.avg : 0
  const lines = []

  if (topItem.level === 'high') {
    const timesText =
      times >= 1.8 ? `平均の約${times.toFixed(1)}倍` : '平均よりかなり多め'
    lines.push(
      `「${topItem.label}」が${timesText}！${topItem.emoji} ${flavorHigh(topItem.key)}`,
    )
  } else if (topItem.level === 'low') {
    lines.push(
      `「${topItem.label}」は平均よりぐっと少なめ${topItem.emoji} ${flavorLow(topItem.key)}`,
    )
  } else {
    lines.push('全体的に平均に近い、バランス派タイプだね！😊')
  }

  // 貯金へのひとことを添える
  if (savingItem) {
    if (savingItem.level === 'high') {
      lines.push('しかも貯金・投資も平均以上。将来もばっちりだね！🐷✨')
    } else if (savingItem.level === 'low') {
      lines.push('貯金・投資はちょっと少なめ。未来の自分にも少し回してみよ？🐷')
    }
  }

  // 合計のひとこと
  if (totalLevel === 'high') {
    lines.push(`ちなみに支出合計は平均より約${formatYen(total - avgTotal)}円オーバー気味！`)
  } else if (totalLevel === 'low') {
    lines.push(`支出合計は平均より約${formatYen(avgTotal - total)}円ひかえめ。やりくり上手！`)
  }

  return lines.join(' ')
}

// 支出内訳から「〇〇タイプ」の名前を作る（一番多い割合の項目ベース）
function buildTypeName(spendItems) {
  const top = [...spendItems].sort((a, b) => b.ratio - a.ratio)[0]
  if (!top || top.level !== 'high') return 'バランス堅実タイプ'
  const map = {
    rent: 'こだわり住まいタイプ',
    food: 'しっかり食べたいタイプ',
    conveni: 'コンビニ・カフェ大好きタイプ',
    social: 'みんなでワイワイ交際費タイプ',
    subscription: 'サブスクフル活用タイプ',
    beauty: '美意識たかめタイプ',
    hobby: '推し活・趣味全力タイプ',
    transport: 'アクティブ移動タイプ',
    tsushin: '通信費こだわりタイプ',
  }
  return map[top.key] || 'こだわり消費タイプ'
}

function flavorHigh(key) {
  const map = {
    rent: '良い環境で暮らしてるんだね🏠',
    food: '食は人生！しっかり食べる派🍚',
    conveni: 'ちりつも注意だけど、小さな幸せ大事☕',
    social: '人付き合いを大切にするタイプだね🍻',
    subscription: 'エンタメ充実ライフ！使いこなしてる？📺',
    beauty: 'いつもキレイでいたい努力家さん💄',
    hobby: '推しは尊い…！全力で楽しんでるね🎤',
    transport: 'フットワーク軽めのアクティブ派🚃',
    tsushin: 'ネットは生活の一部だもんね📱',
  }
  return map[key] || 'こだわりを感じるね！'
}

function flavorLow(key) {
  const map = {
    rent: '住居費をおさえるやりくり上手🏠',
    food: '食費コントロール上手！自炊派かな🍚',
    conveni: 'ムダ使いしないしっかり者☕',
    social: 'おうち時間も楽しめるタイプかも🏠',
    subscription: '必要なものだけ厳選してるね📺',
    beauty: 'ナチュラル志向のミニマリスト💄',
    hobby: '趣味はほどほど、堅実派🎤',
    transport: '徒歩・自転車派かな？エコだね🚲',
    tsushin: '格安プランを使いこなしてる？📱',
  }
  return map[key] || 'かしこく節約できてるね！'
}

export function formatYen(n) {
  return Math.round(n).toLocaleString('ja-JP')
}
