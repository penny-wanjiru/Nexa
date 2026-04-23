import { runAgent, parseAndValidate } from '../model'
import { EvaluationSchema, type Evaluation, type GeneratedOutput, type TailoredCV } from '../schemas'
import { evaluatorPrompt } from '../prompts'

export async function run(input: {
  cv: string
  jobDescription: string
  output: GeneratedOutput
  tailoredCV: TailoredCV
}): Promise<Evaluation> {
  const raw = await runAgent(
    'evaluate-quality',
    evaluatorPrompt(
      input.cv,
      input.jobDescription,
      JSON.stringify(input.output, null, 2),
      JSON.stringify(input.tailoredCV, null, 2)
    )
  )
  return parseAndValidate(raw, EvaluationSchema)
}
