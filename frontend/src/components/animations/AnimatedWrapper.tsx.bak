// src/components/animations/AnimatedWrapper.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedWrapperProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}

export const FadeIn: React.FC<AnimatedWrapperProps> = ({ 
  children, 
  delay = 0, 
  duration = 0.5 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

export const ScaleIn: React.FC<AnimatedWrapperProps> = ({ 
  children, 
  delay = 0, 
  duration = 0.3 
}) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

export const SlideIn: React.FC<AnimatedWrapperProps & { direction?: 'left' | 'right' }> = ({ 
  children, 
  delay = 0, 
  duration = 0.5,
  direction = 'left'
}) => {
  const x = direction === 'left' ? -50 : 50;
  
  return (
    <motion.div
      initial={{ x, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay, duration, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};