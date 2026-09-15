import { Shell } from './Shell'

export function Header() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
    }}>
      <Shell>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-5) 0',
        }}>
          <span style={{
            fontSize: 'var(--text-md)',
            fontWeight: 600,
            letterSpacing: '-0.01em',
          }}>
            KIRA
          </span>
          <span style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-2)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {today}
          </span>
        </div>
      </Shell>
    </header>
  )
}
