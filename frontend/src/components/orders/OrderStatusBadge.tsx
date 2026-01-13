import { Badge, BadgeVariant } from '../ui/Badge';
import type { Order } from '../../services/orders.service';

export interface OrderStatusBadgeProps {
  status: Order['status'];
  className?: string;
}

const statusConfig: Record<Order['status'], { label: string; variant: BadgeVariant }> = {
  draft: {
    label: 'Draft',
    variant: 'default',
  },
  needs_review: {
    label: 'Needs review',
    variant: 'warning',
  },
  approved: {
    label: 'Approved',
    variant: 'success',
  },
  sent: {
    label: 'Sent',
    variant: 'info',
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'error',
  },
};

export function OrderStatusBadge({ status, className = '' }: OrderStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
