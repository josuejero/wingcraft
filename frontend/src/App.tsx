import './App.css'
import type { ChangeEvent } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { buildTriageResult, seededIncidentRecords } from '@wingcraft/parser'
import type { IncidentRecord, TriageResult } from '@wingcraft/types'

const defaultInput = seededIncidentRecords[0]?.evidenceLines.join('\n') ?? ''
const sampleCount = 6
const checklistItems = ['Restart core services', 'Review console output', 'Inspect files & configs', 'Verify backups', 'Update documentation']

const formatConfidenceLabel = (value?: number) => {
  if (typeof value !== 'number') return 'n/a'
  return `${Math.round(Math.min(Math.max(value, 0), 1) * 100)}%`
}

const clampConfidence = (value?: number) => {
  if (typeof value !== 'number') return 0
  return Math.round(Math.min(Math.max(value, 0), 1) * 100)
}

const buildCustomerReply = (result: TriageResult) => {
  const impact = result.category ?? 'the service'
  const knownImpact = result.customerMessage ? result.customerMessage : `We're investigating ${impact} affecting ${result.affectedComponent || 'the platform'}.`
  const cause = result.likelyCause ? `Likely cause: ${result.likelyCause}.` : ''
  const firstStep = result.safeFirstStep ? `First step: ${result.safeFirstStep}.` : ''
  return `Thanks for flagging this incident. ${knownImpact} ${cause} ${firstStep} We'll follow up as soon as we have an update.`.trim()
}

const extractResolutionSteps = (notes?: string) => {
  if (!notes) return []
  return notes
    .split(/\r?\n/)
    .map((item) => item.split(/(?<=\.)\s+/))
    .flat()
    .map((item) => item.trim())
    .filter(Boolean)
}

function App() {
  const [logInput, setLogInput] = useState(defaultInput)
  const [result, setResult] = useState<TriageResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(seededIncidentRecords[0]?.id ?? null)
  const [copyStatus, setCopyStatus] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const parseGivenInput = useCallback((text: string) => {
    try {
      const triage = buildTriageResult(text)
      setResult(triage)
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    }
  }, [])

  useEffect(() => {
    if (defaultInput) {
      parseGivenInput(defaultInput)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const evidenceList = useMemo(() => result?.evidenceLines ?? [], [result])
  const resolutionSteps = useMemo(() => extractResolutionSteps(result?.resolutionNotes), [result])
  const sampleIncidents = seededIncidentRecords.slice(0, sampleCount)

  const handleIncidentSelect = (incident: IncidentRecord) => {
    const text = incident.evidenceLines.join('\n')
    setLogInput(text)
    setSelectedIncidentId(incident.id)
    parseGivenInput(text)
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const content = reader.result as string
      setLogInput(content)
      parseGivenInput(content)
    }
    reader.onerror = () => {
      setError('Unable to read the selected file.')
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const handleCopyReply = async () => {
    if (!result) return
    const reply = buildCustomerReply(result)
    try {
      await navigator.clipboard.writeText(reply)
      setCopyStatus('Reply copied')
      setTimeout(() => setCopyStatus(''), 2500)
    } catch (err) {
      setCopyStatus('Clipboard unavailable')
    }
  }

  const customerReply = result ? buildCustomerReply(result) : 'Parse a log to draft the customer reply.'

  return (
    <div className="console-shell">
      <header className="hero">
        <p className="eyebrow">Home</p>
        <h1>Wingcraft Support Console</h1>
        <p className="hero-copy">
          Wingcraft ingests raw server logs, surfaces deterministic triage, and guides a recruiter through a calm,
          support-style investigation.
        </p>
      </header>

      <section className="panel sample-incidents">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Sample Incidents</p>
            <p className="panel-subtitle">Click a preset case to load its log evidence.</p>
          </div>
          <span className="panel-hint">Recruiter-friendly scenarios</span>
        </div>
        <div className="incident-grid">
          {sampleIncidents.map((incident) => (
            <button
              type="button"
              key={incident.id}
              className={`incident-card ${incident.id === selectedIncidentId ? 'active' : ''}`}
              onClick={() => handleIncidentSelect(incident)}
            >
              <div className="incident-card-header">
                <span className="incident-id">{incident.id}</span>
                <span className={`incident-badge ${incident.category.replace(/\s+/g, '-')}`}>{incident.category}</span>
              </div>
              <p className="incident-label">{incident.label}</p>
              <p className="incident-meta">Severity: {incident.severity} · Priority: {incident.priority}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="panel upload-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Upload Log</p>
            <p className="panel-subtitle">Paste raw text or load a .log/.txt file.</p>
          </div>
          <div className="upload-actions">
            <button type="button" className="ghost" onClick={handleFileUpload}>
              Choose log file
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".log,.txt,text/plain"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>
        <textarea
          value={logInput}
          onChange={(event) => setLogInput(event.target.value)}
          placeholder="Paste latest.log, stack trace, or console output."
        />
        <div className="actions">
          <button onClick={() => parseGivenInput(logInput)}>Parse logs</button>
          {error && <span className="error">{error}</span>}
        </div>
        <p className="upload-hint">The parser runs entirely in-browser; no data leaves your session.</p>
      </section>

      <section className="panel diagnosis-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Diagnosis</p>
            <p className="panel-subtitle">Category, confidence, cause, and supporting evidence.</p>
          </div>
          <span className="panel-hint">Confidence is deterministic.</span>
        </div>
        <div className="diagnosis-grid">
          <article>
            <h3>Category</h3>
            <p className="field-value">{result?.category ?? '–'}</p>
            <p className="muted">Affected component: {result?.affectedComponent ?? 'unknown'}</p>
          </article>
          <article>
            <h3>Confidence</h3>
            <p className="field-value">{formatConfidenceLabel(result?.confidenceScore)}</p>
            <div className="confidence-track">
              <div className="confidence-fill" style={{ width: `${clampConfidence(result?.confidenceScore)}%` }} />
            </div>
            <p className="muted">Signature hints + heuristics yield this percentage.</p>
          </article>
          <article>
            <h3>Likely cause</h3>
            <p>{result?.likelyCause ?? 'Awaiting parser output.'}</p>
          </article>
          <article className="evidence-section">
            <h3>Evidence lines</h3>
            {evidenceList.length ? (
              <ul>
                {evidenceList.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : (
              <p className="muted">Parse logs to populate the evidence.</p>
            )}
          </article>
        </div>
      </section>

      <section className="panel action-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Action Panel</p>
            <p className="panel-subtitle">Safe steps, next actions, and escalation posture.</p>
          </div>
          <span className="panel-hint">Aligned with Phase 4 guidance.</span>
        </div>
        <div className="action-grid">
          <article>
            <h3>Safe first step</h3>
            <p>{result?.safeFirstStep ?? 'Parse an incident to see safe guidance.'}</p>
          </article>
          <article>
            <h3>Next steps</h3>
            {resolutionSteps.length ? (
              <ul>
                {resolutionSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            ) : (
              <p className="muted">Resolution notes fill this once the parser has context.</p>
            )}
          </article>
          <article>
            <h3>Evidence to collect</h3>
            <ul>
              {(result?.evidenceToCollect ?? []).length ? (
                result!.evidenceToCollect.map((item) => <li key={item}>{item}</li>)
              ) : (
                <li className="muted">No evidence listed yet.</li>
              )}
            </ul>
          </article>
          <article className={`escalation-pill ${result?.escalate ? 'escalate' : 'resolved'}`}>
            <h3>Escalation</h3>
            <p>{result?.escalate ? 'Elevate to on-call' : 'Handle at frontline'}</p>
            <p className="muted">Priority: {result?.priority ?? '–'}</p>
          </article>
        </div>
      </section>

      <section className="panel customer-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Customer Reply</p>
            <p className="panel-subtitle">Best-practice acknowledgement, impact, and next step.</p>
          </div>
          <div className="reply-actions">
            <button type="button" onClick={handleCopyReply} disabled={!result}>
              Copy reply
            </button>
            {copyStatus && <span className="copy-status">{copyStatus}</span>}
          </div>
        </div>
        <pre className="reply-block">{customerReply}</pre>
        <p className="muted">
          Atlassian &amp; PagerDuty templates emphasize early acknowledgement, current impact, and a clear next
          update.
        </p>
      </section>

      <section className="panel checklist-panel">
        <div className="panel-header">
          <p className="eyebrow">Checklist</p>
          <span className="panel-hint">Front-line validations</span>
        </div>
        <div className="checklist-grid">
          {checklistItems.map((item) => (
            <label key={item} className="checklist-item">
              <span className="checkbox" aria-hidden />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="panel about-panel">
        <div className="panel-header">
          <p className="eyebrow">About the Lab</p>
          <span className="panel-hint">docs/phase4-parser.md</span>
        </div>
        <p>
          The Phase 4 parser runs a client-side pipeline (normalize lines, detect signatures, classify, build the
          triage) so every recruiter demo stays deterministic and reproducible. The frontend mirrors the documented
          architecture while still delivering a local-in-browser experience that feels like a support console.
        </p>
        <p>
          Ship this interface locally with `npm run dev` to demo the lab; everything runs inside the browser so you can
          explain the same parser stages you read about in the Phase 4 doc right on-screen.
        </p>
      </section>
    </div>
  )
}

export default App
