import type { ProjectDto } from '@/types/project';
import ProjectStatusBadge from './ProjectStatusBadge';
import ProgressBar from '@/components/common/ProgressBar';

interface ProjectCardProps {
    project: ProjectDto;
    clientName?: string;
    taskCount?: number;
    doneCount?: number;
    onClick: () => void;
}

const COLOR_BY_STATUS: Record<ProjectDto['status'], string> = {
    ACTIVE: '--accent',
    ON_HOLD: '--status-warning',
    COMPLETED: '--status-success',
    CANCELLED: '--border-strong',
};

function formatDeadline(iso?: string) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatBudget(value: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

export default function ProjectCard({ project, clientName, taskCount = 0, doneCount = 0, onClick }: ProjectCardProps) {
    const progress = taskCount > 0
        ? Math.round((doneCount / taskCount) * 100)
        : project.status === 'COMPLETED' ? 100 : 0;

    return (
        <div
            onClick={onClick}
            className="bg-(--surface) border border-(--border-default) rounded-[10px] px-4 pt-4 pb-3.5 cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-(--border-strong) hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-150"
        >
            <div className="flex justify-between items-start mb-1">
                <div className="font-display font-semibold text-[14px] text-(--text-primary) leading-[1.3]">
                    {project.name}
                </div>
                <ProjectStatusBadge status={project.status} />
            </div>

            <div className="text-[12px] text-(--text-tertiary) mb-3">{clientName ?? '—'}</div>

            <ProgressBar value={progress} colorVar={COLOR_BY_STATUS[project.status]} />

            <div className="flex justify-between mt-[7px]">
                <div className="text-[11px] text-(--text-tertiary)">
                    {taskCount > 0 ? `${doneCount}/${taskCount} tasks` : `${progress}%`}
                </div>
                <div className="flex items-center gap-2.5">
                    {project.budget != null && project.budget > 0 && (
                        <span className="text-[11px] font-medium text-(--status-success)">
                            {formatBudget(project.budget)}
                        </span>
                    )}
                    <div className="text-[11px] text-(--text-tertiary) flex items-center gap-1">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {formatDeadline(project.deadline)}
                    </div>
                </div>
            </div>
        </div>
    );
}
