import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { Shell } from '../components/Shell'
import { Header } from '../components/Header'
import { MetricCard } from '../components/MetricCard'
import { AnomalyBlock } from '../components/AnomalyBlock'
import { ActionList } from '../components/ActionList'
import { FeedbackRow } from '../components/FeedbackRow'
import { api } from '../lib/api'


useEffect(() => {
  if (!data) return
  const openedAt = Date.now()
  return () => {
    const seconds = Math.round((Date.now() - openedAt) / 1000)
    api.recordViewDuration(
      data.run_id,
      clientId,
      seconds,
      data.faithfulness_score ?? null
    )
  }
}, [data])

// Parse markdown-ish report into structured sections
function parseReport(text) {
  if (!text) return null
  const sections = {}
  const lines = text.split('\n')
  let current = null
  let buffer = []

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (current) sections[current] = buffer.join('\n').trim()
      current = line.replace('## ', '').trim()
      buffer = []
    } else {
      buffer.push(line)
    }
  }
  if (current) sections[current] = buffer.join('\n').trim()
  return sections
}

// Extract bullet list items from a section
function extractBullets(text) {
  return text
    .split('\n')
    .filter(l => l.trim().startsWith('-'))
    .map(l => l.trim().replace(/^-\s*/, ''))
}

// Extract numbered actions from Recommended Actions section
function extractActions(text) {
  const items = []
  const regex = /\d+\.\s+\*\*(.+?)\*\*:?\s*(.+?)(?=\n\d+\.|\n\s*$|$)/gs
  let match
  while ((match = regex.exec(text)) !== null) {
    const full = (match[1] + ': ' + match[2]).replace(/\*\*/g, '')
    const impactMatch = full.match(/Expected impact:\s*(.+)/i)
    items.push({
      text: full.replace(/Expected impact:.+/i, '').trim().replace(/\s+/g, ' '),
      impact: impactMatch ? 'Expected: ' + impactMatch[1].trim() : null,
    })
  }
  // Fallback: split on numbered lines
  if (items.length === 0) {
    text.split('\n').forEach(line => {
      const m = line.match(/^\d+\.\s+(.+)/)
      if (m) items.push({ text: m[1].replace(/\*\*/g, '').trim(), impact: null })
    })
  }
  return items
}

const CLIENT_NAMES = {
  natura:     'Natura Skincare',
  vitalblend: 'VitalBlend Supplements',
  peakgear:   'PeakGear Outdoors',
  lumina:     'Lumina Home Lighting',
}

export function Report() {
  const { clientId, runId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [data, setData]     = useState(location.state?.result ?? null)
  const [loading, setLoading] = useState(!data)
  const [copied, setCopied]   = useState(false)

  useEffect(() => {
    if (!data) {
      api.getReport(clientId, runId)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [clientId, runId, data])

  if (loading) {
    return (
      <>
        <Header />
        <Shell>
          <p style={{ padding: 'var(--space-10) 0', color: 'var(--text-2)' }}>
            Loading report...
          </p>
        </Shell>
      </>
    )
  }

  if (!data) {
    return (
      <>
        <Header />
        <Shell>
          <p style={{ padding: 'var(--space-10) 0', color: 'var(--text-2)' }}>
            Report not found.
          </p>
        </Shell>
      </>
    )
  }

  const report   = data.final_report || data.report_draft || ''
  const sections = parseReport(report)
  const actions  = sections?.['Recommended Actions']
    ? extractActions(sections['Recommended Actions'])
    : []
  const metrics  = sections?.['Key Metrics']
    ? extractBullets(sections['Key Metrics'])
    : []

  const compliancePassed = data.compliance_passed
  const anomalyCount     = data.anomalies_detected ?? 0

  function handleCopy() {
  navigator.clipboard.writeText(report).then(() => {
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
    api.recordCopyEvent(data.run_id, clientId)
    })
  }

  const sectionLabel = {
    fontSize: 'var(--text-xs)',
    fontWeight: 500,
    letterSpacing: '0.06em',
    color: 'var(--text-2)',
    textTransform: 'uppercase',
    marginBottom: 'var(--space-3)',
    paddingBottom: 'var(--space-2)',
    borderBottom: '1px solid var(--border)',
  }

  return (
    <>
      <Header />
      <Shell>
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'left',
            background: 'none',
            border: 'none',
            borderBottom: '1px solid var(--border)',
            padding: 'var(--space-5) 0',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-2)',
            cursor: 'pointer',
          }}
        >
          ← Back to clients
        </button>

        {/* Status bar */}
        <div style={{
          padding: 'var(--space-5) 0',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
            <StatusChip
              colour={compliancePassed ? 'var(--green)' : 'var(--red)'}
              label={compliancePassed ? 'Compliance passed' : 'Compliance failed'}
            />
            {anomalyCount > 0 && (
              <StatusChip
                colour="var(--amber)"
                label={`${anomalyCount} anomaly detected`}
              />
            )}
            <span style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-2)',
              fontFamily: "'DM Mono', monospace",
            }}>
              {data.run_id}
            </span>
          </div>
          <button
            onClick={handleCopy}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-2)',
              fontSize: 'var(--text-sm)',
              padding: '6px 14px',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
            }}
          >
            {copied ? 'Copied' : 'Copy report'}
          </button>
        </div>

        {/* Report content */}
        <div style={{ padding: 'var(--space-10) 0 60px', maxWidth: 640 }}>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-2)', marginBottom: 4 }}>
            {CLIENT_NAMES[clientId] ?? clientId}
          </div>
          <h2 style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            marginBottom: 'var(--space-8)',
          }}>
            Weekly Performance Report
          </h2>

          {/* Executive summary */}
          {sections?.['Executive Summary'] && (
            <div style={{ marginBottom: 'var(--space-8)' }}>
              <div style={sectionLabel}>Executive summary</div>
              <p style={{ fontSize: 'var(--text-base)', lineHeight: 1.7, color: 'var(--text-1)', maxWidth: '60ch' }}>
                {sections['Executive Summary']}
              </p>
            </div>
          )}

          {/* Key metrics — show as cards if parseable, else raw text */}
          {metrics.length > 0 ? (
            <div style={{ marginBottom: 'var(--space-8)' }}>
              <div style={sectionLabel}>Key metrics</div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: 'var(--space-4)',
              }}>
                {metrics.slice(0, 6).map((m, i) => {
                  const parts = m.split(':')
                  const name  = parts[0]?.trim() ?? m
                  const rest  = parts.slice(1).join(':').trim()
                  const changeMatch = rest.match(/\((.+?)\)/)
                  const value = rest.replace(/\(.*?\)/, '').trim()
                  const change = changeMatch?.[1]
                  const changeType = change?.startsWith('+') ? 'pos' : change?.startsWith('-') ? 'neg' : null
                  return (
                    <MetricCard
                      key={i}
                      name={name}
                      value={value || rest}
                      change={change}
                      changeType={changeType}
                    />
                  )
                })}
              </div>
            </div>
          ) : sections?.['Key Metrics'] && (
            <div style={{ marginBottom: 'var(--space-8)' }}>
              <div style={sectionLabel}>Key metrics</div>
              <pre style={{ fontSize: 'var(--text-sm)', color: 'var(--text-1)', whiteSpace: 'pre-wrap' }}>
                {sections['Key Metrics']}
              </pre>
            </div>
          )}

          {/* Anomalies */}
          {sections?.['Anomalies'] && sections['Anomalies'] !== 'No anomalies detected this period.' && (
            <div style={{ marginBottom: 'var(--space-8)' }}>
              <div style={sectionLabel}>Anomalies</div>
              <AnomalyBlock
                title="Detected"
                description={sections['Anomalies']}
              />
            </div>
          )}

          {/* Recommended actions */}
          {actions.length > 0 && (
            <div style={{ marginBottom: 'var(--space-8)' }}>
              <div style={sectionLabel}>Recommended actions</div>
              <ActionList actions={actions} />
            </div>
          )}
        </div>

        <FeedbackRow runId={data.run_id} clientId={clientId} />
      </Shell>
    </>
  )
}

function StatusChip({ colour, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: colour, display: 'inline-block' }} />
      <span style={{ fontWeight: 500, color: colour }}>{label}</span>
    </span>
  )
}
