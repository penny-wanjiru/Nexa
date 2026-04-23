@AGENTS.md
# 🧠 Nexa — Job Application Copilot

## 🎯 Goal
Build a web app that helps users tailor their CV and generate a cover letter based on a specific job description.

---

## 🔧 Core Flow

### Input
- User provides:
  - Resume (CV text)
  - Job description

---

## ⚙️ Processing (Multi-Step AI Pipeline)

### 1. Extractor
**Input:**
- Job description

**Output:**
- Required skills
- Responsibilities
- Keywords

---

### 2. Analyzer
**Input:**
- Extracted job data
- User CV

**Output:**
- Matched skills
- Missing skills
- Strengths
- Gaps

---

### 3. Generator
**Input:**
- Analysis results
- User CV

**Output:**
- Tailored CV bullet points
- Cover letter
- Short “fit summary”

---

## 🧱 Architecture

### Frontend
- Next.js (App Router)
- UI Components:
  - Textarea → CV input
  - Textarea → Job description input
  - Submit button
  - Output sections:
    - Gap analysis
    - Improved CV
    - Cover letter

---

### Backend
- FastAPI

#### Endpoint

**Responsibility:**
- Runs full pipeline:
  - Extract → Analyze → Generate

---

## 🔗 Communication
- Frontend uses `fetch()` to call backend API
- Backend communicates with LLM (Claude / OpenAI)

---

## 🤖 AI Design

### Approach
- Prompt chaining (pseudo multi-agent system)

### Steps
1. Extract job requirements  
2. Analyze CV vs job  
3. Generate outputs  

---

### Structured Output (Example)
```json
{
  "matched_skills": [],
  "missing_skills": [],
  "suggested_improvements": []
}


//Extractor prompt
Extract key requirements from the following job description.

Return JSON with:
- skills (list)
- responsibilities (list)
- keywords (list)

Job Description:
{{job_description}}

//Analyzer prompt
Compare the following CV with the job requirements.

Return JSON with:
- matched_skills
- missing_skills
- strengths
- gaps

CV:
{{cv}}

Job Requirements:
{{extracted_data}}


//Generator Prompt
Using the analysis, generate:

1. Improved CV bullet points
2. A tailored cover letter
3. A short fit summary

Make it professional and aligned to the job.

CV:
{{cv}}

Analysis:
{{analysis}}