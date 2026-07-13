import { X } from "lucide-react"

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4">
      <div className="w-full max-w-md rounded-lg border border-line bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base text-cream">{title}</h3>
          <button onClick={onClose} className="text-muted hover:text-cream">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Modal
