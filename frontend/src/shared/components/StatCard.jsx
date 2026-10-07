import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from './Card';
export const StatCard = ({
  id,
  title,
  value,
  subValue,
  growth,
  growthLabel = 'vs last semester',
  icon,
  colorScheme = 'indigo',
  delay = 0,
}) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50/80',
      text: 'text-indigo-600',
      ring: 'group-hover:ring-indigo-100',
      border: 'border-indigo-100',
    },
    emerald: {
      bg: 'bg-emerald-50/80',
      text: 'text-emerald-600',
      ring: 'group-hover:ring-emerald-100',
      border: 'border-emerald-100',
    },
    blue: {
      bg: 'bg-blue-50/80',
      text: 'text-blue-600',
      ring: 'group-hover:ring-blue-100',
      border: 'border-blue-100',
    },
    purple: {
      bg: 'bg-purple-50/80',
      text: 'text-purple-600',
      ring: 'group-hover:ring-purple-100',
      border: 'border-purple-100',
    },
    amber: {
      bg: 'bg-amber-50/80',
      text: 'text-amber-600',
      ring: 'group-hover:ring-amber-100',
      border: 'border-amber-100',
    },
  };
  const scheme = colorMap[colorScheme];
  const isPositive = growth !== void 0 ? growth >= 0 : true;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card id={id} hoverEffect className="p-5 relative overflow-hidden group">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {title}
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {value}
              </h3>
              {subValue && (
                <span className="text-xs text-slate-400 font-normal">
                  {subValue}
                </span>
              )}
            </div>
          </div>

          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${scheme.bg} ${scheme.text} transition-transform duration-300 group-hover:scale-110`}
          >
            {icon}
          </div>
        </div>

        {growth !== void 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div
              className={`inline-flex items-center gap-1 font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}
            >
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>{Math.abs(growth)}%</span>
            </div>
            <span className="text-slate-400 text-xs truncate max-w-[130px]">
              {growthLabel}
            </span>
          </div>
        )}
      </Card>
    </motion.div>
  );
};
