'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Topbar } from '@/components/Topbar'
import { getHistory, deleteEntry } from '@/lib/history'
import type { HistoryEntry } from '@/lib/history'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function scoreColor(n: number) {
  if (n >= 75) return 'var(--good-ink)'
  if (n >= 50) return 'var(--accent)'
  return 'var(--warn-ink)'
}

export default function HistoryPage() {
  const { user } = useUser()
  const [entries, setEntries] = useState<HistoryEntry[]>([])

  useEffect(() => {
    if (user?.id) setEntries(getHistory(user.id))
  }, [user?.id])

  function handleDelete(id: string) {
    if (!user?.id) return
    deleteEntry(id, user.id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  return (
    <>
      <Topbar />
      <main className="shell">
        <h2 style={{
          fontFamily: 'var(--font-playfair), serif',
          fontSize: '34px', fontWeight: 500, letterSpacing: '-0.02em',
          margin: '0 0 8px',
        }}>
          History
        </h2>
        <p style={{ color: 'var(--ink-mute)', fontSize: '14px', margin: '0 0 32px' }}>
          {entries.length > 0
            ? `${entries.length} application${entries.length === 1 ? '' : 's'} analysed so far.`
            : 'Your tailored applications, all in one place.'}
        </p>

        {entries.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '56px 32px', color: 'var(--ink-mute)', fontSize: '14px' }}>
            No analyses yet — run your first analysis to see it here.
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  {['Date', 'Company', 'Role', 'Overall score', ''].map(h => (
                    <th key={h} style={{
                      padding: '12px 20px', textAlign: 'left',
                      fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em',
                      textTransform: 'uppercase', color: 'var(--ink-mute)',
                      background: 'var(--bg-soft)',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <tr
                    key={entry.id}
                    style={{ borderBottom: i < entries.length - 1 ? '1px solid var(--line-soft)' : 'none' }}
                  >
                    <td style={{ padding: '14px 20px', color: 'var(--ink-mute)', whiteSpace: 'nowrap' }}>
                      {formatDate(entry.date)}
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--ink)' }}>
                      {entry.company || '—'}
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--ink)' }}>
                      {entry.jobTitle}
                    </td>
                    <td style={{
                      padding: '14px 20px',
                      fontVariantNumeric: 'tabular-nums', fontWeight: 600,
                      color: scoreColor(entry.atsScore),
                    }}>
                      {Math.round(entry.atsScore)}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <button
                        className="btn btn-ghost"
                        style={{ fontSize: '12px', padding: '4px 10px' }}
                        onClick={() => handleDelete(entry.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
