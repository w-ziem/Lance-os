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
    const formatted = new Date(client.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
    });

    const border = last ? '' : 'border-b border-border-default';
    const cell = `px-4 py-3 text-[13px] text-text-primary align-middle cursor-pointer ${border}`;
    const muted = `px-4 py-3 text-[13px] text-text-secondary align-middle cursor-pointer ${border}`;

    return (
        // group — pozwala dzieciom reagować na hover rodzica przez group-hover:
        <tr onClick={onEdit} className="group hover:bg-surface-hover transition-colors">

            <td className={cell}>
                <div className="flex items-center gap-2.5">
                    <img
                        src={avatarUrl(client.name)}
                        alt={client.name}
                        width={28}
                        height={28}
                        className="rounded-full shrink-0"
                    />
                    <div>
                        <div className="font-medium">{client.name}</div>
                        {client.companyName && (
                            <div className="text-[11px] text-text-tertiary mt-px">{client.companyName}</div>
                        )}
                    </div>
                </div>
            </td>

            <td className={muted}>{client.companyName || '—'}</td>
            <td className={muted}>{client.email}</td>
            <td className={muted}>{client.phone || '—'}</td>
            <td className={muted}>{formatted}</td>

            <td className={`${border} px-4 py-3 w-16`}>
                {/* stopPropagation — klik ikonki nie bubbluje do onClick na <tr> */}
                <div
                    onClick={e => e.stopPropagation()}
                    className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <button
                        onClick={onEdit}
                        className="p-1 rounded bg-transparent border-none cursor-pointer text-text-secondary hover:text-text-primary"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-1 rounded bg-transparent border-none cursor-pointer text-status-error"
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
