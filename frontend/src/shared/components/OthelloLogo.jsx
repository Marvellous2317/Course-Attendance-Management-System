export const OthelloLogo = ({
  size = 'md',
  showSubtitle = true,
  subtitle = 'COURSE MANAGEMENT SYSTEM',
  theme = 'light',
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7 text-xs rounded-lg',
    md: 'w-9 h-9 text-sm rounded-xl',
    lg: 'w-11 h-11 text-base rounded-xl',
    xl: 'w-16 h-16 text-2xl rounded-2xl',
  };
  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-2xl',
  };
  const isDark = theme === 'dark';
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Golden Yellow rounded square with bold black 'O' */}
      <div
        className={`${iconSizes[size]} bg-secondary-500 text-slate-950 font-black flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0 select-none tracking-tighter`}
      >
        O
      </div>

      <div className="flex flex-col min-w-0">
        <span
          className={`font-bold tracking-tight leading-tight ${titleSizes[size]} ${isDark ? 'text-white' : 'text-slate-900'}`}
        >
          Othello Institute
        </span>

        {showSubtitle && (
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
