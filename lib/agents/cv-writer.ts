import { runAgent, parseAndValidate } from '../model'
import { TailoredCVSchema, type TailoredCV, type ExtractedJob, type AnalysisResult } from '../schemas'
import { cvPrompt } from '../prompts'

export async function run(input: {
  cv: string
  extracted: ExtractedJob
  analysis: AnalysisResult
}): Promise<TailoredCV> {
  const raw = await runAgent(
    'write-cv',
    cvPrompt(
      input.cv,
      JSON.stringify(input.extracted, null, 2),
      JSON.stringify(input.analysis, null, 2)
    )
  )
  return parseAndValidate(raw, TailoredCVSchema)
}
