import { motion } from 'motion/react';
export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  onClick,
  id,
}) => {
  return (
    <motion.div
      id={id}
      whileHover={
        hoverEffect
          ? {
              y: -2,
              boxShadow:
                '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
            }
          : void 0
      }
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={onClick}
      className={`
        bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};
