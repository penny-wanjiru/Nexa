export const extractorPrompt = (jobDescription: string) => `
Extract key requirements from the following job description.

Return ONLY valid JSON — no markdown, no explanation — matching this exact structure:
{
  "company": "",
  "skills": [],
  "responsibilities": [],
  "keywords": []
}

If the company name is not mentioned, return an empty string for "company".

Job Description:
${jobDescription}
`.trim()

export const analyzerPrompt = (cv: string, extractedData: string) => `
Compare the following CV with the extracted job requirements.

Return ONLY valid JSON — no markdown, no explanation — matching this exact structure:
{
  "matched_skills": [],
  "missing_skills": [],
  "strengths": [],
  "gaps": []
}

CV:
${cv}

Job Requirements (JSON):
${extractedData}
`.trim()

export const cvPrompt = (cv: string, jobRequirements: string, analysis: string) => `
You are a professional CV writer. Rewrite the candidate's CV, tailored to the job requirements.

Rules:
- Extract real facts, dates, companies, and education from the original CV — do NOT invent anything
- Rewrite experience bullets to be impact-focused with metrics where they exist in the original
- Weave in keywords from the job requirements naturally
- Keep it ATS-friendly: no tables, no graphics, plain text sections only
- Skills section: list only skills the candidate actually has, ordered by relevance to the job

Return ONLY valid JSON — no markdown, no explanation — matching this exact structure:
{
  "name": "",
  "contact": "email | phone | linkedin | location",
  "summary": "2-3 sentence professional summary tailored to the role",
  "experience": [
    {
      "role": "",
      "company": "",
      "dates": "",
      "bullets": ["", ""]
    }
  ],
  "skills": [],
  "education": [
    {
      "degree": "",
      "institution": "",
      "dates": ""
    }
  ]
}

Original CV:
${cv}

Job Requirements (JSON):
${jobRequirements}

Gap Analysis (JSON):
${analysis}
`.trim()

export const evaluatorPrompt = (cv: string, jobDescription: string, output: string, tailoredCV: string) => `
You are an expert ATS analyst and career coach. Evaluate the quality of the generated job application materials.

Score each dimension from 0–100:
- ats_score: How well the tailored CV will pass ATS screening (keyword density, formatting, structure)
- keyword_coverage: Percentage of key job requirements addressed in the materials
- tone_score: Professionalism and alignment of tone with the target role
- overall: Holistic quality score for the complete application package

Provide exactly 2–3 concrete, actionable improvement suggestions.

Return ONLY valid JSON — no markdown, no explanation — matching this exact structure:
{
  "ats_score": 0,
  "keyword_coverage": 0,
  "tone_score": 0,
  "overall": 0,
  "suggestions": []
}

Original CV:
${cv}

Job Description:
${jobDescription}

Generated Materials (JSON):
${output}

Tailored CV (JSON):
${tailoredCV}
`.trim()

export const generatorPrompt = (cv: string, analysis: string) => `
You are a professional CV and cover letter writer.

Using the CV and analysis below, generate tailored job application materials.

Return ONLY valid JSON — no markdown, no explanation — matching this exact structure:
{
  "cv_bullet_points": [],
  "cover_letter": "",
  "fit_summary": ""
}

Guidelines:
- cv_bullet_points: 5–8 improved bullet points rewritten to align with the job
- cover_letter: 3 concise paragraphs, professional tone, aligned to the role
- fit_summary: 2–3 sentences summarising how well the candidate fits

CV:
${cv}

Analysis (JSON):
${analysis}
`.trim()
