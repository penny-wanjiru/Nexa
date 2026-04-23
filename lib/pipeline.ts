import OpenAI from 'openai'
import { ExtractedJobSchema, AnalysisResultSchema, GeneratedOutputSchema } from './schemas'
import type { ExtractedJob, AnalysisResult, GeneratedOutput } from './schemas'
import { extractorPrompt, analyzerPrompt, generatorPrompt } from './prompts'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function callModel(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  })
  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('Empty response from model')
  return content
}

function parseAndValidate<T>(json: string, schema: { parse: (data: unknown) => T }): T {
  try {
    return schema.parse(JSON.parse(json))
  } catch {
    throw new Error(`Model returned invalid structure: ${json.slice(0, 200)}`)
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
