import type { PipelineResult } from '@/types'
import { ProgressBar } from './ProgressBar'
import { FitSummaryCard } from './FitSummaryCard'
import { GapAnalysisCard } from './GapAnalysisCard'
import { BulletsCard } from './BulletsCard'
import { CoverLetterCard } from './CoverLetterCard'
import { TailoredCVCard } from './TailoredCVCard'

interface ResultsPhaseProps {
  result: PipelineResult | null
  progressStep: number
  loading: boolean
  onReset: () => void
}

export function ResultsPhase({ result, progressStep, loading, onReset }: ResultsPhaseProps) {
  const isComplete = !loading && result !== null

  return (
    <section className="fade-in">
      <div className="crumbs">
        <a href="#" onClick={(e) => { e.preventDefault(); onReset() }}>Tailor</a>
        <span className="sep">/</span>
        <span style={{ color: 'var(--ink)' }}>{isComplete ? 'Results' : 'Analysing…'}</span>
      </div>

      <div className="results-head">
        <div>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif' }}>
            {isComplete ? 'Tailoring complete.' : 'Analysing your application…'}
          </h2>
          {isComplete && (
            <div className="sub">
              Results ready · based on your CV and job description
            </div>
          )}
        </div>
        <div className="results-actions">
          <button className="btn" onClick={onReset}>New analysis</button>
        </div>
      </div>

      <ProgressBar step={isComplete ? 3 : progressStep} />

      <div className="cards">
        <FitSummaryCard
          analysis={result?.analysis ?? null}
          output={result?.output ?? null}
          loading={loading}
        />
        <GapAnalysisCard
          analysis={result?.analysis ?? null}
          loading={loading}
        />
        <BulletsCard
          bullets={result?.output.cv_bullet_points ?? []}
          loading={loading}
        />
        <CoverLetterCard
          coverLetter={result?.output.cover_letter ?? ''}
          loading={loading}
        />
        <TailoredCVCard
          tailoredCV={result?.tailoredCV ?? null}
          loading={loading}
        />
      </div>
    </section>
  )
}
