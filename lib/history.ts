import type { PipelineResult } from '@/types'

export interface HistoryEntry {
  id: string
  date: string
  jobTitle: string
  company: string
  atsScore: number
  result: PipelineResult
}

const STORAGE_KEY = 'nexa_history'
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

export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as HistoryEntry[]
  } catch {
    return []
  }
}

export function saveApplication(result: PipelineResult): void {
  if (typeof window === 'undefined') return
  const entry: HistoryEntry = {
    id: generateId(),
    date: new Date().toISOString(),
    jobTitle: extractJobTitle(result),
    company: result.extracted.company,
    atsScore: result.evaluation.overall,
    result,
  }
  const existing = getHistory()
  localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...existing].slice(0, MAX_ENTRIES)))
}

export function deleteEntry(id: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(getHistory().filter(e => e.id !== id))
  )
}
