import { Badge, BadgeVariant } from '../ui/Badge';

export type ConfidenceLevel = 'high' | 'moderate' | 'needs_review';

export interface ConfidenceIndicatorProps {
  level: ConfidenceLevel;
  className?: string;
}

const confidenceConfig: Record<ConfidenceLevel, { label: string; variant: BadgeVariant }> = {
  high: {
    label: 'High confidence',
    variant: 'success',
  },
  moderate: {
    label: 'Moderate confidence',
    variant: 'info',
  },
  needs_review: {
    label: 'Needs review',
    variant: 'warning',
  },
};

export function ConfidenceIndicator({ level, className = '' }: ConfidenceIndicatorProps) {
  const config = confidenceConfig[level];

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
