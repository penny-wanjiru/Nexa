import { activeSpan } from './observability'
import type { LangfuseTraceClient } from 'langfuse'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRunFn = (input: any) => Promise<any>

interface AgentTool {
  run: AnyRunFn
}

interface DispatchLog {
  tool: string
  durationMs: number
  status: 'ok' | 'error'
}

/**
 * AgentCoordinator dispatches work to named specialist agents — the same
 * tool-registration + dispatch pattern used by MCP servers.
 *
 * Each agent exposes a `run(input) → output` interface and is registered
 * under a string key. The coordinator logs every dispatch with timing and,
 * when a Langfuse trace is provided, creates a span per agent so token usage
 * and latency are visible in the Langfuse dashboard.
 */
export class AgentCoordinator {
  private tools: Record<string, AgentTool>
  private trace: LangfuseTraceClient | undefined
  readonly log: DispatchLog[] = []

  constructor(tools: Record<string, AgentTool>, trace?: LangfuseTraceClient) {
    this.tools = tools
    this.trace = trace
  }

  async dispatch<TInput, TOutput>(name: string, input: TInput): Promise<TOutput> {
    const tool = this.tools[name]
    if (!tool) throw new Error(`[coordinator] Unknown tool: "${name}"`)

    const span = this.trace?.span({ name, input })
    const start = Date.now()
    console.info(`[coordinator] → ${name}`)

    // Run the agent inside AsyncLocalStorage so callModel can attach
    // its LLM generation to the active span without explicit threading.
    const runFn = (): Promise<TOutput> => tool.run(input)

    try {
      const result: TOutput = span
        ? await activeSpan.run(span, runFn)
        : await runFn()
      const durationMs = Date.now() - start
      span?.end({ output: result })
      this.log.push({ tool: name, durationMs, status: 'ok' })
      console.info(`[coordinator] ✓ ${name} ${durationMs}ms`)
      return result
    } catch (err) {
      const durationMs = Date.now() - start
      span?.end({ level: 'ERROR', statusMessage: err instanceof Error ? err.message : String(err) })
      this.log.push({ tool: name, durationMs, status: 'error' })
      console.error(`[coordinator] ✗ ${name} ${durationMs}ms`, err instanceof Error ? err.message : err)
      throw err
    }
  }
}
