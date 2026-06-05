export function Card({ children, className = '', onClick, hoverable = false }) {
  return (
    <div onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200 transition-all duration-200
        ${hoverable ? 'cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 hover:border-blue-200' : ''}
        ${className}`}
      style={{ boxShadow: '0 2px 8px rgba(14,27,77,.06)' }}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return <div className={`px-4 py-3.5 border-b border-slate-100 ${className}`}>{children}</div>
}

export function CardBody({ children, className = '' }) {
  return <div className={`px-4 py-4 ${className}`}>{children}</div>
}

export function CardFooter({ children, className = '' }) {
  return <div className={`px-4 py-3 border-t border-slate-100 ${className}`}>{children}</div>
}
