'use client'

import { useState } from 'react'
import type { TailoredCV } from '@/types'

interface TailoredCVCardProps {
  tailoredCV: TailoredCV | null
  loading: boolean
}

function cvToText(cv: TailoredCV): string {
  const lines: string[] = []
  lines.push(cv.name.toUpperCase())
  lines.push(cv.contact)
  lines.push('')
  lines.push('PROFESSIONAL SUMMARY')
  lines.push(cv.summary)
  lines.push('')
  lines.push('EXPERIENCE')
  for (const job of cv.experience) {
    lines.push(`${job.role} — ${job.company} | ${job.dates}`)
    for (const b of job.bullets) lines.push(`• ${b}`)
    lines.push('')
  }
  lines.push('SKILLS')
  lines.push(cv.skills.join(' · '))
  if (cv.education.length > 0) {
    lines.push('')
    lines.push('EDUCATION')
    for (const e of cv.education) {
      lines.push(`${e.degree} — ${e.institution} | ${e.dates}`)
    }
  }
  return lines.join('\n')
}

function buildPrintHtml(cv: TailoredCV): string {
  const expHtml = cv.experience.map(job => `
    <div class="job">
      <div class="job-row">
        <div class="job-left">
          <span class="job-title">${job.role}</span>
          <span class="job-sep">·</span>
          <span class="job-company">${job.company}</span>
        </div>
        <span class="job-dates">${job.dates}</span>
      </div>
      <ul>${job.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
    </div>
  `).join('')

  const eduHtml = cv.education.map(e => `
    <div class="job">
      <div class="job-row">
        <div class="job-left">
          <span class="job-title">${e.degree}</span>
          <span class="job-sep">·</span>
          <span class="job-company">${e.institution}</span>
        </div>
        <span class="job-dates">${e.dates}</span>
      </div>
    </div>
  `).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>${cv.name} — CV</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.5;
    color: #1a1a1a;
    padding: 0.7in 0.85in;
    background: #fff;
  }
  .name {
    font-size: 24pt;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #0f0f0f;
    margin-bottom: 4px;
  }
  .contact {
    font-size: 9.5pt;
    color: #555;
    margin-bottom: 20px;
  }
  .divider {
    border: none;
    border-top: 1.5px solid #0f0f0f;
    margin-bottom: 18px;
  }
  .section { margin-bottom: 18px; }
  .section-title {
    font-size: 8.5pt;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #333;
    border-bottom: 0.75px solid #bbb;
    padding-bottom: 3px;
    margin-bottom: 10px;
  }
  .summary { color: #333; font-size: 10.5pt; }
  .job { margin-bottom: 12px; }
  .job-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 4px;
  }
  .job-left { display: flex; gap: 6px; align-items: baseline; flex-wrap: wrap; }
  .job-title { font-weight: 700; font-size: 10.5pt; }
  .job-sep { color: #999; }
  .job-company { font-style: italic; color: #444; font-size: 10.5pt; }
  .job-dates { font-size: 9.5pt; color: #666; white-space: nowrap; flex-shrink: 0; }
  ul { padding-left: 16px; margin-top: 3px; }
  li { font-size: 10pt; color: #333; margin-bottom: 2px; line-height: 1.45; }
  .skills { font-size: 10.5pt; color: #333; line-height: 1.8; }
  @media print {
    body { padding: 0.5in 0.75in; }
  }
</style>
</head>
<body>
  <div class="name">${cv.name}</div>
  <div class="contact">${cv.contact}</div>
  <hr class="divider"/>
  <div class="section">
    <div class="section-title">Professional Summary</div>
    <p class="summary">${cv.summary}</p>
  </div>
  <div class="section">
    <div class="section-title">Experience</div>
    ${expHtml}
  </div>
  <div class="section">
    <div class="section-title">Skills</div>
    <div class="skills">${cv.skills.join(' · ')}</div>
  </div>
  ${cv.education.length > 0 ? `
  <div class="section">
    <div class="section-title">Education</div>
    ${eduHtml}
  </div>` : ''}
</body>
</html>`
}

export function TailoredCVCard({ tailoredCV, loading }: TailoredCVCardProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    if (!tailoredCV) return
    navigator.clipboard?.writeText(cvToText(tailoredCV))
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  function handleDownloadPDF() {
    if (!tailoredCV) return
    const win = window.open('', '_blank', 'width=900,height=700')
    if (!win) return
    win.document.write(buildPrintHtml(tailoredCV))
    win.document.close()
    win.focus()
    // Small delay so fonts/styles render before print dialog opens
    setTimeout(() => {
      win.print()
      win.close()
    }, 400)
  }

  return (
    <div className="card cv-card">
      <div className="card-head">
        <div className="card-title">
          <span className="tick">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>
            </svg>
          </span>
          Tailored CV
        </div>
        {!loading && tailoredCV && (
          <div className="card-actions">
            <button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }} onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy text'}
            </button>
            <button className="btn" style={{ fontSize: 12, padding: '4px 10px', gap: 6 }} onClick={handleDownloadPDF}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download PDF
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="cv-viewport">
          <div className="cv-paper">
            <div className="skel-line" style={{ width: '42%', height: 26, marginBottom: 8 }} />
            <div className="skel-line" style={{ width: '62%', marginBottom: 28 }} />
            <div className="skel-line" style={{ width: '25%', height: 10, marginBottom: 12 }} />
            {[95, 84, 90, 74, 88].map((w, i) => (
              <div key={i} className="skel-line" style={{ width: `${w}%`, marginBottom: 8 }} />
            ))}
            <div className="skel-line" style={{ width: '25%', height: 10, marginTop: 24, marginBottom: 12 }} />
            {[80, 86, 72, 84, 62].map((w, i) => (
              <div key={i} className="skel-line" style={{ width: `${w}%`, marginBottom: 8 }} />
            ))}
          </div>
        </div>
      ) : tailoredCV ? (
        <div className="cv-viewport">
          <div className="cv-paper">

            {/* Header */}
            <div style={{ marginBottom: 22, paddingBottom: 16, borderBottom: '2px solid #1a1a1a' }}>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: '#0f0f0f', marginBottom: 5, lineHeight: 1.1 }}>
                {tailoredCV.name}
              </div>
              <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>
                {tailoredCV.contact}
              </div>
            </div>

            {/* Summary */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase' as const, color: '#444', paddingBottom: 5, marginBottom: 10, borderBottom: '1px solid #ccc' }}>
                Professional Summary
              </div>
              <p style={{ margin: 0, color: '#2a2a2a', fontSize: 13, lineHeight: 1.6 }}>{tailoredCV.summary}</p>
            </div>

            {/* Experience */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase' as const, color: '#444', paddingBottom: 5, marginBottom: 10, borderBottom: '1px solid #ccc' }}>
                Experience
              </div>
              {tailoredCV.experience.map((job, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, marginBottom: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' as const, minWidth: 0 }}>
                      <span style={{ fontWeight: 700, fontSize: 13.5, color: '#0f0f0f' }}>{job.role}</span>
                      <span style={{ color: '#bbb', fontSize: 11 }}>·</span>
                      <span style={{ fontStyle: 'italic', color: '#555', fontSize: 13 }}>{job.company}</span>
                    </div>
                    <span style={{ fontSize: 11.5, color: '#666', whiteSpace: 'nowrap', flexShrink: 0 }}>{job.dates}</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {job.bullets.map((b, j) => (
                      <li key={j} style={{ fontSize: 12.5, color: '#333', lineHeight: 1.5 }}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase' as const, color: '#444', paddingBottom: 5, marginBottom: 10, borderBottom: '1px solid #ccc' }}>
                Skills
              </div>
              <p style={{ margin: 0, color: '#2a2a2a', fontSize: 13, lineHeight: 1.8 }}>{tailoredCV.skills.join(' · ')}</p>
            </div>

            {/* Education */}
            {tailoredCV.education.length > 0 && (
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase' as const, color: '#444', paddingBottom: 5, marginBottom: 10, borderBottom: '1px solid #ccc' }}>
                  Education
                </div>
                {tailoredCV.education.map((e, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' as const }}>
                      <span style={{ fontWeight: 700, fontSize: 13.5, color: '#0f0f0f' }}>{e.degree}</span>
                      <span style={{ color: '#bbb', fontSize: 11 }}>·</span>
                      <span style={{ fontStyle: 'italic', color: '#555', fontSize: 13 }}>{e.institution}</span>
                    </div>
                    <span style={{ fontSize: 11.5, color: '#666', whiteSpace: 'nowrap', flexShrink: 0 }}>{e.dates}</span>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      ) : null}
    </div>
  )
}
