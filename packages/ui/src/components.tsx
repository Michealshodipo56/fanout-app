import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseStyle = "font-medium rounded-lg transition-all duration-200 inline-flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base font-semibold"
  };

  const variantStyles = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg active:scale-95",
    secondary: "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700",
    outline: "border border-blue-500/30 text-blue-400 hover:bg-blue-500/10",
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow"
  };

  return (
    <button
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Badge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    Active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Suspended: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Closed: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    Pending: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    Succeeded: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
  };
  const cls = colors[status] || "bg-slate-700/50 text-slate-300 border-slate-600";
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${cls}`}>
      {status}
    </span>
  );
};

export const AllocationBar: React.FC<{ allocations: { label: string; bps: number; color?: string }[] }> = ({
  allocations
}) => {
  const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
  return (
    <div className="w-full space-y-2">
      <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
        {allocations.map((a, idx) => {
          const pct = (a.bps / 100).toFixed(1);
          const bg = a.color || defaultColors[idx % defaultColors.length];
          return (
            <div
              key={idx}
              style={{ width: `${pct}%`, backgroundColor: bg }}
              className="h-full transition-all duration-500"
              title={`${a.label}: ${pct}%`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-slate-300">
        {allocations.map((a, idx) => {
          const bg = a.color || defaultColors[idx % defaultColors.length];
          return (
            <div key={idx} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: bg }} />
              <span>{a.label}</span>
              <span className="font-semibold text-white">{(a.bps / 100).toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
