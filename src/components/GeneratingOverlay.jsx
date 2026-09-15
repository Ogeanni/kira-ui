export function GeneratingOverlay({ clientName, steps, elapsed }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(12,12,12,0.92)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <style>{`
        @keyframes genIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes kira-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
      `}</style>

      <div style={{
        width: '100%',
        maxWidth: 460,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        padding: '28px 28px 24px',
        margin: 'var(--space-5)',
        animation: 'genIn 0.2s ease',
      }}>
        <div style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-2)',
          marginBottom: 'var(--space-1)',
        }}>
          {clientName}
        </div>

        <div style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 600,
          letterSpacing: '-0.02em',
          marginBottom: 'var(--space-8)',
        }}>
          Generating report
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-5)',
        }}>
          {steps.map(step => (
            <AgentStep key={step.name} step={step} />
          ))}
        </div>

        <div style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-2)',
          fontVariantNumeric: 'tabular-nums',
          fontFamily: "'DM Mono', monospace",
        }}>
          {elapsed}s
        </div>
      </div>
    </div>
  )
}

function AgentStep({ step }) {
  const isDone    = step.status === 'done'
  const isRunning = step.status === 'running'
  const isWaiting = step.status === 'waiting'

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--space-3)',
    }}>
      <div style={{
        width: 17,
        height: 17,
        borderRadius: '50%',
        flexShrink: 0,
        marginTop: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 9,
        border: isDone
          ? '1px solid var(--green)'
          : isRunning
            ? '1px solid var(--amber)'
            : '1px solid var(--border)',
        background: isDone
          ? 'var(--green-bg)'
          : isRunning
            ? 'var(--amber-bg)'
            : 'transparent',
        color: isDone ? 'var(--green)' : 'transparent',
        animation: isRunning ? 'kira-pulse 1.1s ease-in-out infinite' : 'none',
        transition: 'border-color 0.2s, background 0.2s',
      }}>
        {isDone ? '✓' : ''}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 'var(--text-base)',
          fontWeight: 500,
          color: isWaiting ? 'var(--text-2)' : 'var(--text-1)',
          marginBottom: 2,
          transition: 'color 0.2s',
        }}>
          {step.name}
        </div>
        <div style={{
          fontSize: 11,
          color: 'var(--text-2)',
          fontFamily: "'DM Mono', monospace",
        }}>
          {step.detail}
        </div>
      </div>
    </div>
  )
}
