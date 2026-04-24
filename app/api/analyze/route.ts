import { runPipeline } from '@/lib/pipeline'
import { langfuse } from '@/lib/observability'

export async function POST(req: Request) {
  const start = Date.now()

  try {
    const body = await req.json()
    const { cv, jobDescription } = body

    if (!cv || !jobDescription) {
      return Response.json({ error: 'Both cv and jobDescription are required' }, { status: 400 })
    }

    console.info('[analyze] Pipeline started')
    const result = await runPipeline(cv, jobDescription)
    console.info('[analyze] Pipeline completed', { durationMs: Date.now() - start })
    await langfuse.flushAsync().catch(e => console.error('[langfuse] flush error:', e))
    return Response.json(result)
  } catch (error) {
    console.error('[analyze] Pipeline failed', {
      durationMs: Date.now() - start,
      error: error instanceof Error ? error.message : String(error),
    })
    await langfuse.flushAsync().catch(e => console.error('[langfuse] flush error:', e))
    return Response.json({ error: 'Pipeline failed. Please try again.' }, { status: 500 })
  }
}
