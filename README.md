# Nexa

AI-powered CV and cover letter optimiser. Paste your CV and a job description — Nexa runs a multi-agent pipeline to tailor your materials, close skill gaps, and score the output against the role.

---

## What it does

1. **Extracts** structured requirements from the job description (skills, responsibilities, keywords, company)
2. **Analyses** your CV against those requirements — matched skills, gaps, strengths
3. **Generates** tailored CV bullets, a cover letter, and a fit summary (in parallel with step 4)
4. **Rewrites** your full CV, ATS-optimised with keywords woven in naturally — no invented content
5. **Evaluates** the output as an LLM-as-Judge, scoring ATS compatibility, keyword coverage, tone, and overall quality

---

## Architecture

### Multi-agent pipeline

Five specialist agents are registered as named tools and dispatched through an `AgentCoordinator` — the same tool-registration pattern used by MCP servers. Each agent exposes a single `run(input) → output` interface and is completely decoupled from the others.

```
extract-requirements → analyze-fit → generate-materials ┐
                                   → write-cv            ┘ → evaluate-quality
```

Steps 3 and 4 run in parallel via `Promise.all` since both only depend on the analysis output, reducing total latency.

### Orchestration & resilience

- **Retry with exponential backoff** — every LLM call retries up to 3 times (1s, 2s delays) before failing
- **Typed dispatch** — `AgentCoordinator.dispatch<TInput, TOutput>()` enforces type safety across all pipeline steps
- **Zod validation** — every agent output is validated against a strict schema before being passed downstream; malformed LLM responses are caught and retried
- **Error isolation** — errors log full detail server-side but surface only a safe generic message to the client

### Observability (Langfuse)

Every pipeline run is fully traced in Langfuse:

- One **trace** per run, tagged with final evaluation scores
- One **span** per agent with input, output, and latency
- One **generation** per LLM call with the full prompt, response, and token usage

This enables prompt iteration with data — compare ATS scores across runs before and after a prompt change.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript (strict mode) |
| Auth | Clerk |
| LLM | OpenRouter — `openai/gpt-4o-mini` |
| Validation | Zod |
| Observability | Langfuse |
| Tests | Vitest |
| Deployment | Vercel |

---

## Project structure

```
lib/
  pipeline.ts        # 5-step orchestrator
  coordinator.ts     # MCP-style tool registry + typed dispatch
  model.ts           # callModel, runAgent (retry/backoff), extractJson, parseAndValidate
  agents/            # One file per agent — extractor, analyzer, generator, cv-writer, evaluator
  schemas.ts         # Zod schemas (single source of truth for all types)
  prompts.ts         # All prompt templates
  history.ts         # Per-user localStorage history
  observability.ts   # Langfuse client + AsyncLocalStorage context propagation
app/
  page.tsx           # Main analysis UI
  history/page.tsx   # Application history
  api/analyze/       # POST endpoint — runs pipeline, flushes traces
components/          # InputPhase, ResultsPhase, EvaluatorCard, TailoredCVCard, ...
```

---

## Local development

```bash
npm install
npm run dev
```

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

### Tests

```bash
npm test
```

22 tests across prompt templates and core parsing utilities (`extractJson`, `parseAndValidate`).

---

## Deployed to Vercel


