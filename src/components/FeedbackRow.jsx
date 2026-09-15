import { useState } from 'react'
import { api } from '../lib/api'

export function FeedbackRow({ runId, clientId }) {
  const [selected, setSelected] = useState(null)
  const [error, setError]       = useState(null)

  async function handleFeedback(rating) {
    if (selected) return   // prevent double submission
    setSelected(rating)
    try {
      await api.submitExplicitFeedback(runId, clientId, rating)
    } catch (e) {
      console.error('Feedback submission failed:', e)
      setError('Could not save — try again')
      setSelected(null)
    }
  }

  return (
    <div style={{
      padding: 'var(--space-5) 0',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      color: 'var(--text-2)',
      fontSize: 'var(--text-sm)',
    }}>
      <span>Was this report useful?</span>
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        {[
          { rating: 'up',   label: 'Yes' },
          { rating: 'down', label: 'No'  },
        ].map(({ rating, label }) => {
          const isUp     = rating === 'up'
          const active   = selected === rating
          const colour   = isUp ? 'var(--green)' : 'var(--red)'
          const bg       = isUp ? 'var(--green-bg)' : 'var(--red-bg)'

          return (
            <button
              key={rating}
              onClick={() => handleFeedback(rating)}
              disabled={!!selected}
              style={{
                background:   active ? bg : 'transparent',
                border:       `1px solid ${active ? colour : 'var(--border)'}`,
                color:        active ? colour : 'var(--text-2)',
                fontSize:     'var(--text-sm)',
                padding:      '5px 12px',
                borderRadius: 'var(--radius)',
                cursor:       selected ? 'default' : 'pointer',
                transition:   'border-color 0.15s, color 0.15s, background 0.15s',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>
      {error && (
        <span style={{ fontSize: 12, color: 'var(--red)' }}>{error}</span>
      )}
      {selected && (
        <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Saved</span>
      )}
    </div>
  )
}
