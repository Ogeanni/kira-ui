/**
 * StatusSignal — coloured dot with label.
 * variant: 'amber' | 'green' | 'red'
 */
export function StatusSignal({ variant, label }) {
  const colours = {
    amber: 'var(--amber)',
    green: 'var(--green)',
    red:   'var(--red)',
  }
  const colour = colours[variant] || 'var(--text-2)'

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-1)',
      fontSize: 'var(--text-sm)',
      color: colour,
    }}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: colour,
        flexShrink: 0,
        display: 'inline-block',
      }} />
      {label}
    </span>
  )
}
