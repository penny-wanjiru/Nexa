'use client'

import { useEffect } from 'react'

interface InputPhaseProps {
  cv: string
  jobDescription: string
  onCvChange: (v: string) => void
  onJobDescChange: (v: string) => void
  onAnalyse: () => void
  loading: boolean
  error: string | null
}

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

export function InputPhase({ cv, jobDescription, onCvChange, onJobDescChange, onAnalyse, loading, error }: InputPhaseProps) {
  const canSubmit = cv.trim().length > 0 && jobDescription.trim().length > 0 && !loading

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && canSubmit) {
        onAnalyse()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [canSubmit, onAnalyse])

  return (
    <section>
      <div className="hero">
        <span className="hero-eyebrow">
          <span className="dot" />
          Job application copilot
        </span>
        <h1 style={{ fontFamily: 'var(--font-playfair), serif' }}>
          Tailor your CV to any role <em>in thirty seconds.</em>
        </h1>
        <p>
          Paste your CV and a job description. Nexa extracts the requirements,
          analyses your fit, and drafts a complete ATS-optimised CV and cover letter.
        </p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="input-grid">
        <div className="field">
          <div className="field-head">
            <div className="field-label">
              <span className="num">01</span>
              Your CV
            </div>
            <div className="field-meta">{wordCount(cv)} words</div>
          </div>
          <textarea
            value={cv}
            onChange={(e) => onCvChange(e.target.value)}
            placeholder={"Paste your CV here…\n\nWe'll extract roles, achievements, and skills. Plain text works best — exported PDFs or LinkedIn exports are fine."}
            disabled={loading}
          />
          <div className="field-foot">
            <span>Plain text, PDF export, or LinkedIn</span>
            <div className="foot-tools">
              <button
                className="icon-btn"
                title="Clear"
                aria-label="Clear CV"
                onClick={() => onCvChange('')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="field">
          <div className="field-head">
            <div className="field-label">
              <span className="num">02</span>
              Job description
            </div>
            <div className="field-meta">{wordCount(jobDescription)} words</div>
          </div>
          <textarea
            value={jobDescription}
            onChange={(e) => onJobDescChange(e.target.value)}
            placeholder={"Paste the job description here…\n\nInclude responsibilities, requirements, and the about-the-company section if available — the more context, the sharper the tailoring."}
            disabled={loading}
          />
          <div className="field-foot">
            <span>Role, requirements, company context</span>
            <div className="foot-tools">
              <button
                className="icon-btn"
                title="Clear"
                aria-label="Clear job description"
                onClick={() => onJobDescChange('')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="submit-row">
        <button
          className="submit"
          onClick={onAnalyse}
          disabled={!canSubmit}
        >
          {loading ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Analysing…
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/><path d="m13 5 7 7-7 7"/>
              </svg>
              Analyse
            </>
          )}
        </button>
        <div className="submit-hint">
          <span>Press</span>
          <kbd>⌘</kbd><kbd>⏎</kbd>
          <span>to run · usually 20–30 seconds</span>
        </div>
      </div>

    </section>
  )
}
