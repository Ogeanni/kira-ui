import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shell } from '../components/Shell'
import { Header } from '../components/Header'
import { ClientRow } from '../components/ClientRow'
import { GeneratingOverlay } from '../components/GeneratingOverlay'
import { api } from '../lib/api'

const CLIENTS = [
  {
    id: 'natura',
    name: 'Natura Skincare',
    lastReport: 'Last report 7 days ago',
    signal: { variant: 'amber', label: 'Buy Box anomaly detected' },
  },
  {
    id: 'vitalblend',
    name: 'VitalBlend Supplements',
    lastReport: 'Last report 7 days ago',
    signal: { variant: 'amber', label: 'ACOS above target' },
  },
  {
    id: 'peakgear',
    name: 'PeakGear Outdoors',
    lastReport: 'Last report 7 days ago',
    signal: { variant: 'green', label: 'No anomalies' },
  },
  {
    id: 'lumina',
    name: 'Lumina Home Lighting',
    lastReport: 'Last report 7 days ago',
    signal: { variant: 'green', label: 'No anomalies' },
  },
]

const INITIAL_STEPS = [
  { name: 'Research Agent',   status: 'waiting', detail: 'Retrieving context' },
  { name: 'Analysis Agent',   status: 'waiting', detail: 'Waiting' },
  { name: 'Report Agent',     status: 'waiting', detail: 'Waiting' },
  { name: 'Compliance Agent', status: 'waiting', detail: 'Waiting' },
]

export function Workspace() {
  const navigate   = useNavigate()
  const lastRunRef = useRef({})    // tracks last run per client for re-run detection
  const elapsedRef = useRef(null)  // interval ref for elapsed timer

  const [running, setRunning] = useState(null)
  const [steps,   setSteps]   = useState(INITIAL_STEPS)
  const [elapsed, setElapsed] = useState(0)

  function updateStep(index, patch) {
    setSteps(prev => prev.map((s, i) => i === index ? { ...s, ...patch } : s))
  }

  function startElapsed() {
    setElapsed(0)
    elapsedRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
  }

  function stopElapsed() {
    clearInterval(elapsedRef.current)
  }

  async function runReport(client) {
    const now  = Date.now()
    const prev = lastRunRef.current[client.id]

    // Re-run detection — same client within 10 minutes = implicit negative signal
    if (prev && (now - prev.time) < 600000) {
      api.recordRerun(prev.runId, client.id).catch(console.error)
    }

    setRunning(client.id)
    setSteps(INITIAL_STEPS)
    startElapsed()
    updateStep(0, { status: 'running', detail: 'Retrieving context from knowledge base' })

    try {
      // Animate steps progressively while the real API call runs (~40s)
      const researchDone = setTimeout(() => {
        updateStep(0, { status: 'done',    detail: 'Context retrieved · confidence high' })
        updateStep(1, { status: 'running', detail: 'Querying performance metrics' })
      }, 3000)

      const analysisDone = setTimeout(() => {
        updateStep(1, { status: 'done',    detail: 'Anomaly detection complete' })
        updateStep(2, { status: 'running', detail: 'Generating grounded report' })
      }, 8000)

      const reportDone = setTimeout(() => {
        updateStep(2, { status: 'done',    detail: 'Report generated' })
        updateStep(3, { status: 'running', detail: 'Checking against policy' })
      }, 30000)

      const result = await api.runPipeline(client.id)

      clearTimeout(researchDone)
      clearTimeout(analysisDone)
      clearTimeout(reportDone)

      // Store run info — must be after result exists, not on failure
      lastRunRef.current[client.id] = { time: now, runId: result.run_id }

      // Update steps with real data from the API response
      const anomalyCount = result.anomalies_detected || 0
      updateStep(0, { status: 'done', detail: 'Context retrieved · confidence high' })
      updateStep(1, { status: 'done', detail: `${anomalyCount} anomaly detected` })
      updateStep(2, { status: 'done', detail: 'Report generated' })
      updateStep(3, {
        status: 'done',
        detail: result.compliance_passed
          ? `Passed · confidence ${result.compliance_confidence?.toFixed(2) ?? '—'}`
          : 'Failed — review required',
      })

      stopElapsed()

      // Brief pause so user sees completed state before navigating
      setTimeout(() => {
        setRunning(null)
        navigate(`/report/${client.id}/${result.run_id}`, { state: { result } })
      }, 800)

    } catch (err) {
      stopElapsed()
      updateStep(0, { status: 'done', detail: 'Error — see console' })
      console.error('Pipeline failed:', err)
      setRunning(null)
      // lastRunRef NOT updated on failure — a failed run is not a "previous run"
    }
  }

  return (
    <>
      <Header />
      <Shell>
        <div style={{
          padding: 'var(--space-10) 0 var(--space-8)',
          opacity: 0,
          animation: 'fadeUp 0.4s ease forwards 0.1s',
        }}>
          <style>{`
            @keyframes fadeUp {
              from { opacity: 0; transform: translateY(8px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <h1 style={{
            fontSize:      'var(--text-2xl)',
            fontWeight:    600,
            letterSpacing: '-0.02em',
            marginBottom:  'var(--space-1)',
          }}>
            Weekly Reports
          </h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-2)' }}>
            {CLIENTS.length} clients · Monday reporting cycle
          </p>
        </div>

        <div style={{
          borderTop:    '1px solid var(--border)',
          marginBottom: 'var(--space-10)',
        }}>
          {CLIENTS.map((client, index) => (
            <ClientRow
              key={client.id}
              client={client}
              onRun={() => runReport(client)}
              isRunning={running === client.id}
              index={index}
            />
          ))}
        </div>
      </Shell>

      {running && (
        <GeneratingOverlay
          clientName={CLIENTS.find(c => c.id === running)?.name ?? running}
          steps={steps}
          elapsed={elapsed}
        />
      )}
    </>
  )
}