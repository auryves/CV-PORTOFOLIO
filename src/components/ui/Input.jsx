const inputBase = `w-full px-4 py-3 text-sm font-medium bg-white border-2 border-slate-200 rounded-xl
  text-slate-900 placeholder-slate-400 transition-all duration-200 outline-none
  focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10`

export function Input({ label, error, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">{label}</label>}
      <input className={`${inputBase} ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : ''}`} {...props} />
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className = '', rows = 4, ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">{label}</label>}
      <textarea rows={rows}
        className={`${inputBase} resize-none ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : ''}`}
        {...props} />
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">{label}</label>}
      <select className={`${inputBase} cursor-pointer ${error ? 'border-red-400' : ''}`} {...props}>
        {children}
      </select>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
}
