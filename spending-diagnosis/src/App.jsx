import { useState } from 'react'
import StartScreen from './components/StartScreen'
import AttributeScreen from './components/AttributeScreen'
import AmountScreen from './components/AmountScreen'
import ResultScreen from './components/ResultScreen'

// 画面遷移： start → attribute → amount → result
const STEPS = { START: 'start', ATTRIBUTE: 'attribute', AMOUNT: 'amount', RESULT: 'result' }

export default function App() {
  const [step, setStep] = useState(STEPS.START)
  const [attribute, setAttribute] = useState({ ageKey: '', genderKey: '' })
  const [answers, setAnswers] = useState({})

  const updateAnswer = (key, value) =>
    setAnswers((prev) => ({ ...prev, [key]: value }))

  const restart = () => {
    setAnswers({})
    setAttribute({ ageKey: '', genderKey: '' })
    setStep(STEPS.START)
    if (typeof window !== 'undefined') window.scrollTo(0, 0)
  }

  return (
    <main className="min-h-[100dvh]">
      {step === STEPS.START && (
        <StartScreen onStart={() => setStep(STEPS.ATTRIBUTE)} />
      )}

      {step === STEPS.ATTRIBUTE && (
        <AttributeScreen
          initial={attribute}
          onBack={() => setStep(STEPS.START)}
          onSubmit={(attr) => {
            setAttribute(attr)
            setStep(STEPS.AMOUNT)
            window.scrollTo(0, 0)
          }}
        />
      )}

      {step === STEPS.AMOUNT && (
        <AmountScreen
          answers={answers}
          onChange={updateAnswer}
          onBack={() => setStep(STEPS.ATTRIBUTE)}
          onComplete={() => {
            setStep(STEPS.RESULT)
            window.scrollTo(0, 0)
          }}
        />
      )}

      {step === STEPS.RESULT && (
        <ResultScreen
          ageKey={attribute.ageKey}
          answers={answers}
          onRestart={restart}
        />
      )}

      <footer className="pb-6 pt-2 text-center text-[11px] text-slate-400">
        お金づかい診断 · 参考値による娯楽コンテンツです
      </footer>
    </main>
  )
}
