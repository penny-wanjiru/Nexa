# Nexa

> AI-powered CV and cover letter optimiser. Paste your CV and a job description — Nexa runs a multi-agent pipeline to tailor your materials, close skill gaps, and score the output against the role.

**Live demo:** https://nexa-opal.vercel.app/

---

## Table of Contents

1. [Overview](#overview)
2. [Problem & Solution](#problem--solution)
3. [Architecture](#architecture)
4. [The Five Agents](#the-five-agents)
5. [Pipeline Orchestration](#pipeline-orchestration)
6. [Schemas & Type Safety](#schemas--type-safety)
7. [Resilience & Error Handling](#resilience--error-handling)
8. [Observability](#observability)
9. [Authentication](#authentication)
10. [Tech Stack](#tech-stack)
11. [Project Structure](#project-structure)
12. [Testing Strategy](#testing-strategy)
13. [Design Decisions & Trade-offs](#design-decisions--trade-offs)
14. [Local Development](#local-development)
15. [Deployment](#deployment)
16. [Future Improvements](#future-improvements)

---

## Overview

Nexa takes two inputs — a CV and a job description — and returns:

1. **Extracted requirements** from the JD (skills, responsibilities, keywords, company)
2. **Gap analysis** comparing the CV against those requirements (matched skills, missing skills, strengths, gaps)
3. **Tailored materials** — rewritten CV bullets, a cover letter, and a fit summary
4. **A full ATS-optimised CV rewrite** — keywords woven in naturally, no invented content
5. **A quality score** — an LLM-as-Judge evaluation rating ATS compatibility, keyword coverage, tone, and overall fit, plus actionable suggestions

Steps 3 and 4 run in parallel. Steps 1, 2, and 5 are sequential because they depend on each other's output.

---

## Problem & Solution

**The problem.** Tailoring a CV to every job is slow, inconsistent, and full of guesswork. Candidates either spray the same generic CV at every role (and fail ATS keyword filters), or spend hours rewriting per application. Neither scales.

**The solution.** A specialised, multi-step AI pipeline that reasons about the role, then tailors the application — with quality scoring built in so the user knows whether the output is actually any good.

**Why this design over a single-prompt approach.** A single mega-prompt asking one LLM to "do everything" is fragile, hard to validate, hard to iterate on, and leaves you blind when something goes wrong. Decomposing into five focused agents lets each step be small, validated, parallelised where possible, and individually observable.

---

## Architecture

### Multi-agent pipeline

Five specialist agents are registered as named tools and dispatched through an `AgentCoordinator` — the same tool-registration pattern used by MCP (Model Context Protocol) servers. Each agent exposes a single `run(input) → output` interface and is completely decoupled from the others.

```
                       ┌──────────────────┐
  cv + jd  ───────────▶│ extract-         │
                       │ requirements     │ ──▶ ExtractedJob
                       └──────────────────┘            │
                                                       ▼
                       ┌──────────────────┐
                       │ analyze-fit      │ ──▶ AnalysisResult
                       └──────────────────┘            │
                                                       │
                          ┌────────────────────────────┴───┐
                          ▼  (Promise.all — parallel)      ▼
                  ┌────────────────┐                ┌──────────────┐
                  │ generate-      │                │ write-cv     │
                  │ materials      │                │              │
                  └────────────────┘                └──────────────┘
                          │                                │
                          │  GeneratedOutput               │  TailoredCV
                          └────────────────┬───────────────┘
                                           ▼
                                  ┌──────────────────┐
                                  │ evaluate-quality │ ──▶ Evaluation
                                  └──────────────────┘
```

### MCP-style coordinator

Agents are registered under string keys in a registry and the coordinator dispatches by name:

```ts
const tools = {
  'extract-requirements': extractor,
  'analyze-fit':          analyzer,
  'generate-materials':   generator,
  'write-cv':             cvWriter,
  'evaluate-quality':     evaluator,
}

await coord.dispatch('analyze-fit', { cv, extracted })
```

This is the same pattern used by MCP servers — uniform tool contract, dispatch by name, swappable implementations. The pipeline never directly imports an agent's `run` function; it asks the coordinator for it. That decoupling makes any agent replaceable without touching the orchestrator.

### Three-layer reliability strategy

Every LLM interaction is hardened with three independent layers:

1. **Prompt-level** — every prompt includes the exact JSON shape expected as a one-shot example.
2. **API-level** — `response_format: { type: 'json_object' }` forces the model to emit syntactically valid JSON.
3. **Application-level** — Zod validates structure and types on the way back; failures throw with diagnostic info.

If any layer slips, the next one catches it.

---

## The Five Agents

| # | Agent | File | Input | Output Schema | Purpose |
|---|-------|------|-------|---------------|---------|
| 1 | `extract-requirements` | `lib/agents/extractor.ts` | `{ jobDescription }` | `ExtractedJob` | Pulls company, skills, responsibilities, keywords from JD |
| 2 | `analyze-fit` | `lib/agents/analyzer.ts` | `{ cv, extracted }` | `AnalysisResult` | Compares CV to requirements — matched, missing, strengths, gaps |
| 3 | `generate-materials` | `lib/agents/generator.ts` | `{ cv, analysis }` | `GeneratedOutput` | Tailored bullets, cover letter, fit summary |
| 4 | `write-cv` | `lib/agents/cv-writer.ts` | `{ cv, extracted, analysis }` | `TailoredCV` | Full ATS-optimised CV rewrite (no invented content) |
| 5 | `evaluate-quality` | `lib/agents/evaluator.ts` | `{ cv, jobDescription, output, tailoredCV }` | `Evaluation` | LLM-as-Judge scores + 2–3 improvement suggestions |

**Uniform contract.** Every agent file is shaped the same way:

```ts
export async function run(input: TInput): Promise<TOutput> {
  const raw = await runAgent('<tool-name>', promptFor(input))
  return parseAndValidate(raw, OutputSchema)
}
```

That uniformity is what makes the coordinator generic and the pipeline trivial to read.

---

## Pipeline Orchestration

There is a deliberate separation between **what** runs and **how** each step runs:

| | `lib/pipeline.ts` | `lib/coordinator.ts` |
|---|---|---|
| **Role** | Orchestrator | Dispatcher |
| **Knows** | The 5-step recipe, the data hand-offs, where to fan out | How to look up an agent by name and run it |
| **Owns** | Top-level Langfuse trace, business logic | Per-agent span, timing, dispatch log |
| **Cares about** | Order, branching, parallelism | Uniform execution semantics |

Rule of thumb: if the logic is specific to *this* 5-step flow, it lives in `pipeline.ts`. If it would apply to *any* agent step, it lives in `coordinator.ts`.

### Parallel fan-out

Steps 3 and 4 only depend on step 2's output, never on each other. They run concurrently:

```ts
const [output, tailoredCV] = await Promise.all([
  coord.dispatch('generate-materials', { cv, analysis }),
  coord.dispatch('write-cv',           { cv, extracted, analysis }),
])
```

This cuts total latency by roughly the duration of one agent — typically 3–5 seconds saved per run.

---

## Schemas & Type Safety

All schemas live in `lib/schemas.ts` as Zod definitions. Each schema is the **single source of truth** for both:

- **Runtime validation** — `Schema.parse(data)` throws if the LLM returns malformed structure.
- **TypeScript types** — `type Foo = z.infer<typeof FooSchema>` derives the type from the schema. Schema and type can never drift apart.

```ts
export const ExtractedJobSchema = z.object({
  company: z.string(),
  skills: z.array(z.string()),
  responsibilities: z.array(z.string()),
  keywords: z.array(z.string()),
})
export type ExtractedJob = z.infer<typeof ExtractedJobSchema>
```

The pipeline's `coord.dispatch<TInput, TOutput>()` is typed end-to-end: pass the wrong shape, the build fails. Refactoring schemas surfaces every dependent call-site automatically.

---

## Resilience & Error Handling

### Exponential backoff retry

Every LLM call goes through `runAgent`, which retries up to 3 times with exponentially increasing delays:

```ts
for (let attempt = 0; attempt <= retries; attempt++) {
  if (attempt > 0) {
    const delay = 1000 * 2 ** (attempt - 1)   // 1s, then 2s
    await new Promise(r => setTimeout(r, delay))
  }
  try { return await callModel(prompt) }
  catch (err) { lastErr = err }
}
throw lastErr!
```

Defends against transient network failures, rate limits, and model-side hiccups. Schema validation failures are deliberately *not* retried — if the prompt is wrong, retrying won't fix it; better to fail loudly.

### Error isolation

Errors are logged with full detail server-side (stack, prompt context, agent name) but only a generic message reaches the client:

```ts
return Response.json({ error: 'Pipeline failed. Please try again.' }, { status: 500 })
```

This avoids leaking internals (prompts, tokens, infrastructure errors) to the browser while preserving full debuggability in logs and Langfuse traces.

### Trace flushing

`langfuse.flushAsync()` is called in both success and failure paths of `/api/analyze`, so partial traces are still captured when the pipeline crashes mid-run.

---

## Observability

Every pipeline run produces a fully traced record in Langfuse. The hierarchy mirrors the architecture:

```
Trace (one pipeline run)
 ├── Span: extract-requirements
 │    └── Generation: llm (gpt-4o-mini, prompt, response, tokens)
 ├── Span: analyze-fit
 │    └── Generation: llm
 ├── Span: generate-materials
 │    └── Generation: llm
 ├── Span: write-cv
 │    └── Generation: llm
 └── Span: evaluate-quality
      └── Generation: llm
```

- **Trace** — created in `pipeline.ts`, tagged with final evaluation scores.
- **Span** — created in `coordinator.ts` per agent, records duration and input/output.
- **Generation** — created in `model.ts` per LLM call, records prompt, response, model parameters, and token usage.

### AsyncLocalStorage for ambient context

The coordinator wraps each agent run in `activeSpan.run(span, runFn)` (Node's `AsyncLocalStorage`). Several layers down, `callModel` reads `activeSpan.getStore()?.generation(...)` and automatically attaches the LLM generation to the right span — no need to thread the span through function signatures. Clean, transparent, and testable.

### Why this matters

You can compare ATS scores across runs after editing a prompt — empirical prompt iteration instead of vibes.

### Graceful degradation

If `LANGFUSE_PUBLIC_KEY` and `LANGFUSE_SECRET_KEY` aren't set, the Langfuse client no-ops. The app works without observability for local development without code changes.

---

## Authentication

Authentication is handled by **Clerk**, a managed identity provider.

- `app/layout.tsx` wraps the entire app in `<ClerkProvider>`.
- `proxy.ts` (Next.js 16's middleware file) uses `clerkMiddleware` and `createRouteMatcher(['/history(.*)'])` to gate the `/history` route. Unauthenticated visitors are redirected to sign-in automatically.
- The home page (`/`) stays public so users can try the product before signing up.
- Sign-up, sessions, password reset, and OAuth providers are handled entirely by Clerk — none of that code lives in this repo.

Auth is one of the easiest places to introduce security bugs (CSRF, session fixation, weak hashing, insecure cookies). Delegating to a battle-tested provider is a deliberate trade — engineering time goes into the agent pipeline instead.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | Full-stack TypeScript, file-based routing, server/client unified |
| Language | TypeScript (strict) | End-to-end type safety, shared types across server and browser |
| Auth | Clerk | Managed sessions, OAuth, password reset out of the box |
| LLM gateway | OpenRouter | One API key, swap models with one string change |
| Default model | `openai/gpt-4o-mini` | Cheap, fast, native JSON mode, sufficient for structured tasks |
| Validation | Zod | Single source of truth for schemas + types |
| Observability | Langfuse | Per-trace/span/generation visibility, prompt iteration with data |
| Tests | Vitest | Native TS, fast, ESM-friendly |
| Styling | Tailwind CSS v4 | Utility-first, fast iteration |
| Deployment | Vercel | First-class Next.js support, edge-aware, simple env management |

---

## Project Structure

```
.
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout, ClerkProvider, fonts, theme
│   ├── page.tsx                      # Main analysis UI (/)
│   ├── history/
│   │   └── page.tsx                  # Application history (/history) — protected
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts              # POST endpoint — runs pipeline, flushes traces
│   ├── globals.css
│   └── icon.svg
│
├── components/                       # React UI components
│   ├── InputPhase.tsx
│   ├── ResultsPhase.tsx
│   ├── EvaluatorCard.tsx
│   ├── TailoredCVCard.tsx
│   └── ...
│
├── lib/                              # Server-side logic
│   ├── pipeline.ts                   # 5-step orchestrator
│   ├── coordinator.ts                # MCP-style tool registry + typed dispatch
│   ├── model.ts                      # callModel, runAgent, extractJson, parseAndValidate
│   ├── schemas.ts                    # Zod schemas (single source of truth)
│   ├── prompts.ts                    # All prompt templates
│   ├── observability.ts              # Langfuse client + AsyncLocalStorage
│   ├── history.ts                    # Per-user localStorage history
│   ├── agents/
│   │   ├── extractor.ts
│   │   ├── analyzer.ts
│   │   ├── generator.ts
│   │   ├── cv-writer.ts
│   │   └── evaluator.ts
│   └── __tests__/
│       ├── pipeline.test.ts
│       └── prompts.test.ts
│
├── types/                            # Shared types (where not derived from Zod)
├── public/                           # Static assets
├── proxy.ts                          # Next.js middleware (Clerk route protection)
├── next.config.ts
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

---

## Testing Strategy

22 tests across two files, run with `npm test` (Vitest).

| File | What it covers |
|---|---|
| `lib/__tests__/pipeline.test.ts` | `extractJson` edge cases (fenced JSON, prose-wrapped JSON, arrays, no delimiters); `parseAndValidate` Zod success and failure paths |
| `lib/__tests__/prompts.test.ts` | Each prompt template injects CV, JD, and analysis at the right spots |

### What's deliberately *not* unit-tested

- **Live agent runs** — would hit OpenRouter, costing money and being non-deterministic. Testing LLM output quality is its own problem and belongs in evaluation harnesses, not unit tests.
- **End-to-end pipeline** — same reason.

The principle: **test the deterministic plumbing; observe the non-deterministic behaviour with Langfuse.** Catching a regression in `extractJson` is a unit test's job. Catching a regression in CV quality is a Langfuse score comparison's job.

---

## Design Decisions & Trade-offs

### Why TypeScript instead of Python?

This app is a thin orchestration layer over an HTTP API — not heavy ML work. Next.js gives one codebase, one language, one deploy, and shared types between the server and the browser via Zod. Python would force a two-project split (FastAPI + JS frontend) with no offsetting ecosystem advantage for these particular tasks.

### Why `gpt-4o-mini`?

- **Cost** — ~100x cheaper than GPT-4-class models. Five LLM calls per run stays in the fractions-of-a-cent range.
- **Speed** — sub-2-second responses keep total pipeline latency under ~10 seconds.
- **Sufficient capability** — structured extraction and rewriting are well within mini's competence.
- **Native JSON mode** — eliminates malformed output at the source.

The architecture supports a tiered strategy: swap a bigger model into specific agents (e.g. `cv-writer` or `evaluator`) by changing one constant, while keeping mini for cheaper tasks.

### Why OpenRouter instead of OpenAI directly?

OpenRouter is a model-agnostic broker. The string `'openai/gpt-4o-mini'` could become `'anthropic/claude-haiku-4-5'` or `'meta-llama/llama-3-70b'` with a one-line change — no SDK swap, no second API key. This makes A/B testing across vendors trivial.

### Why retry HTTP failures but not Zod failures?

Network errors and rate limits are transient — retrying with backoff usually works. Schema validation failures mean the prompt or model produced structurally wrong output; retrying won't fix that. Better to fail loudly so the prompt or model gets fixed.

### Why fan out only at steps 3 & 4?

Steps 1, 2, and 5 each depend on the prior step's output. Steps 3 and 4 share input (analysis) but not output, so they're embarrassingly parallel. Adding artificial parallelism elsewhere would break the data dependencies.

### Why an LLM-as-Judge for evaluation?

Without ground-truth labels (no "correct" tailored CV exists), automated quality checks need a model in the loop. The evaluator is given the original CV, the JD, and the generated output — enough context to score holistically. Scores are imperfect but consistent enough to compare across prompt iterations.

### Why Clerk instead of NextAuth or rolling your own?

Auth is a deep, security-sensitive surface. Clerk's free tier covers this app's needs and ships with sessions, OAuth, password reset, and bot protection out of the box. The engineering time saved is reinvested in the pipeline.

---

## Local Development

```bash
npm install
npm run dev
```

Visit http://localhost:3000.

### Environment variables

```env
# LLM
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_API_KEY=sk-or-...

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Observability (optional — app works without these)
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_BASE_URL=https://us.cloud.langfuse.com
```

### Useful commands

```bash
npm run dev       # Start dev server with hot reload
npm run build     # Production build
npm test          # Run Vitest test suite
npm run lint      # ESLint
```

---

## Deployment

Deployed to Vercel at https://nexa-opal.vercel.app/.

- Push to main → Vercel builds and deploys automatically.
- Environment variables managed in the Vercel dashboard (separate sets for Preview and Production).
- API routes run as Vercel Serverless Functions — each `/api/analyze` request gets its own short-lived execution context.
- Langfuse traces flush before the function returns, ensuring no data loss on serverless cold-finish.

---

## Future Improvements

| Area | Improvement |
|---|---|
| **Quality** | Tiered model strategy — use a stronger model (e.g. `gpt-4o`, `claude-sonnet-4-6`) for `cv-writer` and `evaluator`, keep `gpt-4o-mini` for `extractor` and `analyzer` |
| **Testing** | Add agent-level integration tests with mocked LLM responses (record-and-replay fixtures); golden-file tests for prompt outputs |
| **UX** | Stream partial results to the UI as each agent completes, instead of waiting for the full pipeline |
| **Eval** | Build a regression harness: run a fixed CV/JD set after every prompt change and surface score diffs |
| **Resilience** | Add circuit breaker around OpenRouter; rate-limit requests per user via Clerk userId |
| **Persistence** | Move per-user history from localStorage to a database (Postgres / Supabase) for cross-device access |
| **Security** | Protect `/api/analyze` with `auth.protect()` so only signed-in users can trigger pipelines |
| **Features** | New agents — interview question generator, role match scoring across multiple JDs, follow-up email drafter |
| **Observability** | Cost dashboards in Langfuse — per-run and per-user spend tracking |

---