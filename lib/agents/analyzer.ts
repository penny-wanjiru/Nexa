import { runAgent, parseAndValidate } from '../model'
import { AnalysisResultSchema, type AnalysisResult, type ExtractedJob } from '../schemas'
import { analyzerPrompt } from '../prompts'

export async function run(input: { cv: string; extracted: ExtractedJob }): Promise<AnalysisResult> {
  const raw = await runAgent(
    'analyze-fit',
    analyzerPrompt(input.cv, JSON.stringify(input.extracted, null, 2))
  )
  return parseAndValidate(raw, AnalysisResultSchema)
}
