'use client'

import { useState } from 'react'
import type { Evaluation } from '@/types'

interface Props {
  evaluation: Evaluation | null
  loading: boolean
}

function ScoreMeter({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value)
  const color =
    pct >= 75 ? 'var(--good-ink)' :
    pct >= 50 ? 'var(--accent)' :
    'var(--warn-ink)'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{
          fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em',
          textTransform: 'uppercase', color: 'var(--ink-mute)',
        }}>
          {label}
        </span>
        <span style={{ fontSize: '14px', fontWeight: 600, color, fontVariantNumeric: 'tabular-nums' }}>
          {pct}
        </span>
      </div>
      <div className="fit-bar" style={{ marginBottom: 0 }}>
        <div
          className="fit-bar-fill"
          style={{ '--fill': `${pct}%`, background: color } as React.CSSProperties}
        />
      </div>
    </div>
  )
}

export function EvaluatorCard({ evaluation, loading }: Props) {
  const [copied, setCopied] = useState(false)

  function copySuggestions() {
    if (!evaluation) return
    navigator.clipboard.writeText(
      evaluation.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">
          <div className="tick">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M3 5l1.5 1.5L7 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          AI Quality Review
        </div>
        {!loading && evaluation && (
          <div className="card-actions">
            <button className="icon-btn" onClick={copySuggestions} title="Copy suggestions">
              {copied ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7l3 3 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="4" y="1" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M2 5v7a1 1 0 001 1h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div className="skel-line" style={{ width: '40%', height: '10px' }} />
                  <div className="skel-line" style={{ height: '6px', borderRadius: '3px' }} />
                </div>
              ))}
            </div>
            <div className="skel-line" style={{ width: '64px', height: '64px', borderRadius: '8px' }} />
          </div>
          <div style={{ paddingTop: '16px', borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="skel-line" style={{ width: '30%', height: '10px' }} />
            <div className="skel-line" style={{ width: '90%' }} />
            <div className="skel-line" style={{ width: '75%' }} />
          </div>
        </div>
      ) : evaluation ? (
        <>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr auto',
            gap: '24px', alignItems: 'start',
            paddingBottom: '22px', marginBottom: '22px',
            borderBottom: '1px solid var(--line)',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <ScoreMeter label="ATS Score"        value={evaluation.ats_score} />
              <ScoreMeter label="Keyword Coverage" value={evaluation.keyword_coverage} />
              <ScoreMeter label="Tone"             value={evaluation.tone_score} />
            </div>
            <div style={{ textAlign: 'center', minWidth: '72px' }}>
              <div style={{
                fontSize: '60px', fontWeight: 500, letterSpacing: '-0.03em',
                lineHeight: 0.9, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums',
              }}>
                {Math.round(evaluation.overall)}
              </div>
              <div style={{
                fontSize: '10px', color: 'var(--ink-mute)', letterSpacing: '0.08em',
                textTransform: 'uppercase', marginTop: '8px', fontWeight: 600,
              }}>
                Overall
              </div>
            </div>
          </div>

          {evaluation.suggestions.length > 0 && (
            <div>
              <h4 style={{
                fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: 'var(--ink-mute)', margin: '0 0 12px',
              }}>
                Suggestions
              </h4>
              <ul className="sg-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {evaluation.suggestions.map((s, i) => (
                  <li key={i}>
                    <span className="mark" style={{ background: 'var(--accent)', opacity: 0.7 }} />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
