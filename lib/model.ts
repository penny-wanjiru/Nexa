import { activeSpan } from './observability'

const MODEL = 'openai/gpt-4o-mini'

export async function callModel(prompt: string): Promise<string> {
  const baseUrl = process.env.OPENROUTER_BASE_URL
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!baseUrl || !apiKey) {
    throw new Error(
      `Missing env vars:${!baseUrl ? ' OPENROUTER_BASE_URL' : ''}${!apiKey ? ' OPENROUTER_API_KEY' : ''}`.trim()
    )
  }

  const generation = activeSpan.getStore()?.generation({
    name: 'llm',
    model: MODEL,
    modelParameters: { temperature: 0.3 },
    input: [{ role: 'user', content: prompt }],
  })

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://nexa.app',
        'X-Title': 'Nexa',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`OpenRouter error ${res.status}: ${err.slice(0, 200)}`)
    }

    const data = await res.json()
    const content: string | undefined = data.choices?.[0]?.message?.content
    if (!content) {
      console.error('[model] Empty response:', JSON.stringify(data).slice(0, 400))
      throw new Error('Empty response from model')
    }

    generation?.end({
      output: content,
      usage: {
        input: data.usage?.prompt_tokens,
        output: data.usage?.completion_tokens,
        total: data.usage?.total_tokens,
      },
    })
    return content
  } catch (err) {
    generation?.end({
      level: 'ERROR',
      statusMessage: err instanceof Error ? err.message : String(err),
    })
    throw err
  }
}

export async function runAgent(name: string, prompt: string, retries = 2): Promise<string> {
  let lastErr: Error | null = null
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      const delay = 1000 * 2 ** (attempt - 1)
      console.warn(`[${name}] Retry ${attempt}/${retries} after ${delay}ms`)
      await new Promise(r => setTimeout(r, delay))
    }
    try {
      return await callModel(prompt)
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err))
      console.error(`[${name}] Attempt ${attempt + 1} failed:`, lastErr.message)
    }
  }
  throw lastErr!
}

export function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) return fenced[1].trim()
  const start = raw.search(/[{[]/)
  const end = Math.max(raw.lastIndexOf('}'), raw.lastIndexOf(']'))
  if (start !== -1 && end !== -1) return raw.slice(start, end + 1)
  return raw.trim()
}

export function parseAndValidate<T>(raw: string, schema: { parse: (data: unknown) => T }): T {
  const json = extractJson(raw)
  try {
    return schema.parse(JSON.parse(json))
  } catch (err) {
    console.error('[model] Parse error. Raw response:', raw.slice(0, 400))
    throw new Error(`Model returned invalid structure: ${String(err)}`)
  }
}
