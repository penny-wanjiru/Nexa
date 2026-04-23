export const extractorPrompt = (jobDescription: string) => `
Extract key requirements from the following job description.

Return ONLY valid JSON — no markdown, no explanation — matching this exact structure:
{
  "skills": [],
  "responsibilities": [],
  "keywords": []
}

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
