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
  // Handle legacy 'needs_review' status by mapping it to 'draft'
  // Type assertion needed because status might come from API with legacy value
  const statusString = status as string;
  const normalizedStatus = (statusString === 'needs_review' ? 'draft' : status) as Order['status'];
  const config = statusConfig[normalizedStatus];

  // Fallback for unknown statuses
  if (!config) {
    console.warn(`Unknown order status: ${status}`);
    return (
      <Badge variant="default" className={className}>
        {status}
      </Badge>
    );
  }

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
