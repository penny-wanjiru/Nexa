import { ExtractedJobSchema, AnalysisResultSchema, GeneratedOutputSchema } from './schemas'
import type { ExtractedJob, AnalysisResult, GeneratedOutput } from './schemas'
import { extractorPrompt, analyzerPrompt, generatorPrompt } from './prompts'

async function callModel(prompt: string): Promise<string> {
  const baseUrl = process.env.OPENROUTER_BASE_URL
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!baseUrl || !apiKey) {
    throw new Error(`Missing env vars: ${!baseUrl ? 'OPENROUTER_BASE_URL' : ''} ${!apiKey ? 'OPENROUTER_API_KEY' : ''}`.trim())
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://nexa.app',
      'X-Title': 'Nexa',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter error ${res.status}: ${err.slice(0, 200)}`)
  }

  const data = await res.json()
  const content: string | undefined = data.choices?.[0]?.message?.content
  if (!content) {
    console.error('[pipeline] Empty model response:', JSON.stringify(data).slice(0, 400))
    throw new Error('Empty response from model')
  }
  return content
}

function extractJson(raw: string): string {
  // Strip markdown code fences if present: ```json ... ``` or ``` ... ```
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) return fenced[1].trim()
  // Find the first { or [ and last } or ] as a fallback
  const start = raw.search(/[{[]/)
  const end   = Math.max(raw.lastIndexOf('}'), raw.lastIndexOf(']'))
  if (start !== -1 && end !== -1) return raw.slice(start, end + 1)
  return raw.trim()
}

function parseAndValidate<T>(raw: string, schema: { parse: (data: unknown) => T }): T {
  const json = extractJson(raw)
  try {
    return schema.parse(JSON.parse(json))
  } catch (err) {
    console.error('[pipeline] Parse error. Raw response:', raw.slice(0, 400))
    throw new Error(`Model returned invalid structure: ${String(err)}`)
  }
}

export async function runPipeline(cv: string, jobDescription: string) {
  // Step 1: Extract job requirements
  const extractedRaw = await callModel(extractorPrompt(jobDescription))
  const extracted: ExtractedJob = parseAndValidate(extractedRaw, ExtractedJobSchema)

  // Step 2: Analyse CV against job
  const analysisRaw = await callModel(analyzerPrompt(cv, JSON.stringify(extracted, null, 2)))
  const analysis: AnalysisResult = parseAndValidate(analysisRaw, AnalysisResultSchema)

  // Step 3: Generate tailored outputs
  const outputRaw = await callModel(generatorPrompt(cv, JSON.stringify(analysis, null, 2)))
  const output: GeneratedOutput = parseAndValidate(outputRaw, GeneratedOutputSchema)

  return { extracted, analysis, output }
}
