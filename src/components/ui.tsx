import { useEffect, useRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react'
import { AlertCircle, ArrowUpRight, Inbox, LoaderCircle, X, type LucideIcon } from 'lucide-react'

export function Button({ variant = 'primary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  return <button className={`btn btn-${variant} ${className}`} {...props} />
}
export function FormInput({ label, id, children, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; children?: ReactNode }) {
  return <label className="form-field" htmlFor={id}><span>{label}</span><div className="input-wrap"><input id={id} {...props} />{children}</div></label>
}
export function StatusBadge({ available }: { available: boolean }) {
  return <span className={`status-badge ${available ? 'available' : 'sold'}`}><span />{available ? 'Available' : 'Sold'}</span>
}
export function LoadingState({ label = 'Loading your workspace…' }: { label?: string }) { return <span className="loading-state" role="status"><LoaderCircle className="spin" size={18} />{label}</span> }
export function ErrorMessage({ children }: { children: ReactNode }) { return <div className="error-message" role="alert"><AlertCircle size={18} />{children}</div> }
export function EmptyState({ title, children }: { title: string; children: ReactNode }) { return <div className="empty-state"><span className="icon-tile"><Inbox /></span><h3>{title}</h3><p>{children}</p></div> }
export function PageHeading({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description: string; children?: ReactNode }) {
  return <div className="page-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1><p>{description}</p></div>{children}</div>
}
export function StatCard({ label, value, caption, icon: Icon, tone = 'blue', financial = false }: { label: string; value: string; caption: string; icon: LucideIcon; tone?: string; financial?: boolean }) {
  return <article className={`stat-card surface ${financial ? 'financial' : ''} tone-${tone}`}><div className="stat-top"><span className={`icon-tile ${tone}`}><Icon size={20} /></span>{financial ? <span className="stat-currency">PKR</span> : <ArrowUpRight size={17} className="subtle-icon" />}</div><p className="stat-label">{label}</p><p className="stat-value">{value}</p><p className="stat-caption">{caption}</p></article>
}
export function Modal({ open, title, children, onClose, confirmLabel, onConfirm }: { open: boolean; title: string; children: ReactNode; onClose: () => void; confirmLabel?: string; onConfirm?: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { const dialog = ref.current; if (open && !dialog?.open) dialog?.showModal(); if (!open && dialog?.open) dialog.close() }, [open])
  return <dialog ref={ref} className="modal surface" aria-labelledby="modal-title" onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose() }}><button className="icon-button modal-close" aria-label="Close dialog" onClick={onClose}><X size={20} /></button><h2 id="modal-title">{title}</h2>{children}<div className="modal-actions"><Button variant="secondary" onClick={onClose}>{onConfirm ? 'Stay here' : 'Back to dashboard'}</Button>{onConfirm && <Button onClick={onConfirm}>{confirmLabel}</Button>}</div></dialog>
}
