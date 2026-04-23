interface ProgressBarProps {
  step: number // 0 = extracting, 1 = analysing, 2 = generating (done)
}

const STEPS = [
  { title: 'Extract requirements', sub: 'Parsing JD & CV' },
  { title: 'Analyse fit',          sub: 'Matching skills & gaps' },
  { title: 'Generate outputs',     sub: 'Drafting materials' },
]

export function ProgressBar({ step }: ProgressBarProps) {
  return (
    <div className="progress">
      {STEPS.map((s, i) => {
        const isDone   = i < step
        const isActive = i === step
        return (
          <div
            key={i}
            className={`step${isDone ? ' done' : ''}${isActive ? ' active' : ''}`}
          >
            <div className="step-num">0{i + 1}</div>
            <div className="step-body">
              <div className="step-title">{s.title}</div>
              <div className="step-sub">{s.sub}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
