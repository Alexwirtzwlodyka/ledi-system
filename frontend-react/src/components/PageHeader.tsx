import { ruellTheme } from '../theme'

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header style={{ marginBottom: 16 }}>
      <h1 style={{ fontSize: 24, margin: 0, color: ruellTheme.title }}>{title}</h1>
      {subtitle ? <p style={{ marginTop: 6, color: ruellTheme.textMuted }}>{subtitle}</p> : null}
    </header>
  )
}
