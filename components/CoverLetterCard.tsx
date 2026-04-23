'use client'

import { useState } from 'react'

interface CoverLetterCardProps {
  coverLetter: string
  loading: boolean
}

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

export function CoverLetterCard({ coverLetter, loading }: CoverLetterCardProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard?.writeText(coverLetter)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  const wc = wordCount(coverLetter)
  const readTime = Math.ceil(wc / 238) // avg reading speed

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">
          <span className="tick">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2"/>
              <path d="m3 7 9 6 9-6"/>
            </svg>
          </span>
          Cover letter
        </div>
        {!loading && coverLetter && (
          <div className="card-actions">
            <button className="btn" style={{ fontSize: 12, padding: '5px 10px' }} onClick={handleCopy}>
              {copied ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="skel-line" style={{ width: '40%' }} />
          {[95, 92, 88, 70, 82, 90].map((w, i) => (
            <div key={i} className="skel-line" style={{ width: `${w}%` }} />
          ))}
        </div>
      ) : (
        <>
          <div className="cover" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
            {coverLetter}
          </div>
          <div className="cover-meta">
            <span>{wc} words · {readTime}:{String(Math.round((wc / 238 - Math.floor(wc / 238)) * 60)).padStart(2, '0')} read</span>
            <span>Generated just now</span>
          </div>
        </>
      )}
    </div>
  )
}
