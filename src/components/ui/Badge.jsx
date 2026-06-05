export function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    purple: 'bg-purple-100 text-purple-800',
    ghost: 'bg-slate-100 text-slate-600',
  }
  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1',
  }
  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  )
}

export function StatutDevoir({ statut, echeance }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = echeance ? new Date(echeance) : null
  const isLate = due && due < today && statut === 'a_faire'

  if (statut === 'fait') return <Badge variant="success">✓ Fait</Badge>
  if (isLate) return <Badge variant="danger">En retard</Badge>
  return <Badge variant="warning">À faire</Badge>
}
