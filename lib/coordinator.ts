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
 * under a string key. The coordinator logs every dispatch with timing.
 */
export class AgentCoordinator {
  private tools: Record<string, AgentTool>
  readonly log: DispatchLog[] = []

  constructor(tools: Record<string, AgentTool>) {
    this.tools = tools
  }

  async dispatch<TInput, TOutput>(name: string, input: TInput): Promise<TOutput> {
    const tool = this.tools[name]
    if (!tool) throw new Error(`[coordinator] Unknown tool: "${name}"`)

    const start = Date.now()
    console.info(`[coordinator] → ${name}`)
    try {
      const result: TOutput = await tool.run(input)
      const durationMs = Date.now() - start
      this.log.push({ tool: name, durationMs, status: 'ok' })
      console.info(`[coordinator] ✓ ${name} ${durationMs}ms`)
      return result
    } catch (err) {
      const durationMs = Date.now() - start
      this.log.push({ tool: name, durationMs, status: 'error' })
      console.error(`[coordinator] ✗ ${name} ${durationMs}ms`, err instanceof Error ? err.message : err)
      throw err
    }
  }
}
