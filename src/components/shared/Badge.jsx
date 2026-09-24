export const Badge = ({
  children,
  variant = 'indigo',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const variantStyles = {
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
      border: 'border-emerald-200/60',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      dot: 'bg-amber-500',
      border: 'border-amber-200/60',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      dot: 'bg-rose-500',
      border: 'border-rose-200/60',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      dot: 'bg-blue-500',
      border: 'border-blue-200/60',
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      dot: 'bg-indigo-500',
      border: 'border-indigo-200/60',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      dot: 'bg-purple-500',
      border: 'border-purple-200/60',
    },
    teal: {
      bg: 'bg-teal-50',
      text: 'text-teal-700',
      dot: 'bg-teal-500',
      border: 'border-teal-200/60',
    },
    slate: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      dot: 'bg-slate-400',
      border: 'border-slate-200',
    },
  };
  const currentVariant = variantStyles[variant] || variantStyles.slate;
  const sizeClass =
    size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border whitespace-nowrap font-medium transition-colors ${currentVariant.bg} ${currentVariant.text} ${currentVariant.border} ${sizeClass} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${currentVariant.dot} animate-pulse`}
        />
      )}
      {children}
    </span>
  );
};
