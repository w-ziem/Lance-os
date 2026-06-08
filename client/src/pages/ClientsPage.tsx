import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useClientsQuery, useClientQuery, useDeleteClient } from '@/hooks/useClient';
import type { ClientDto } from '@/types/client';
import type { AxiosError } from 'axios';
import SlideDrawer from '@/components/common/SlideDrawer';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import ClientForm from '@/components/clients/ClientForm';
import ClientRow from '@/components/clients/ClientRow';
import VoiceIntakeButton from '@/components/ai/VoiceIntakeButton';

function fmt(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

function ClientProjectStats({ clientId }: { clientId: string }) {
  const { data } = useClientQuery(clientId);

  const active = data?.activeProjects ?? 0;
  const completed = data?.completedProjects ?? 0;
  const total = active + completed;

  return (
    <div>
      <div className="h-px bg-(--border-default) mb-4" />
      {total === 0 ? (
        <p className="text-[13px] text-(--text-tertiary)">No projects yet.</p>
      ) : (
        <div className="flex gap-4">
          <div>
            <span className="text-[20px] font-display font-bold text-(--text-primary)">{active}</span>
            <p className="text-[11px] text-(--text-tertiary) mt-0.5">active project{active !== 1 ? 's' : ''}</p>
          </div>
          <div className="w-px bg-(--border-default)" />
          <div>
            <span className="text-[20px] font-display font-bold text-(--text-primary)">{completed}</span>
            <p className="text-[11px] text-(--text-tertiary) mt-0.5">completed project{completed !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ClientRevenueStats({ clientId }: { clientId: string }) {
  const { data } = useClientQuery(clientId);

  const revenue = data?.revenue ?? 0;
  const projected = data?.projectedRevenue ?? 0;

  if (projected === 0) return null;

  return (
    <div>
      <div className="h-px bg-(--border-default) mb-4" />
      <div className="flex gap-4">
        <div>
          <span className="text-[20px] font-display font-bold text-(--status-success)">{fmt(revenue)}</span>
          <p className="text-[11px] text-(--text-tertiary) mt-0.5">earned (completed)</p>
        </div>
        <div className="w-px bg-(--border-default)" />
        <div>
          <span className="text-[20px] font-display font-bold text-(--text-primary)">{fmt(projected)}</span>
          <p className="text-[11px] text-(--text-tertiary) mt-0.5">pipeline (all active)</p>
        </div>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(
    () => !!(location.state as { openCreate?: boolean } | null)?.openCreate
  );
  const [editingClient, setEditingClient] = useState<ClientDto | null>(null);
  const [clientToDelete, setClientToDelete] = useState<ClientDto | null>(null);
  const [search, setSearch] = useState('');

  const { data: clients, isLoading, isError } = useClientsQuery();
  const deleteMutation = useDeleteClient();

  // Clear router state so a refresh doesn't re-open the drawer.
  useEffect(() => {
    if ((location.state as { openCreate?: boolean } | null)?.openCreate) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  function openCreate() { setEditingClient(null); setDrawerOpen(true); }
  function openEdit(client: ClientDto) { setEditingClient(client); setDrawerOpen(true); }
  function closeDrawer() { setDrawerOpen(false); }

  const filtered = (clients ?? []).filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Left: scrollable content ── */}
      <div className="flex-1 overflow-y-auto px-9 py-8">

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="font-display font-bold text-[25px] text-(--text-primary) m-0 tracking-[-0.03em]">
              Clients
            </h1>
            <p className="text-[12px] text-(--text-tertiary) mt-1">
              {filtered.length} total
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <VoiceIntakeButton />
            <button
              onClick={openCreate}
              className="btn-accent flex items-center gap-1.5 bg-(--accent) text-white border-none rounded-lg px-3.5 py-[9px] text-[13px] font-semibold font-body cursor-pointer shadow-[rgba(79,70,229,0.27)_0_2px_12px]"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add client
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-[260px] mb-5">
          <svg
            width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--text-tertiary) pointer-events-none"
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search clients…"
            className="w-full pl-8 pr-3 py-[9px] border border-(--border-default) rounded-[7px] text-[13px] font-body text-(--text-primary) bg-(--surface) outline-none"
          />
        </div>

        {/* States */}
        {isLoading && <p className="text-[13px] text-(--text-tertiary)">Loading…</p>}
        {isError && <p className="text-[13px] text-(--status-error)">Failed to load clients.</p>}

        {/* Table */}
        {!isLoading && !isError && (
          filtered.length === 0 ? (
            <p className="text-[13px] text-(--text-tertiary) mt-10 text-center">
              {search ? 'No clients match your search.' : 'No clients yet. Add your first one.'}
            </p>
          ) : (
            <div className="bg-(--surface) border border-(--border-default) rounded-[10px] overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-(--bg-secondary)">
                    {['Client', 'Company', 'Email', 'Phone', 'Created', ''].map(label => (
                      <th key={label} className="px-4 py-[10px] text-left text-[11px] font-semibold text-(--text-secondary) tracking-[0.04em] uppercase border-b border-(--border-default)">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((client, i) => (
                    <ClientRow
                      key={client.id}
                      client={client}
                      onEdit={() => openEdit(client)}
                      onDelete={() => setClientToDelete(client)}
                      last={i === filtered.length - 1}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      <ConfirmDialog
        open={clientToDelete !== null}
        title="Delete client"
        message={`Are you sure you want to delete ${clientToDelete?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        onCancel={() => setClientToDelete(null)}
        onConfirm={() => {
          if (!clientToDelete) return;
          const target = clientToDelete;
          setClientToDelete(null);
          deleteMutation.mutate(target.id, {
            onError: (err) => {
              const status = (err as AxiosError).response?.status;
              if (status === 409) {
                toast.error(`Cannot delete ${target.name} — they still have projects assigned. Remove the projects first.`);
              } else {
                toast.error('Failed to delete client. Please try again.');
              }
            },
          });
        }}
      />

      {/* ── Right: slide drawer ── */}
      <SlideDrawer
        open={drawerOpen}
        title={editingClient ? 'Edit client' : 'Add client'}
        onClose={closeDrawer}
      >
        <ClientForm client={editingClient ?? undefined} onSuccess={closeDrawer} />
        {editingClient && <ClientProjectStats clientId={editingClient.id} />}
        {editingClient && <ClientRevenueStats clientId={editingClient.id} />}
      </SlideDrawer>

    </div>
  );
}
