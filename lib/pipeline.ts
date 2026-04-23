import { AgentCoordinator } from './coordinator'
import * as extractor from './agents/extractor'
import * as analyzer from './agents/analyzer'
import * as generator from './agents/generator'
import * as cvWriter from './agents/cv-writer'
import * as evaluator from './agents/evaluator'
import type { ExtractedJob, AnalysisResult, GeneratedOutput, TailoredCV, Evaluation } from './schemas'

/**
 * Each agent is registered as a named tool — the MCP pattern:
 * the coordinator dispatches by name, agents expose run(input) → output.
 */
const tools = {
  'extract-requirements': extractor,
  'analyze-fit':          analyzer,
  'generate-materials':   generator,
  'write-cv':             cvWriter,
  'evaluate-quality':     evaluator,
}

export async function runPipeline(cv: string, jobDescription: string) {
  const coord = new AgentCoordinator(tools)

  // Step 1 — extract job requirements
  const extracted = await coord.dispatch<{ jobDescription: string }, ExtractedJob>(
    'extract-requirements', { jobDescription }
  )

  // Step 2 — analyse CV against requirements
  const analysis = await coord.dispatch<{ cv: string; extracted: ExtractedJob }, AnalysisResult>(
    'analyze-fit', { cv, extracted }
  )

  // Steps 3+4 — generate materials and rewrite CV in parallel (both only need analysis)
  const [output, tailoredCV] = await Promise.all([
    coord.dispatch<{ cv: string; analysis: AnalysisResult }, GeneratedOutput>(
      'generate-materials', { cv, analysis }
    ),
    coord.dispatch<{ cv: string; extracted: ExtractedJob; analysis: AnalysisResult }, TailoredCV>(
      'write-cv', { cv, extracted, analysis }
    ),
  ])

  // Step 5 — LLM-as-Judge evaluates the generated materials
  const evaluation = await coord.dispatch<
    { cv: string; jobDescription: string; output: GeneratedOutput; tailoredCV: TailoredCV },
    Evaluation
  >('evaluate-quality', { cv, jobDescription, output, tailoredCV })

  console.info('[pipeline] dispatch log:', coord.log.map(e => `${e.tool} ${e.durationMs}ms`).join(', '))

  return { extracted, analysis, output, tailoredCV, evaluation }
}
