export interface AnalyzeRequest {
  cv: string
  jobDescription: string
}

export interface TailoredCV {
  name: string
  contact: string
  summary: string
  experience: { role: string; company: string; dates: string; bullets: string[] }[]
  skills: string[]
  education: { degree: string; institution: string; dates: string }[]
}

export interface PipelineResult {
  extracted: ExtractedJob
  analysis: AnalysisResult
  output: GeneratedOutput
  tailoredCV: TailoredCV
}

export interface ExtractedJob {
  skills: string[]
  responsibilities: string[]
  keywords: string[]
}

export interface AnalysisResult {
  matched_skills: string[]
  missing_skills: string[]
  strengths: string[]
  gaps: string[]
}

export interface GeneratedOutput {
  cv_bullet_points: string[]
  cover_letter: string
  fit_summary: string
}
