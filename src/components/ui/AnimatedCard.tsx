import React from 'react'
import { motion } from 'framer-motion'

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  animate?: boolean
  delay?: number
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  animate = true,
  delay = 0,
  padding = 'lg',
}) => {
  const baseClasses = `
    bg-white dark:bg-slate-900
    border border-slate-200 dark:border-slate-800
    rounded-xl
    transition-colors duration-200
    ${paddingClasses[padding]}
  `

  if (!animate) {
    return <div className={`${baseClasses} ${className}`}>{children}</div>
  }

  return (
    <motion.div
      className={`${baseClasses} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {children}
    </motion.div>
  )
}
