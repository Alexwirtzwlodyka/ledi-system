export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header style={{ marginBottom: 16 }}>
      <h1 style={{ fontSize: 24, margin: 0, color: '#1f3a5f' }}>{title}</h1>
      {subtitle ? <p style={{ marginTop: 6, color: '#5e718d' }}>{subtitle}</p> : null}
    </header>
  )
}
