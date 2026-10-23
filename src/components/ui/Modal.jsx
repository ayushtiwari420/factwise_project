import { useEffect } from 'react';
import { X } from 'lucide-react';
export default function Modal({ open, title, children, onClose, footer, wide = false, dismissible = true }) {
  useEffect(() => { if (!open || !dismissible) return undefined; const handler = (e) => { if (e.key === 'Escape') onClose?.(); }; window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler); }, [open, onClose, dismissible]);
  if (!open) return null;
  return <div className="modal-backdrop" onMouseDown={(e) => { if (dismissible && e.target === e.currentTarget) onClose?.(); }}><section className={`modal ${wide ? 'modal--wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}><header className="modal__header"><h2>{title}</h2>{dismissible && <button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={18} /></button>}</header><div className="modal__body">{children}</div>{footer && <footer className="modal__footer">{footer}</footer>}</section></div>;
}
