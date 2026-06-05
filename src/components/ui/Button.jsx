export function Button({ children, variant = 'primary', size = 'md', className = '', disabled = false, type = 'button', onClick, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary:   'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-button hover:shadow-button-hover',
    secondary: 'bg-white text-blue-700 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 focus:ring-blue-400',
    ghost:     'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-300',
    danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success:   'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500',
  }
  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-sm px-5 py-3',
    xl: 'text-base px-6 py-3.5',
  }
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}
