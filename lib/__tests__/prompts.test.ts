import { describe, it, expect } from 'vitest'
import {
  extractorPrompt,
  analyzerPrompt,
  generatorPrompt,
  cvPrompt,
  evaluatorPrompt,
} from '../prompts'

// ── extractorPrompt ──────────────────────────────────────────

describe('extractorPrompt', () => {
  it('includes the job description in the output', () => {
    const jd = 'Looking for a TypeScript engineer'
    const prompt = extractorPrompt(jd)
    expect(prompt).toContain(jd)
  })

  it('specifies the required JSON structure', () => {
    const prompt = extractorPrompt('any jd')
    expect(prompt).toContain('"company"')
    expect(prompt).toContain('"skills"')
    expect(prompt).toContain('"responsibilities"')
    expect(prompt).toContain('"keywords"')
  })

  it('instructs the model to return only JSON', () => {
    const prompt = extractorPrompt('any jd')
    expect(prompt.toLowerCase()).toContain('valid json')
  })
})

// ── analyzerPrompt ───────────────────────────────────────────

describe('analyzerPrompt', () => {
  it('includes both CV and extracted data', () => {
    const cv = 'My name is Alice'
    const extracted = '{"skills":["TypeScript"]}'
    const prompt = analyzerPrompt(cv, extracted)
    expect(prompt).toContain(cv)
    expect(prompt).toContain(extracted)
  })

  it('specifies the required output fields', () => {
    const prompt = analyzerPrompt('cv', 'data')
    expect(prompt).toContain('"matched_skills"')
    expect(prompt).toContain('"missing_skills"')
    expect(prompt).toContain('"strengths"')
    expect(prompt).toContain('"gaps"')
  })
})

// ── generatorPrompt ──────────────────────────────────────────

describe('generatorPrompt', () => {
  it('includes CV and analysis in the output', () => {
    const cv = 'Alice CV'
    const analysis = '{"matched_skills":["Python"]}'
    const prompt = generatorPrompt(cv, analysis)
    expect(prompt).toContain(cv)
    expect(prompt).toContain(analysis)
  })

  it('requests the three material types', () => {
    const prompt = generatorPrompt('cv', 'analysis')
    expect(prompt).toContain('cv_bullet_points')
    expect(prompt).toContain('cover_letter')
    expect(prompt).toContain('fit_summary')
  })
})

// ── cvPrompt ─────────────────────────────────────────────────

describe('cvPrompt', () => {
  it('includes all three inputs', () => {
    const cv = 'My CV'
    const reqs = '{"skills":[]}'
    const analysis = '{"gaps":[]}'
    const prompt = cvPrompt(cv, reqs, analysis)
    expect(prompt).toContain(cv)
    expect(prompt).toContain(reqs)
    expect(prompt).toContain(analysis)
  })

  it('prohibits invention of facts', () => {
    const prompt = cvPrompt('cv', 'reqs', 'analysis')
    expect(prompt.toLowerCase()).toContain('do not invent')
  })
})

// ── evaluatorPrompt ──────────────────────────────────────────

describe('evaluatorPrompt', () => {
  it('includes all four inputs', () => {
    const cv = 'My CV'
    const jd = 'Senior Engineer role'
    const output = '{"cv_bullet_points":[]}'
    const tailored = '{"name":"Alice"}'
    const prompt = evaluatorPrompt(cv, jd, output, tailored)
    expect(prompt).toContain(cv)
    expect(prompt).toContain(jd)
    expect(prompt).toContain(output)
    expect(prompt).toContain(tailored)
  })

  it('requests the four score fields', () => {
    const prompt = evaluatorPrompt('cv', 'jd', 'out', 'tcv')
    expect(prompt).toContain('"ats_score"')
    expect(prompt).toContain('"keyword_coverage"')
    expect(prompt).toContain('"tone_score"')
    expect(prompt).toContain('"overall"')
    expect(prompt).toContain('"suggestions"')
  })
})
