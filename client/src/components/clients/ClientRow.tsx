import { useState } from 'react';
import type { ClientDto } from '@/types/client';

interface ClientRowProps {
    client: ClientDto;
    onEdit: () => void;
    onDelete: () => void;
    last: boolean;
}

function avatarUrl(name: string) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&rounded=true&bold=true&size=56`;
}

export default function ClientRow({ client, onEdit, onDelete, last }: ClientRowProps) {
    const [hovered, setHovered] = useState(false);

    const formatted = new Date(client.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
    });

    // Shared cell style — bottom border omitted on last row so it doesn't double with table border
    const cell: React.CSSProperties = {
        padding: '12px 16px',
        fontSize: 13,
        color: 'var(--text-primary)',
        borderBottom: last ? 'none' : '1px solid var(--border-default)',
        verticalAlign: 'middle',
        cursor: 'pointer',
    };
    const muted: React.CSSProperties = { ...cell, color: 'var(--text-secondary)' };

    return (
        <tr
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={onEdit}
            style={{ background: hovered ? 'var(--surface-hover)' : 'transparent', transition: 'background 0.12s ease' }}
        >
            {/* Client: avatar + name + optional subtitle */}
            <td style={cell}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img
                        src={avatarUrl(client.name)}
                        alt={client.name}
                        width={28}
                        height={28}
                        style={{ borderRadius: '50%', flexShrink: 0 }}
                    />
                    <div>
                        <div style={{ fontWeight: 500 }}>{client.name}</div>
                        {client.companyName && (
                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1 }}>
                                {client.companyName}
                            </div>
                        )}
                    </div>
                </div>
            </td>

            <td style={muted}>{client.companyName || '—'}</td>
            <td style={muted}>{client.email}</td>
            <td style={muted}>{client.phone || '—'}</td>
            <td style={muted}>{formatted}</td>

            {/* Actions: pencil + trash, visible only on hover */}
            <td style={{ ...cell, width: 64 }}>
                {/*
                  stopPropagation here: klikając ikonkę NIE chcemy wywołać onEdit z <tr>.
                  Bez tego klik trash → onDelete() + onEdit() jednocześnie.
                */}
                <div
                    onClick={e => e.stopPropagation()}
                    style={{ display: 'flex', gap: 4, opacity: hovered ? 1 : 0, transition: 'opacity 0.12s ease' }}
                >
                    <button
                        onClick={onEdit}
                        style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: 'var(--text-secondary)', borderRadius: 4 }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                    </button>
                    <button
                        onClick={onDelete}
                        style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: 'var(--status-error)', borderRadius: 4 }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4h6v2" />
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    );
}
