import type { AnalysisResult } from '@/lib/schemas'

interface GapAnalysisCardProps {
  analysis: AnalysisResult | null
  loading: boolean
}

export function GapAnalysisCard({ analysis, loading }: GapAnalysisCardProps) {
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">
          <span className="tick">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3v4"/><path d="M16 3v4"/><path d="M3 11h18"/>
              <rect x="3" y="5" width="18" height="16" rx="2"/>
            </svg>
          </span>
          Gap analysis
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="skel-line" style={{ width: '30%' }} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
            {[90, 110, 80, 100, 95].map((w, i) => (
              <div key={i} className="skel-line" style={{ width: w, height: 26 }} />
            ))}
          </div>
          <div className="skel-line" style={{ width: '88%' }} />
          <div className="skel-line" style={{ width: '72%' }} />
        </div>
      ) : (
        <>
          <div className="gap-grid">
            <div className="gap-col">
              <h4>
                Matched skills
                <span className="cnt">{analysis?.matched_skills.length ?? 0}</span>
              </h4>
              <div className="chips">
                {analysis?.matched_skills.map((skill, i) => (
                  <span key={i} className="chip match">
                    <span className="dot" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="gap-col">
              <h4>
                Missing or weak
                <span className="cnt">{analysis?.missing_skills.length ?? 0}</span>
              </h4>
              <div className="chips">
                {analysis?.missing_skills.map((skill, i) => (
                  <span key={i} className="chip miss">
                    <span className="dot" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="sg-grid">
            <div className="sg-col">
              <h4>Strengths to lead with</h4>
              <ul className="sg-list strengths">
                {analysis?.strengths.map((s, i) => (
                  <li key={i}><span className="mark" /><span>{s}</span></li>
                ))}
              </ul>
            </div>
            <div className="sg-col">
              <h4>Gaps to address</h4>
              <ul className="sg-list gaps">
                {analysis?.gaps.map((g, i) => (
                  <li key={i}><span className="mark" /><span>{g}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
