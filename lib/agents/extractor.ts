import { runAgent, parseAndValidate } from '../model'
import { ExtractedJobSchema, type ExtractedJob } from '../schemas'
import { extractorPrompt } from '../prompts'

export async function run(input: { jobDescription: string }): Promise<ExtractedJob> {
  const raw = await runAgent('extract-requirements', extractorPrompt(input.jobDescription))
  return parseAndValidate(raw, ExtractedJobSchema)
}
