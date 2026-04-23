<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
# Evaluation Criteria

## Technical Depth (20%)

### Problem selection & scope
| Score | Description |
|------|------------|
| 0 | Problem is unclear, trivial, or ill-defined. No evidence of scoping decisions. |
| 1 | Problem is stated but vague, overly broad or narrow. Scope is poorly defined or not well justified. |
| 2 | Problem is reasonably clear with some scoping effort, but gaps remain in rationale. |
| 3 | Problem is well-defined with a clear scope. AI relevance is articulated. |
| 4 | Well defined, meaningful problem with compelling scope, thoughtful constraints and explicit trade-off analysis. Strong AI fit. |
| 5 | Highly relevant, impactful problem with sharp, realistic, and well-justified scope. Demonstrates deep domain understanding and precise AI framing. |

### Architecture & design choices
| Score | Description |
|------|------------|
| 0 | No clear architecture. Ad-hoc implementation. Components are arbitrary or missing. |
| 1 | Minimal structure but design decisions are unexplained or inconsistent. |
| 2 | Basic, functional architecture but with gaps or inconsistencies. Lacks modularity or clear justification. |
| 3 | Solid, coherent design with reasonable component separation and justification. |
| 4 | Architecture is modular and well-structured, with deliberate trade-offs documented and defensible. |
| 5 | Architecture is elegant, scalable, and purpose-built. Design decisions reflect deep engineering judgment. |

### Prompt & model interaction quality
| Score | Description |
|------|------------|
| 0 | Prompts are absent or completely ineffective. Model output is poor/unusable. |
| 1 | Naive prompting. Prompts are generic with no iteration. Yields inconsistent results. |
| 2 | Basic prompt engineering with limited refinement or control. |
| 3 | Prompts are clear, context-rich, and show awareness of model behavior. |
| 4 | Advanced prompting (few-shot, CoT, or structured output) with reliable outputs. |
| 5 | Prompt design is sophisticated, iterative, and demonstrably optimized. Interaction quality is production-grade. |

### Orchestration & control flow
| Score | Description |
|------|------------|
| 0 | No orchestration. Single unstructured call with no flow logic. |
| 1 | Minimal flow logic with brittle execution. Steps are hardcoded or sequential without branching. |
| 2 | Basic orchestration exists but lacks robustness (error handling, dynamic routing, etc.). |
| 3 | Functional orchestration with logical flow, multi-step reasoning or agent-style coordination. |
| 4 | Well-designed orchestration with branching, error handling, retries, and context management. |
| 5 | Orchestration is robust and dynamic (complex multi-agent or pipeline flows with graceful fallbacks). |

---

## Engineering Practices (20%)

### Code quality
| Score | Description |
|------|------------|
| 0 | Code is unreadable, monolithic, or entirely undocumented. OR obvious LLM-generated code with no cleanup. |
| 1 | Code is functional but disorganized with little separation of concerns. |
| 2 | Some structure is present but inconsistent practices (naming, modularity, documentation, etc.). |
| 3 | Code is well-organized with clear naming conventions and reasonable separation of concerns. |
| 4 | Code demonstrates solid engineering: modular, clean, documented, and consistent style. |
| 5 | Code is production-grade: highly modular, well documented, maintainable, and easy to extend. |

### Logging & error handling
| Score | Description |
|------|------------|
| 0 | No logging or error handling. Failures crash silently. |
| 1 | Minimal logging (e.g., print statements only). Errors are uncaught. |
| 2 | Basic logging and partial error handling (e.g., try/except present). |
| 3 | Errors are caught with informative messages. Key events are logged. |
| 4 | Structured logging with levels (info/warn/error). Errors surface meaningful context. |
| 5 | Comprehensive, structured logging throughout. Errors are gracefully handled with full traceability and actionable messages. |

### Unit / integration tests
| Score | Description |
|------|------------|
| 0 | No tests exist. |
| 1 | One or two trivial tests with no meaningful coverage. |
| 2 | Tests exist for some components but low coverage. |
| 3 | Core logic is tested. Unit tests are well-named with good coverage. |
| 4 | Strong unit and integration test coverage. Tests are automated and repeatable. |
| 5 | Extensive, reliable test suite with automations, CI integration, and tests for edge cases, failure modes, and model interactions. |

### Observability
| Score | Description |
|------|------------|
| 0 | No observability in place. No visibility into system behavior. |
| 1 | Minimal metrics with ad-hoc visibility only (e.g., print debugging). No runtime monitoring. |
| 2 | Some basic metrics or logs exist but limited insights (e.g., not queryable or aggregated). |
| 3 | Good visibility into key system behaviors. Key metrics are tracked (latency, success/failure rates). Logs exist. |
| 4 | Strong observability with metrics, tracing, and dashboards providing real-time visibility into system health. |
| 5 | Full observability stack: traces, metrics, alerts, and LLM-specific monitoring (e.g., token usage, latency, hallucination flags). |


## Judging Criteria

### Production Readiness — 15 points

| Sub-criteria | Level 1 | Level 2 | Level 3 | Level 4 | Level 5 | Level 6 |
|---|---|---|---|---|---|---|
| **Solution feasibility** | Solution is not viable or feasible in real-world scenarios. Concept is flawed or technically impossible. | Solution has a real path but major blockers are unaddressed. | Some feasibility (in theory) but significant gaps. | Solution is viable with minor practical gaps. Key constraints are acknowledged. | Solution is highly feasible with cost, scaling, and edge cases considered. | Solution is realistic and deployable for real-world use. All key constraints addressed with concrete mitigations. |
| **Evaluation strategy** | No evaluation approach. Output quality is assumed. | Vague mention of evaluation but no concrete method or metrics. | Basic evaluation with limited rigour (manual, inconsistent, or unmeasured). | Evaluation plan is defined with reasonable metrics and test scenarios. | Extensive evaluation plan with meaningful metrics and analysis (functional correctness, edge cases, LLM output quality, etc). | Rigorous evaluation framework with LLM-as-judge, human review, regression tests, and measurable quality baselines. |
| **Deployment** | No deployment. Solution only runs locally via manual steps. | Deployment is described but not implemented or reproducible. | Basic deployment setup (e.g., local server) but manual or incomplete. Lacks reproducibility or config management. | Functional deployment to a live environment (HuggingFace, Vercel, Streamlit Cloud) or a basic cloud setup. | Well-structured deployment pipeline to a production cloud (GCP, AWS, etc) with documented setup steps, secrets management, and environment config. | Fully automated, production-grade deployment with CI/CD, IaC, environment parity, secrets management, and zero-downtime strategy. |

---

### Presentation — 15 points

| Sub-criteria | Level 1 | Level 2 | Level 3 | Level 4 | Level 5 | Level 6 |
|---|---|---|---|---|---|---|
| **User interface** | No user interface. Interaction is via raw terminal or API calls only. | Minimal interface exists but is broken, confusing, or incomplete. | Basic UI (functional but unintuitive or visually poor). | Interface is clean and usable. Core user flows work end-to-end. | Clean and polished UI. Intuitive, user-friendly and handles errors gracefully with clear feedback. | Interface is production-quality: responsive, accessible, delightful to use, and aligned to user needs. |
| **Demo quality** | Demo missing or failed during presentation. | Broken demo with major issues (e.g., relies heavily on workarounds to function). | Basic demo with limited clarity (poorly rehearsed, fails to highlight key capabilities, etc). | Demo is coherent and clearly shows the core value of the solution. | Demo is smooth, well-paced, and includes compelling real-world use cases. | Demo is exceptional (polished, narrative-driven, handles live questions, and leaves a strong impression). |
| **Communication** | Presentation is unclear or incoherent. Key ideas are not communicated. | Content is present but poorly organized or difficult to follow. | Main ideas come through but technical depth or clarity is lacking. | Presentation is clear and well-structured. Technical and non-technical aspects are balanced. | Presentation is confident, precise, and engaging. Decisions are well-justified. | Communication is outstanding. Exceptional clarity, storytelling, and technical articulation. |