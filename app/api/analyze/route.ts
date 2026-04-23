import { auth } from '@clerk/nextjs/server'
import { runPipeline } from '@/lib/pipeline'

export async function POST(req: Request) {
  const start = Date.now()

  const { userId } = await auth()
  if (!userId) {
    console.warn('[analyze] Unauthorized request')
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { cv, jobDescription } = body

  if (!cv || !jobDescription) {
    console.warn('[analyze] Missing required fields', { userId, hasCv: !!cv, hasJobDescription: !!jobDescription })
    return Response.json(
      { error: 'Both cv and jobDescription are required' },
      { status: 400 }
    )
  }

  try {
    console.info('[analyze] Pipeline started', { userId })
    const result = await runPipeline(cv, jobDescription)
    const duration = Date.now() - start
    console.info('[analyze] Pipeline completed', { userId, durationMs: duration })
    return Response.json(result)
  } catch (error) {
    const duration = Date.now() - start
    console.error('[analyze] Pipeline failed', {
      userId,
      durationMs: duration,
      error: error instanceof Error ? error.message : String(error),
    })
    return Response.json({ error: 'Pipeline failed. Please try again.' }, { status: 500 })
  }
}
