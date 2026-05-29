import { useMemo, useState } from 'react';
import { useProjectsQuery, useDeleteProject } from '@/hooks/useProject';
import { useClientsQuery } from '@/hooks/useClient';
import type { ProjectDto, ProjectStatus } from '@/types/project';
import SlideDrawer from '@/components/common/SlideDrawer';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import ProjectCard from '@/components/projects/ProjectCard';
import ProjectForm from '@/components/projects/ProjectForm';

type Filter = 'ALL' | ProjectStatus;
const FILTERS: { value: Filter; label: string }[] = [
    { value: 'ALL',       label: 'All' },
    { value: 'ACTIVE',    label: 'active' },
    { value: 'ON_HOLD',   label: 'on hold' },
    { value: 'COMPLETED', label: 'completed' },
    { value: 'CANCELLED', label: 'cancelled' },
];

export default function ProjectsPage() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editing, setEditing] = useState<ProjectDto | null>(null);
    const [toDelete, setToDelete] = useState<ProjectDto | null>(null);
    const [filter, setFilter] = useState<Filter>('ALL');

    const { data: projects, isLoading, isError } = useProjectsQuery();
    const { data: clients = [] } = useClientsQuery();
    const deleteMutation = useDeleteProject();

    const clientNameById = useMemo(
        () => Object.fromEntries(clients.map(c => [c.id, c.name])),
        [clients],
    );

    function openCreate() { setEditing(null); setDrawerOpen(true); }
    function openEdit(project: ProjectDto) { setEditing(project); setDrawerOpen(true); }
    function closeDrawer() { setDrawerOpen(false); }

    const filtered = (projects ?? []).filter(p => filter === 'ALL' || p.status === filter);

    return (
        <div className="flex h-full overflow-hidden">

            <div className="flex-1 overflow-y-auto px-9 py-8">

                <div className="flex justify-between items-start mb-[22px]">
                    <div>
                        <h1 className="font-display font-bold text-[25px] text-(--text-primary) m-0 tracking-[-0.03em]">Projects</h1>
                        <p className="text-[12px] text-(--text-tertiary) mt-1">{filtered.length} projects</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-1.5 bg-[var(--accent)] text-white border-none rounded-lg px-3.5 py-[9px] text-[13px] font-semibold font-body cursor-pointer shadow-[rgba(79,70,229,0.27)_0_2px_12px]"
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        New project
                    </button>
                </div>

                <div className="flex gap-1.5 mb-5 flex-wrap">
                    {FILTERS.map(f => {
                        const active = filter === f.value;
                        return (
                            <button
                                key={f.value}
                                onClick={() => setFilter(f.value)}
                                className={`px-3.5 py-[5px] rounded-full text-[12px] font-medium font-body cursor-pointer border ${
                                    active
                                        ? 'border-[var(--accent)] bg-[var(--accent-tint)] text-[var(--accent)]'
                                        : 'border-(--border-default) bg-(--surface) text-(--text-secondary)'
                                }`}
                            >
                                {f.label}
                            </button>
                        );
                    })}
                </div>

                {isLoading && <p className="text-[13px] text-(--text-tertiary)">Loading…</p>}
                {isError && <p className="text-[13px] text-(--status-error)">Failed to load projects.</p>}

                {!isLoading && !isError && (
                    filtered.length === 0 ? (
                        <p className="text-[13px] text-(--text-tertiary) mt-10 text-center">
                            {filter === 'ALL' ? 'No projects yet. Create your first one.' : 'No projects in this status.'}
                        </p>
                    ) : (
                        <div className="grid grid-cols-3 gap-3.5">
                            {filtered.map(p => (
                                <div key={p.id} className="relative group">
                                    <ProjectCard
                                        project={p}
                                        clientName={clientNameById[p.clientId]}
                                        onClick={() => openEdit(p)}
                                    />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setToDelete(p); }}
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-transparent border-none cursor-pointer text-(--status-error)"
                                        aria-label="Delete project"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6l-1 14H6L5 6" />
                                            <path d="M10 11v6M14 11v6" />
                                            <path d="M9 6V4h6v2" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>

            <ConfirmDialog
                open={toDelete !== null}
                title="Delete project"
                message={`Delete "${toDelete?.name}"? Tasks under this project will be deleted too.`}
                confirmLabel="Delete"
                onCancel={() => setToDelete(null)}
                onConfirm={() => {
                    if (toDelete) deleteMutation.mutate(toDelete.id);
                    setToDelete(null);
                }}
            />

            <SlideDrawer
                open={drawerOpen}
                title={editing ? 'Edit project' : 'New project'}
                onClose={closeDrawer}
            >
                <ProjectForm project={editing ?? undefined} onSuccess={closeDrawer} />
            </SlideDrawer>
        </div>
    );
}
