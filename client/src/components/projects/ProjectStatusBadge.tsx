import StatusBadge from '@/components/common/StatusBadge';
import type { ProjectStatus } from '@/types/project';

const STATUS_LABEL: Record<ProjectStatus, string> = {
    ACTIVE:    'active',
    ON_HOLD:   'on hold',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
};

const STATUS_VARIANT: Record<ProjectStatus, 'success' | 'warning' | 'neutral' | 'error'> = {
    ACTIVE:    'success',
    ON_HOLD:   'warning',
    COMPLETED: 'neutral',
    CANCELLED: 'error',
};

export default function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
    return <StatusBadge label={STATUS_LABEL[status]} variant={STATUS_VARIANT[status]} />;
}
