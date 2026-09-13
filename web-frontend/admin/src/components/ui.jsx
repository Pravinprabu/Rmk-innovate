// Small shared UI kit -- consistent look across every role's pages without
// pulling in a whole component library for this first slice.
import { useState } from 'react';

export function Button({ variant = 'primary', className = '', ...props }) {
  const base = 'px-4 py-2 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-brand-accent text-white hover:bg-brand-accent-dark',
    secondary: 'bg-white text-brand-primary border border-brand-border hover:bg-brand-accent-soft',
    danger: 'bg-white text-brand-danger border border-brand-danger hover:bg-brand-danger-light',
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

// A plain type="password" prop grows a show/hide eye button -- every login
// page (super-admin, hospital-admin, staff) just passes type="password"
// already, so fixing it here once covers all three without touching any
// of them individually.
export function TextField({ label, className = '', type, ...props }) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';

  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-brand-text-secondary mb-1">{label}</span>}
      <div className="relative">
        <input
          type={isPassword ? (revealed ? 'text' : 'password') : type}
          className={`w-full px-3 py-2 rounded-lg border border-brand-border bg-white text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent ${isPassword ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-brand-text-muted hover:text-brand-text-secondary"
            aria-label={revealed ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {revealed ? (
              // eye-off
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-10-8-10-8a18.5 18.5 0 0 1 4.22-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              // eye
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s3-8 11-8 11 8 11 8-3 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
    </label>
  );
}

export function SelectField({ label, className = '', children, ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-brand-text-secondary mb-1">{label}</span>}
      <select
        className={`w-full px-3 py-2 rounded-lg border border-brand-border bg-white text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function Card({ className = '', children }) {
  return (
    <div className={`bg-white rounded-xl border border-brand-border shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="bg-brand-danger-light text-brand-danger text-sm font-medium rounded-lg px-4 py-3">
      {message}
    </div>
  );
}

export function PageShell({ title, actions, children }) {
  return (
    <div className="min-h-screen bg-brand-bg">
      <header className="bg-white border-b border-brand-border px-8 py-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-primary">{title}</h1>
        <div className="flex items-center gap-3">{actions}</div>
      </header>
      <main className="p-8 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}
