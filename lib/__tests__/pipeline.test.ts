import { describe, it, expect } from 'vitest'
import { extractJson, parseAndValidate } from '../model'
import { z } from 'zod'

// ── extractJson ──────────────────────────────────────────────

describe('extractJson', () => {
  it('returns raw JSON unchanged', () => {
    const input = '{"foo":"bar"}'
    expect(extractJson(input)).toBe(input)
  })

  it('strips ```json … ``` fences', () => {
    const input = '```json\n{"foo":"bar"}\n```'
    expect(extractJson(input)).toBe('{"foo":"bar"}')
  })

  it('strips plain ``` … ``` fences', () => {
    const input = '```\n{"foo":"bar"}\n```'
    expect(extractJson(input)).toBe('{"foo":"bar"}')
  })

  it('extracts JSON from surrounding prose', () => {
    const input = 'Here is the result: {"key":"value"} Hope that helps!'
    expect(extractJson(input)).toBe('{"key":"value"}')
  })

  it('handles JSON arrays', () => {
    const input = 'Result: [1,2,3] done'
    expect(extractJson(input)).toBe('[1,2,3]')
  })

  it('returns trimmed string when no JSON delimiters found', () => {
    const input = '  just text  '
    expect(extractJson(input)).toBe('just text')
  })
})

// ── parseAndValidate ─────────────────────────────────────────

describe('parseAndValidate', () => {
  const Schema = z.object({ name: z.string(), count: z.number() })

  it('parses valid JSON and validates successfully', () => {
    const raw = '{"name":"Alice","count":3}'
    const result = parseAndValidate(raw, Schema)
    expect(result).toEqual({ name: 'Alice', count: 3 })
  })

  it('strips code fences before parsing', () => {
    const raw = '```json\n{"name":"Bob","count":7}\n```'
    const result = parseAndValidate(raw, Schema)
    expect(result).toEqual({ name: 'Bob', count: 7 })
  })

  it('throws on invalid JSON', () => {
    expect(() => parseAndValidate('not json', Schema)).toThrow('Model returned invalid structure')
  })

  it('throws when schema validation fails', () => {
    const raw = '{"name":"Alice","count":"not-a-number"}'
    expect(() => parseAndValidate(raw, Schema)).toThrow('Model returned invalid structure')
  })

  it('throws when required fields are missing', () => {
    const raw = '{"name":"Alice"}'
    expect(() => parseAndValidate(raw, Schema)).toThrow('Model returned invalid structure')
  })
})
