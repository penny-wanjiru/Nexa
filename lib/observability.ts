import { AsyncLocalStorage } from 'node:async_hooks'
import Langfuse from 'langfuse'
import type { LangfuseSpanClient } from 'langfuse'

/**
 * Langfuse client — no-ops automatically when env vars are absent,
 * so local dev without keys works without code changes.
 */
const enabled = !!(process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY)
console.info('[langfuse] enabled:', enabled, '| baseUrl:', process.env.LANGFUSE_BASE_URL ?? '(default)')

export const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY ?? '',
  secretKey: process.env.LANGFUSE_SECRET_KEY ?? '',
  baseUrl: process.env.LANGFUSE_BASE_URL,
  enabled,
})

/**
 * Holds the currently active Langfuse span for the running agent.
 * The coordinator sets this before calling each agent; callModel reads it
 * to attach LLM generations — no context threading through function signatures.
 */
export const activeSpan = new AsyncLocalStorage<LangfuseSpanClient>()
