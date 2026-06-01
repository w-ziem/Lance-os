import { useDroppable } from '@dnd-kit/core';

interface DroppableSlotProps {
    dateIso: string;     // YYYY-MM-DD
    slotIndex: number;
    heightPx: number;
    showBorderTop?: boolean;
}

// One half-hour drop target inside a day column. Stacked vertically; tasks are
// positioned absolutely on top of them, so these stay visually empty unless hovered.
export default function DroppableSlot({ dateIso, slotIndex, heightPx, showBorderTop }: DroppableSlotProps) {
    const id = `slot::${dateIso}::${slotIndex}`;
    const { setNodeRef, isOver } = useDroppable({
        id,
        data: { type: 'slot', dateIso, slotIndex },
    });
    return (
        <div
            ref={setNodeRef}
            style={{ height: heightPx }}
            className={`${showBorderTop ? 'border-t border-(--bg-secondary)' : ''} ${
                isOver ? 'bg-(--accent-tint)' : ''
            }`}
        />
    );
}
