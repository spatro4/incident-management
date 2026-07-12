import { X } from 'lucide-react'

export default function Modal({ open, onClose, children, title }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-pop-in">
      <div className="card-playful w-full max-w-lg p-6 relative animate-pop-in">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        )}
        {title && <h2 className="font-display text-2xl font-bold text-slate-800 mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  )
}
