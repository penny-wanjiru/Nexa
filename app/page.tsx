'use client'

import { useState, useCallback } from 'react'
import { Topbar } from '@/components/Topbar'
import { InputPhase } from '@/components/InputPhase'
import { ResultsPhase } from '@/components/ResultsPhase'
import type { PipelineResult } from '@/types'

type Phase = 'input' | 'loading' | 'results'

export default function Home() {
  const [phase, setPhase]               = useState<Phase>('input')
  const [progressStep, setProgressStep] = useState(0)
  const [cv, setCv]                     = useState('')
  const [jobDescription, setJobDesc]    = useState('')
  const [result, setResult]             = useState<PipelineResult | null>(null)
  const [error, setError]               = useState<string | null>(null)

  const handleAnalyse = useCallback(async () => {
    if (!cv.trim() || !jobDescription.trim()) return

    setProgressStep(0)
    setPhase('loading')
    setError(null)
    setResult(null)

    // Advance progress steps while waiting for the API
    const t1 = setTimeout(() => setProgressStep(1), 4000)
    const t2 = setTimeout(() => setProgressStep(2), 10000)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv, jobDescription }),
      })

      clearTimeout(t1)
      clearTimeout(t2)

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Something went wrong. Please try again.')
      }

      const data: PipelineResult = await res.json()
      setResult(data)
      setProgressStep(3)
      setPhase('results')
    } catch (err) {
      clearTimeout(t1)
      clearTimeout(t2)
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setPhase('input')
    }
  }, [cv, jobDescription])

  return (
    <>
      <Topbar />
      <main className="shell">
        {phase === 'input' && (
          <InputPhase
            cv={cv}
            jobDescription={jobDescription}
            onCvChange={setCv}
            onJobDescChange={setJobDesc}
            onAnalyse={handleAnalyse}
            loading={false}
            error={error}
          />
        )}

        {(phase === 'loading' || phase === 'results') && (
          <ResultsPhase
            result={result}
            progressStep={progressStep}
            loading={phase === 'loading'}
            onReset={() => { setPhase('input'); setResult(null); setError(null) }}
          />
        )}
      </main>
    </>
  )
}
