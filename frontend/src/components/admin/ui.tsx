import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Tone } from '../../lib/adminTone';
import { TONE_VAR } from '../../lib/adminTone';

const TONE_CLASS: Record<Tone, string> = {
  blue: 'c-blue',
  green: 'c-green',
  amber: 'c-amber',
  red: 'c-red',
  violet: 'c-violet',
  cyan: 'c-cyan',
};

const TONE_BADGE_CLASS: Record<Tone, string> = {
  blue: 't-blue',
  green: 't-green',
  amber: 't-amber',
  red: 't-red',
  violet: 't-violet',
  cyan: 't-cyan',
};

export function Card({ children, className = '', style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
    </div>
  );
}

export function CardHead({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="card-head">
      <div>
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`badge ${TONE_BADGE_CLASS[tone]}`}>{children}</span>;
}

export function Stats({ children }: { children: ReactNode }) {
  return <div className="stats">{children}</div>;
}

export function Stat({
  icon: Icon,
  tone,
  value,
  unit,
  label,
  trend,
  barPct,
}: {
  icon: LucideIcon;
  tone: Tone;
  value: ReactNode;
  unit?: string;
  label: string;
  trend?: string;
  barPct?: number;
}) {
  return (
    <div className="stat">
      <div className="stat-top">
        <div className={`stat-ic ${TONE_CLASS[tone]}`}>
          <Icon />
        </div>
        {trend && <span className={`trend ${TONE_BADGE_CLASS[tone]}`}>{trend}</span>}
      </div>
      <div className="stat-val">
        {value} {unit && <small>{unit}</small>}
      </div>
      <div className="stat-label">{label}</div>
      {barPct !== undefined && (
        <div className="stat-bar">
          <i style={{ width: `${barPct}%`, background: `var(--${TONE_VAR[tone]})` }} />
        </div>
      )}
    </div>
  );
}

export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="filterbar">{children}</div>;
}

export function Seg({ children }: { children: ReactNode }) {
  return <div className="seg">{children}</div>;
}

export function SegButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className={active ? 'on' : ''} onClick={onClick}>
      {children}
    </button>
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = '', ...rest } = props;
  return <select className={`select ${className}`} {...rest} />;
}

export function Btn({
  variant = 'ghost',
  className = '',
  style,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'ok' | 'no' | 'warn' }) {
  if (variant === 'warn') {
    return (
      <button
        className={`btn ${className}`}
        style={{ background: 'var(--amber-soft)', color: 'var(--amber)', ...style }}
        {...rest}
      />
    );
  }
  return <button className={`btn btn-${variant} ${className}`} style={style} {...rest} />;
}

export function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (next: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={`toggle ${checked ? 'on' : ''}`}
      onClick={() => onChange(!checked)}
      style={disabled ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
    />
  );
}

export function Empty({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: ReactNode }) {
  return (
    <div className="empty">
      <div className="empty-ic">
        <Icon size={22} />
      </div>
      <b>{title}</b>
      <p>{text}</p>
    </div>
  );
}

export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="table-wrap">
      <table>{children}</table>
    </div>
  );
}

export function CompAvatar({ initials, tone }: { initials: string; tone: Tone }) {
  return <div className={`comp-av ${TONE_CLASS[tone]}`}>{initials}</div>;
}

export function ProgressPill({ pct, label, color }: { pct: number; label: string; color?: string }) {
  return (
    <div className="pr">
      <div className="pr-track">
        <i style={{ width: `${pct}%`, background: color ?? 'var(--green)' }} />
      </div>
      <b>{label}</b>
    </div>
  );
}
