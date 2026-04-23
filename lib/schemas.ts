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

export type ExtractedJob = z.infer<typeof ExtractedJobSchema>
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>
export type GeneratedOutput = z.infer<typeof GeneratedOutputSchema>
