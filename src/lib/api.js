/**
 * src/lib/api.js
 *
 * All communication with the KIRA backend API.
 * Components never fetch directly — they call functions here.
 *
 * Feedback events:
 *   explicit      — user clicked thumbs up/down
 *   report_copied — user copied report to clipboard
 *   report_viewed — report was read (includes time_on_report)
 *   report_rerun  — client was re-run within 10 minutes
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(error.detail || `Request failed: ${res.status}`)
  }
  return res.json()
}

export const api = {
  runPipeline(clientId, query = 'Generate weekly performance report with anomaly analysis') {
    return request('/run-pipeline', {
      method: 'POST',
      body: JSON.stringify({ client_id: clientId, query }),
    })
  },

  listReports(clientId = null) {
    const params = clientId ? `?client_id=${clientId}` : ''
    return request(`/reports${params}`)
  },

  getReport(clientId, runId) {
    return request(`/report/${clientId}/${runId}`)
  },

  health() {
    return request('/health')
  },

  /**
   * Records explicit feedback — user clicked thumbs up or down.
   */
  submitExplicitFeedback(runId, clientId, rating) {
    return request('/feedback', {
      method: 'POST',
      body: JSON.stringify({
        run_id:     runId,
        client_id:  clientId,
        event_type: 'explicit',
        rating,
      }),
    })
  },

  /**
   * Records that a user copied the report.
   * Strongest implicit positive signal — means report was good enough to send.
   */
  recordCopyEvent(runId, clientId) {
    return request('/feedback', {
      method: 'POST',
      body: JSON.stringify({
        run_id:     runId,
        client_id:  clientId,
        event_type: 'report_copied',
        rating:     'up',
        comment:    'User copied report to clipboard',
      }),
    })
  },

  /**
   * Records how long a user spent reading the report.
   * Called when the user navigates away from the report view.
   * Minimum 5 seconds to filter accidental opens.
   */
  recordViewDuration(runId, clientId, seconds, faithfulnessScore = null) {
    if (seconds < 5) return Promise.resolve()
    return request('/feedback', {
      method: 'POST',
      body: JSON.stringify({
        run_id:             runId,
        client_id:          clientId,
        event_type:         'report_viewed',
        time_on_report:     seconds,
        faithfulness_score: faithfulnessScore,
      }),
    })
  },

  /**
   * Records that a client report was re-run within 10 minutes.
   * Implicit negative signal — previous report was likely insufficient.
   */
  recordRerun(previousRunId, clientId) {
    return request('/feedback', {
      method: 'POST',
      body: JSON.stringify({
        run_id:     previousRunId,
        client_id:  clientId,
        event_type: 'report_rerun',
        rating:     'down',
        comment:    'Client report re-run within 10 minutes',
      }),
    })
  },
}
