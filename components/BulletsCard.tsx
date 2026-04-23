'use client'

import { useState } from 'react'

interface BulletsCardProps {
  bullets: string[]
  loading: boolean
}

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
)

export function BulletsCard({ bullets, loading }: BulletsCardProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [allCopied, setAllCopied] = useState(false)

  function copyBullet(text: string, idx: number) {
    navigator.clipboard?.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 900)
  }

  function copyAll() {
    navigator.clipboard?.writeText(bullets.join('\n\n'))
    setAllCopied(true)
    setTimeout(() => setAllCopied(false), 1200)
  }

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">
          <span className="tick">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/>
              <circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>
            </svg>
          </span>
          Tailored CV bullets
        </div>
        {!loading && bullets.length > 0 && (
          <div className="card-actions">
            <button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 8px' }} onClick={copyAll}>
              {allCopied ? 'Copied!' : 'Copy all'}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[88, 76, 92, 68, 84].map((w, i) => (
            <div key={i} className="skel-line" style={{ width: `${w}%` }} />
          ))}
        </div>
      ) : (
        <div className="bullets">
          {bullets.map((text, i) => (
            <div
              key={i}
              className={`bullet${copiedIdx === i ? ' copied' : ''}`}
              onClick={() => copyBullet(text, i)}
            >
              <div className="bullet-num">0{i + 1}</div>
              <div className="bullet-text">{text}</div>
              <button className="icon-btn bullet-copy" aria-label="Copy">
                {copiedIdx === i ? <CheckIcon /> : <CopyIcon />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
