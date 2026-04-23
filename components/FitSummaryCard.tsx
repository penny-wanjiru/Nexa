import type { AnalysisResult, GeneratedOutput } from '@/lib/schemas'

interface FitSummaryCardProps {
  analysis: AnalysisResult | null
  output: GeneratedOutput | null
  loading: boolean
}

function getVerdict(score: number) {
  if (score >= 80) return 'Excellent match'
  if (score >= 65) return 'Strong match'
  if (score >= 50) return 'Good match'
  return 'Partial match'
}

export function FitSummaryCard({ analysis, output, loading }: FitSummaryCardProps) {
  const matched = analysis?.matched_skills.length ?? 0
  const missing = analysis?.missing_skills.length ?? 0
  const total   = matched + missing
  const score   = total > 0 ? Math.round((matched / total) * 100) : 0
  const verdict = getVerdict(score)

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">
          <span className="tick">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          </span>
          Fit summary
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="skel-line" style={{ width: '60%', height: 48 }} />
          <div className="skel-line" style={{ width: '90%' }} />
          <div className="skel-line" style={{ width: '80%' }} />
          <div className="skel-line" style={{ width: '70%' }} />
        </div>
      ) : (
        <>
          <div className="fit-top">
            <div className="fit-score-num" style={{ fontFamily: 'var(--font-playfair), serif' }}>
              {score}<span className="pct">/100</span>
            </div>
            <div className="fit-score-label">
              Fit score
              <span className="of">vs. role requirements</span>
            </div>
            <span className="fit-verdict">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10"/>
              </svg>
              {verdict}
            </span>
          </div>

          <div className="fit-bar">
            <div className="fit-bar-fill" style={{ '--fill': `${score}%` } as React.CSSProperties} />
          </div>

          <p className="fit-text">{output?.fit_summary}</p>

          <div className="fit-stats">
            <div className="fit-stat">
              <span className="n" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                {matched}/{total}
              </span>
              <span className="l">Requirements met</span>
            </div>
            <div className="fit-stat">
              <span className="n" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                {analysis?.strengths.length ?? 0}
              </span>
              <span className="l">Strengths</span>
            </div>
            <div className="fit-stat">
              <span className="n" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                {analysis?.gaps.length ?? 0}
              </span>
              <span className="l">Gaps</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
