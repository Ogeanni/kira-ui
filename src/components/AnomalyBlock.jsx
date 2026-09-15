export function AnomalyBlock({ title, description }) {
  return (
    <div style={{
      background: 'var(--amber-bg)',
      border: '1px solid var(--amber-border)',
      borderRadius: 'var(--radius)',
      padding: 'var(--space-4)',
    }}>
      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-1)' }}>
        {title}
      </div>
      <p style={{ fontSize: 'var(--text-base)', lineHeight: 1.6, color: 'var(--text-1)', maxWidth: '60ch' }}>
        {description}
      </p>
    </div>
  )
}
