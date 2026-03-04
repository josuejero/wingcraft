import './App.css'
import type { JSX } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { buildTriageResult, seededIncidentRecords } from '@wingcraft/parser'
import type { IncidentRecord, TriageResult } from '@wingcraft/types'

const defaultInput = seededIncidentRecords[0]?.evidenceLines.join(' ') ?? ''

const displayFields: Array<{ label: string; key: keyof IncidentRecord }> = [
  { label: 'Label', key: 'label' },
  { label: 'Category', key: 'category' },
  { label: 'Severity', key: 'severity' },
  { label: 'Priority', key: 'priority' },
  { label: 'Affected component', key: 'affectedComponent' },
  { label: 'Escalation?', key: 'escalate' }
]

const fieldSourceBadge = (source?: 'seeded' | 'heuristic'): JSX.Element | null => {
  if (!source) return null
  return <span className={`field-source ${source}`}>{source.toUpperCase()}</span>
}

const formatValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.join(' • ')
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  return String(value ?? '-')
}

function App() {
  const [logInput, setLogInput] = useState(defaultInput)
  const [result, setResult] = useState<TriageResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const parse = () => {
    try {
      const triage = buildTriageResult(logInput)
      setResult(triage)
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  useEffect(() => {
    if (defaultInput) {
      parse()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const evidenceList = useMemo(() => result?.evidenceLines ?? [], [result])

  return (
    <div className="app-shell">
      <header>
        <div>
          <p className="eyebrow">Wingcraft Phase 1</p>
          <h1>Incident triage simulator</h1>
        </div>
        <p className="subtitle">Paste raw log text, inspect the classifier’s interpretation, and compare it to the seeded evidence.</p>
      </header>

      <section className="grid">
        <div className="card">
          <h2>Log ingest</h2>
          <p>Client-side parser accepts raw PaperMC logs or stack traces.</p>
          <textarea
            value={logInput}
            onChange={(event) => setLogInput(event.target.value)}
            placeholder="Paste server logs here"
          />
          <div className="actions">
            <button onClick={parse}>Parse logs</button>
            {error && <span className="error">{error}</span>}
          </div>
        </div>

        <div className="card">
          <h2>Structured triage</h2>
          {result ? (
            <div className="field-grid">
              {displayFields.map(({ label, key }) => {
                const mapKey = `${label}-${key}`
                return (
                  <div key={mapKey} className="field-row">
                    <p>
                      <strong>{label}</strong>
                    </p>
                    <p className="field-value">{formatValue(result[key])}</p>
                    {fieldSourceBadge(result.fieldSources?.[key])}
                  </div>
                )
              })}
            </div>
          ) : (
            <p>Parse an excerpt to see structured answers.</p>
          )}
        </div>
      </section>

      {result && (
        <section className="card">
          <h2>Detailed guidance</h2>
          <div className="detail-grid">
            <article>
              <h3>Safe first step</h3>
              <p>{result.safeFirstStep}</p>
            </article>
            <article>
              <h3>Likely cause</h3>
              <p>{result.likelyCause}</p>
            </article>
            <article>
              <h3>Customer message</h3>
              <p>{result.customerMessage}</p>
            </article>
            <article>
              <h3>Evidence to collect</h3>
              <ul>
                {result.evidenceToCollect.map((item: string) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article>
              <h3>Resolution notes</h3>
              <p>{result.resolutionNotes}</p>
            </article>
          </div>
        </section>
      )}

      {result && (
        <section className="card">
          <div className="field-row">
            <div>
              <h3>Evidence lines</h3>
              <p>{result.matchedIncidentId ? 'Matched seeded incident' : 'Heuristic evidence'}</p>
            </div>
          </div>
          <ul className="evidence-list">
            {evidenceList.map((line: string) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="card">
        <h2>Seeded incident catalogue</h2>
        <div className="catalogue">
          {seededIncidentRecords.slice(0, 6).map((incident: IncidentRecord) => (
            <article key={incident.id}>
              <p className="incident-id">{incident.id}</p>
              <p className="incident-label">{incident.label}</p>
              <p className="incident-meta">
                <span>{incident.category}</span>
                <span>{incident.severity}</span>
                <span>{incident.priority}</span>
              </p>
              <p>{incident.safeFirstStep}</p>
            </article>
          ))}
        </div>
        <p className="footnote">All 15 incidents live in <code>packages/data/incidents.json</code> and are published via <code>@wingcraft/data</code>.</p>
      </section>
    </div>
  )
}

export default App
