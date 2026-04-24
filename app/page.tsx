'use client'

import { useState, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { Topbar } from '@/components/Topbar'
import { InputPhase } from '@/components/InputPhase'
import { ResultsPhase } from '@/components/ResultsPhase'
import type { PipelineResult } from '@/types'
import { saveApplication } from '@/lib/history'

type Phase = 'input' | 'loading' | 'results'

export default function Home() {
  const { user } = useUser()
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
        let message = 'Something went wrong. Please try again.'
        try {
          const data = await res.json()
          if (data.error) message = data.error
        } catch { /* non-JSON error body — keep default message */ }
        throw new Error(message)
      }

      const data: PipelineResult = await res.json()
      setResult(data)
      if (user?.id) saveApplication(data, user.id)
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
