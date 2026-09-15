import { StatusSignal } from './StatusSignal'

export function ClientRow({ client, onRun, isRunning, index = 0 }) {
  const hasAnomaly = client.signal.variant === 'amber'
  const hoverBorder = hasAnomaly ? 'var(--amber)' : 'var(--green)'

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'center',
        gap: 'var(--space-5)',
        padding: 'var(--space-6) 0 var(--space-6) 14px',
        marginLeft: -16,
        borderBottom: '1px solid var(--border)',
        borderLeft: '2px solid transparent',
        transition: 'border-color 0.2s, background 0.2s',
        opacity: 0,
        animation: `fadeUp 0.35s ease forwards ${0.25 + index * 0.1}s`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderLeftColor = hoverBorder
        e.currentTarget.style.background = 'rgba(255,255,255,0.018)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderLeftColor = 'transparent'
        e.currentTarget.style.background = 'transparent'
      }}
    >
      <style>{`
        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div>
        <div style={{
          fontSize: 'var(--text-md)',
          fontWeight: 500,
          letterSpacing: '-0.01em',
          marginBottom: 'var(--space-1)',
        }}>
          {client.name}
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-2)',
        }}>
          <span>{client.lastReport}</span>
          <StatusSignal variant={client.signal.variant} label={client.signal.label} />
        </div>
      </div>

      <button
        onClick={onRun}
        disabled={isRunning}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: isRunning ? 'var(--text-2)' : 'var(--text-1)',
          fontSize: 'var(--text-sm)',
          fontWeight: 500,
          padding: '7px 14px',
          borderRadius: 'var(--radius)',
          cursor: isRunning ? 'not-allowed' : 'pointer',
          whiteSpace: 'nowrap',
          transition: 'border-color 0.15s, background 0.15s',
          flexShrink: 0,
        }}
        onMouseEnter={e => {
          if (!isRunning) {
            e.currentTarget.style.borderColor = 'var(--text-2)'
            e.currentTarget.style.background = '#1d1d1d'
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.background = 'var(--surface)'
        }}
      >
        {isRunning ? 'Running...' : 'Run report'}
      </button>
    </div>
  )
}
