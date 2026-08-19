import { useMemo } from 'react';
import { useDashboardSummaryQuery } from '@/hooks/useDashboard';
import { useScheduleViewQuery } from '@/hooks/useSchedule';
import { useProjectsQuery } from '@/hooks/useProject';
import StatCard from '@/components/dashboard/StatCard';
import TodaysSchedule from '@/components/dashboard/TodaysSchedule';
import UnplannedTasks from '@/components/dashboard/UnplannedTasks';
import QuickActions from '@/components/dashboard/QuickActions';

// Computed once at module level — same day for the lifetime of this page mount
function getTodayRange() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { startDate: start.toISOString(), endDate: end.toISOString() };
}

const todayRange = getTodayRange();

const TODAY_LABEL = new Intl.DateTimeFormat('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
}).format(new Date());

function formatRevenue(value: number): string {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}m`;
    if (value >= 1_000)     return `$${(value / 1_000).toFixed(1)}k`;
    return `$${Math.round(value)}`;
}

export default function DashboardPage() {
    const { data: summary }           = useDashboardSummaryQuery();
    const { data: schedule }          = useScheduleViewQuery(todayRange);
    const { data: projects = [] }     = useProjectsQuery();

    const projectNameById = useMemo(
        () => Object.fromEntries(projects.map(p => [p.id, p.name])),
        [projects]
    );

    const stats = [
        {
            label: 'Revenue',
            value: summary ? formatRevenue(summary.revenue) : '—',
            sub:   summary
                ? `${summary.activeProjects} active project${summary.activeProjects !== 1 ? 's' : ''}`
                : undefined,
            accentVar: '--status-success',
        },
        {
            label: 'Active projects',
            value: summary?.activeProjects?.toString() ?? '—',
            sub:   summary ? `${summary.completedProjects} completed` : undefined,
            accentVar: '--accent',
        },
        {
            label: 'Tasks due today',
            value: summary?.tasksDueToday?.toString() ?? '—',
            sub:   summary ? `${summary.highPriorityDueToday} high priority` : undefined,
            accentVar: '--status-warning',
        },
        {
            label: 'Clients',
            value: summary?.clientCount?.toString() ?? '—',
            sub:   undefined,
            accentVar: '--agent',
        },
    ];

    return (
        <div className="flex-1 overflow-y-auto px-9 py-8 fade-up">
            {/* Header */}
            <div className="mb-[26px]">
                <h1 className="font-display font-bold text-[25px] text-(--text-primary) m-0 tracking-[-0.03em]">
                    Dashboard
                </h1>
                <p className="text-[12px] text-(--text-tertiary) mt-1 uppercase tracking-[0.04em]">
                    {TODAY_LABEL}
                </p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-4 gap-3 mb-6">
                {stats.map(s => (
                    <StatCard
                        key={s.label}
                        label={s.label}
                        value={s.value}
                        sub={s.sub}
                        accentVar={s.accentVar}
                    />
                ))}
            </div>

            {/* Main 2-col grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <TodaysSchedule tasks={schedule?.scheduled ?? []} />
                <UnplannedTasks
                    tasks={schedule?.unscheduled ?? []}
                    projectNameById={projectNameById}
                />
            </div>

            {/* Quick actions */}
            <QuickActions />
        </div>
    );
}
