export function ActionList({ actions }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {actions.map((action, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '20px 1fr', gap: 'var(--space-3)', alignItems: 'start' }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-2)', fontVariantNumeric: 'tabular-nums', paddingTop: 1, fontFamily: "'DM Mono', monospace" }}>
            {i + 1}
          </span>
          <div>
            <div style={{ fontSize: 'var(--text-base)', lineHeight: 1.6, color: 'var(--text-1)' }}>
              {action.text}
            </div>
            {action.impact && (
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 3 }}>
                {action.impact}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
