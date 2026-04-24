import type { PipelineResult } from '@/types'

export interface HistoryEntry {
  id: string
  date: string
  jobTitle: string
  company: string
  atsScore: number
  result: PipelineResult
}

const storageKey = (userId: string) => `nexa_history_${userId}`
const MAX_ENTRIES = 50

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function extractJobTitle(result: PipelineResult): string {
  // Pull the most descriptive keyword from the extraction as the entry label
  const candidates = [...result.extracted.keywords, ...result.extracted.skills]
  const title = candidates.find(k => k.length > 3) ?? 'Application'
  return title.length > 48 ? title.slice(0, 48) + '…' : title
}

export function getHistory(userId: string): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return []
    return JSON.parse(raw) as HistoryEntry[]
  } catch {
    return []
  }
}

export function saveApplication(result: PipelineResult, userId: string): void {
  if (typeof window === 'undefined') return
  const entry: HistoryEntry = {
    id: generateId(),
    date: new Date().toISOString(),
    jobTitle: extractJobTitle(result),
    company: result.extracted.company,
    atsScore: result.evaluation.overall,
    result,
  }
  const existing = getHistory(userId)
  localStorage.setItem(storageKey(userId), JSON.stringify([entry, ...existing].slice(0, MAX_ENTRIES)))
}

export function deleteEntry(id: string, userId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(
    storageKey(userId),
    JSON.stringify(getHistory(userId).filter(e => e.id !== id))
  )
}
