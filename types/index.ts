export interface AnalyzeRequest {
  cv: string
  jobDescription: string
}

export interface PipelineResult {
  extracted: ExtractedJob
  analysis: AnalysisResult
  output: GeneratedOutput
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
