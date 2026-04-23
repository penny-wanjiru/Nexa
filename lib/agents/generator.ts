import { runAgent, parseAndValidate } from '../model'
import { GeneratedOutputSchema, type GeneratedOutput, type AnalysisResult } from '../schemas'
import { generatorPrompt } from '../prompts'

export async function run(input: { cv: string; analysis: AnalysisResult }): Promise<GeneratedOutput> {
  const raw = await runAgent(
    'generate-materials',
    generatorPrompt(input.cv, JSON.stringify(input.analysis, null, 2))
  )
  return parseAndValidate(raw, GeneratedOutputSchema)
}
