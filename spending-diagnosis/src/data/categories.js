// 支出項目データ
// ここを編集すれば診断で聞く項目を追加・変更できます。
// key は averages.js のキーと必ず一致させること。
//
// slider: スライダー入力時の最大値・刻み幅（テンキー入力は常に利用可）

export const categories = [
  {
    key: 'rent',
    emoji: '🏠',
    label: '家賃・住居費',
    hint: '実家暮らしなら「0円」でOK！',
    slider: { max: 120000, step: 1000 },
  },
  {
    key: 'food',
    emoji: '🍚',
    label: '食費',
    hint: '自炊＋外食の合計（コンビニ・カフェは除く）',
    slider: { max: 80000, step: 1000 },
  },
  {
    key: 'conveni',
    emoji: '☕',
    label: 'コンビニ・カフェ',
    hint: 'ついつい寄っちゃうやつ',
    slider: { max: 40000, step: 500 },
  },
  {
    key: 'social',
    emoji: '🍻',
    label: '交際費・飲み会',
    hint: '友だち・恋人・飲み会など',
    slider: { max: 60000, step: 1000 },
  },
  {
    key: 'subscription',
    emoji: '📺',
    label: 'サブスク合計',
    hint: '動画・音楽・アプリの月額をぜんぶ足して',
    slider: { max: 15000, step: 100 },
  },
  {
    key: 'beauty',
    emoji: '💄',
    label: '美容・被服費',
    hint: 'コスメ・美容院・服など',
    slider: { max: 50000, step: 1000 },
  },
  {
    key: 'hobby',
    emoji: '🎤',
    label: '推し活・趣味',
    hint: 'ライブ・グッズ・ゲーム・課金など',
    slider: { max: 60000, step: 1000 },
  },
  {
    key: 'transport',
    emoji: '🚃',
    label: '交通費',
    hint: '定期・電車・タクシーなど（自己負担分）',
    slider: { max: 30000, step: 500 },
  },
  {
    key: 'tsushin',
    emoji: '📱',
    label: '通信費（スマホ代）',
    hint: 'スマホ・自宅ネット回線など',
    slider: { max: 20000, step: 100 },
  },
  {
    key: 'saving',
    emoji: '🐷',
    label: '貯金・投資額',
    hint: '毎月ためている・積み立てている金額',
    slider: { max: 100000, step: 1000 },
  },
]

// 年代の選択肢（比較対象を決めるために使用）
export const ageGroups = [
  { key: 'teens_late', label: '10代後半', emoji: '🌱' },
  { key: '20s_early', label: '20代前半', emoji: '✨' },
  { key: '20s_late', label: '20代後半', emoji: '🚀' },
]

// 性別は任意（スキップ可）。今回の平均値は性別で分けていないため参考情報として保持。
export const genders = [
  { key: 'female', label: '女性', emoji: '🎀' },
  { key: 'male', label: '男性', emoji: '⚡' },
  { key: 'other', label: 'その他', emoji: '🌈' },
  { key: 'skip', label: '答えない', emoji: '🙈' },
]
