import { z } from 'zod'

export const ExtractedJobSchema = z.object({
  skills: z.array(z.string()),
  responsibilities: z.array(z.string()),
  keywords: z.array(z.string()),
})

export const AnalysisResultSchema = z.object({
  matched_skills: z.array(z.string()),
  missing_skills: z.array(z.string()),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
})

export const GeneratedOutputSchema = z.object({
  cv_bullet_points: z.array(z.string()),
  cover_letter: z.string(),
  fit_summary: z.string(),
})

export const TailoredCVSchema = z.object({
  name: z.string(),
  contact: z.string(),
  summary: z.string(),
  experience: z.array(z.object({
    role: z.string(),
    company: z.string(),
    dates: z.string(),
    bullets: z.array(z.string()),
  })),
  skills: z.array(z.string()),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    dates: z.string(),
  })),
})

export const EvaluationSchema = z.object({
  ats_score: z.number().min(0).max(100),
  keyword_coverage: z.number().min(0).max(100),
  tone_score: z.number().min(0).max(100),
  overall: z.number().min(0).max(100),
  suggestions: z.array(z.string()),
})

export type ExtractedJob = z.infer<typeof ExtractedJobSchema>
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>
export type GeneratedOutput = z.infer<typeof GeneratedOutputSchema>
export type TailoredCV = z.infer<typeof TailoredCVSchema>
export type Evaluation = z.infer<typeof EvaluationSchema>
