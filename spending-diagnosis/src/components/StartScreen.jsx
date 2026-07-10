export default function StartScreen({ onStart }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="animate-pop-in">
        <div className="mb-4 text-7xl animate-float">💸</div>
        <p className="mb-3 inline-block rounded-full bg-white/70 px-4 py-1 text-sm font-bold text-pop-purple shadow-card">
          同世代とくらべる・お金づかい診断
        </p>
        <h1 className="mb-4 text-4xl font-extrabold leading-tight sm:text-5xl">
          <span className="bg-gradient-to-r from-pop-pink via-pop-purple to-pop-blue bg-clip-text text-transparent">
            あなたのお金づかい、
          </span>
          <br />
          <span className="bg-gradient-to-r from-pop-blue via-pop-mint to-pop-purple bg-clip-text text-transparent">
            平均とくらべてどう？
          </span>
        </h1>
        <p className="mx-auto mb-10 max-w-md text-base font-medium text-slate-600 sm:text-lg">
          月々の支出を入力するだけ。
          <br />
          同世代の平均額とサクッと比較して、
          <br />
          あなたの「お金づかいタイプ」を診断しちゃおう！🎉
        </p>

        <button onClick={onStart} className="btn-pop text-xl animate-wiggle">
          🚀 診断スタート
        </button>

        <p className="mt-8 text-xs font-medium text-slate-500">
          所要時間およそ1〜2分・全10項目・登録不要
        </p>
      </div>
    </div>
  )
}
