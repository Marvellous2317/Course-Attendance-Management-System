import { motion } from 'motion/react';
export const ScrollReveal = ({
  children,
  delay = 0,
  direction = 'up',
  duration = 0.55,
  className = '',
  distance = 28,
  once = true,
}) => {
  const getInitialOffset = () => {
    switch (direction) {
      case 'up':
        return { y: distance, x: 0 };
      case 'down':
        return { y: -distance, x: 0 };
      case 'left':
        return { x: distance, y: 0 };
      case 'right':
        return { x: -distance, y: 0 };
      case 'none':
      default:
        return { x: 0, y: 0 };
    }
  };
  const initialOffset = getInitialOffset();
  return (
    <motion.div
      initial={{ opacity: 0, ...initialOffset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: '-30px' }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
        // Custom smooth cubic-bezier
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
