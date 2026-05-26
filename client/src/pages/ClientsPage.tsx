import { useState } from 'react';
import { useClientsQuery, useDeleteClient } from '@/hooks/useClient';
import type { ClientDto } from '@/types/client';
import SlideDrawer from '@/components/common/SlideDrawer';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import ClientForm from '@/components/clients/ClientForm';
import ClientRow from '@/components/clients/ClientRow';

export default function ClientsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientDto | null>(null);
  const [clientToDelete, setClientToDelete] = useState<ClientDto | null>(null);
  const [search, setSearch] = useState('');

  const { data: clients, isLoading, isError } = useClientsQuery();

  const deleteMutation = useDeleteClient();

  function openCreate() { setEditingClient(null); setDrawerOpen(true); }
  function openEdit(client: ClientDto) { setEditingClient(client); setDrawerOpen(true); }
  function closeDrawer() { setDrawerOpen(false); }


  const filtered = (clients ?? []).filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* ── Left: scrollable content area ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 25,
              color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.03em',
            }}>
              Clients
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '4px 0 0' }}>
              {filtered.length} total
            </p>
          </div>
          <button
            onClick={openCreate}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--accent)', color: '#fff', border: 'none',
              borderRadius: 8, padding: '9px 14px', fontSize: 13, fontWeight: 600,
              fontFamily: 'var(--font-body)', cursor: 'pointer',
              boxShadow: 'rgba(79,70,229,0.27) 0 2px 12px',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add client
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: 260, marginBottom: 20 }}>
          <svg
            width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }}
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search clients…"
            style={{
              width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 9, paddingBottom: 9,
              border: '1px solid var(--border-default)', borderRadius: 7, fontSize: 13,
              fontFamily: 'var(--font-body)', color: 'var(--text-primary)',
              background: 'var(--surface)', outline: 'none',
            }}
          />
        </div>

        {/* States */}
        {isLoading && (
          <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>Loading…</p>
        )}
        {isError && (
          <p style={{ color: 'var(--status-error)', fontSize: 13 }}>Failed to load clients.</p>
        )}

        {/* Table */}
        {!isLoading && !isError && (
          filtered.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)', fontSize: 13, marginTop: 40, textAlign: 'center' }}>
              {search ? 'No clients match your search.' : 'No clients yet. Add your first one.'}
            </p>
          ) : (
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 10,
              overflow: 'hidden',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)' }}>
                    {['Client', 'Company', 'Email', 'Phone', 'Created', ''].map(label => (
                      <th key={label} style={{
                        padding: '10px 16px', textAlign: 'left', fontSize: 11,
                        fontWeight: 600, color: 'var(--text-secondary)',
                        letterSpacing: '0.04em', textTransform: 'uppercase',
                        borderBottom: '1px solid var(--border-default)',
                      }}>
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
          if (clientToDelete) deleteMutation.mutate(clientToDelete.id);
          setClientToDelete(null);
        }}
      />

      {/* ── Right: slide drawer ── */}
      <SlideDrawer
        open={drawerOpen}
        title={editingClient ? 'Edit client' : 'Add client'}
        onClose={closeDrawer}
      >
        <ClientForm client={editingClient ?? undefined} onSuccess={closeDrawer} />
      </SlideDrawer>

    </div>
  );
}
