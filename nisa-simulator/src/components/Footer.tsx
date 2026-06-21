const DISCLAIMERS = [
  '本シミュレーションは、将来の運用成果を保証するものではありません。',
  '手数料・税金（NISA比較部分を除く）は考慮していない簡易計算です。',
  '価格変動リスクは考慮していない、複利計算による概算です。',
  '想定リターンの目安は過去の実績にもとづくもので、将来の成果を保証しません。',
  'NISAと課税口座の比較・節税額は、税率20.315%・最終時点で含み益に一律課税という簡易的な前提で計算しており、実際の税制とは異なります。',
  '本ツールは投資の勧誘を目的としたものではありません。投資の判断はご自身の責任で行ってください。',
];

export function Footer() {
  return (
    <footer id="disclaimer" className="mt-16 border-t border-line bg-surface-soft">
      <div className="mx-auto max-w-prose px-5 py-10">
        <h2 className="font-rounded text-base font-extrabold text-ink">ご利用にあたっての注意（免責事項）</h2>
        <ul className="mt-4 space-y-2.5">
          {DISCLAIMERS.map((text) => (
            <li key={text} className="flex gap-2 text-[13px] leading-relaxed text-ink-soft">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-caution-border" aria-hidden />
              {text}
            </li>
          ))}
        </ul>
        <p className="mt-8 text-center text-xs text-ink-soft/80">
          © {new Date().getFullYear()} つみたて みらいシミュレーター
        </p>
      </div>
    </footer>
  );
}
