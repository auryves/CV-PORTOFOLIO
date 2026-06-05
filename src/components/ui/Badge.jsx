export function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const variants = {
    default: 'bg-blue-100 text-blue-700 border border-blue-200',
    success: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-100 text-amber-700 border border-amber-200',
    danger:  'bg-red-100 text-red-700 border border-red-200',
    ghost:   'bg-slate-100 text-slate-600 border border-slate-200',
  }
  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2.5 py-1',
  }
  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  )
}

export function StatutDevoir({ statut, echeance }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = echeance ? new Date(echeance) : null
  const isLate = due && due < today && statut === 'a_faire'

  if (statut === 'fait')
    return <Badge variant="success"><span>✓</span> Fait</Badge>
  if (isLate)
    return <Badge variant="danger"><span>!</span> En retard</Badge>
  return <Badge variant="warning"><span>◷</span> À faire</Badge>
}
