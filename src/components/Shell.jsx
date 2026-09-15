/**
 * Shell — the outer layout wrapper.
 * Centres content, provides consistent horizontal padding.
 */
export function Shell({ children }) {
  return (
    <div style={{
      maxWidth: 'var(--max-width)',
      margin: '0 auto',
      padding: '0 var(--space-6)',
    }}>
      {children}
    </div>
  )
}
