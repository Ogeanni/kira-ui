export function MetricCard({ name, value, change, changeType }) {
  const changeColour =
    changeType === 'pos' ? 'var(--green)' :
    changeType === 'neg' ? 'var(--red)'   : 'var(--text-2)'

  return (
    <div style={{
      padding: '14px var(--space-4)',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
    }}>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 'var(--space-1)' }}>
        {name}
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>
        {value}
      </div>
      {change && (
        <div style={{ fontSize: 12, color: changeColour, marginTop: 2, fontFamily: "'DM Mono', monospace" }}>
          {change}
        </div>
      )}
    </div>
  )
}
