import type { ProjectDto } from '@/types/project';
import ProjectStatusBadge from './ProjectStatusBadge';
import ProgressBar from '@/components/common/ProgressBar';

interface ProjectCardProps {
    project: ProjectDto;
    clientName?: string;
    onClick: () => void;
}

const COLOR_BY_STATUS: Record<ProjectDto['status'], string> = {
    ACTIVE:    '--accent',
    ON_HOLD:   '--status-warning',
    COMPLETED: '--status-success',
    CANCELLED: '--border-strong',
};

function formatDeadline(iso?: string) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function ProjectCard({ project, clientName, onClick }: ProjectCardProps) {
    // Placeholder progress until we have per-task aggregation — keeps the layout honest.
    const progress = project.status === 'COMPLETED' ? 100 : 0;

    return (
        <div
            onClick={onClick}
            className="bg-surface border border-border-default rounded-[10px] px-4 pt-4 pb-3.5 cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-border-strong hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-150"
        >
            <div className="flex justify-between items-start mb-1">
                <div className="font-display font-semibold text-[14px] text-text-primary leading-[1.3]">
                    {project.name}
                </div>
                <ProjectStatusBadge status={project.status} />
            </div>

            <div className="text-[12px] text-text-tertiary mb-3">{clientName ?? '—'}</div>

            <ProgressBar value={progress} colorVar={COLOR_BY_STATUS[project.status]} />

            <div className="flex justify-between mt-[7px]">
                <div className="text-[11px] text-text-tertiary">{progress}%</div>
                <div className="text-[11px] text-text-tertiary flex items-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {formatDeadline(project.deadline)}
                </div>
            </div>
        </div>
    );
}
