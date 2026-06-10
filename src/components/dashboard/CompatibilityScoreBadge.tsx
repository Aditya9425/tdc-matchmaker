import { motion } from 'framer-motion';

interface CompatibilityScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function CompatibilityScoreBadge({ score, size = 'md', showLabel = true }: CompatibilityScoreBadgeProps) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  const sizeConfig = {
    sm: { container: 'w-10 h-10', text: 'text-xs', label: 'text-[8px]' },
    md: { container: 'w-14 h-14', text: 'text-base', label: 'text-[9px]' },
    lg: { container: 'w-20 h-20', text: 'text-xl', label: 'text-[10px]' },
  };

  const getColor = () => {
    if (clampedScore >= 80) return { ring: 'border-emerald-400', text: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (clampedScore >= 60) return { ring: 'border-amber-400', text: 'text-amber-600', bg: 'bg-amber-50' };
    return { ring: 'border-red-400', text: 'text-red-600', bg: 'bg-red-50' };
  };

  const colors = getColor();
  const cfg = sizeConfig[size];

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`${cfg.container} ${colors.bg} rounded-full border-2 ${colors.ring} flex flex-col items-center justify-center shadow-sm shrink-0`}
    >
      <span className={`${cfg.text} font-extrabold ${colors.text} leading-none`}>{clampedScore}</span>
      {showLabel && <span className={`${cfg.label} font-bold ${colors.text} uppercase tracking-wider leading-none mt-0.5`}>Match</span>}
    </motion.div>
  );
}
