'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SortableDashboardSectionProps {
  id: string;
  children: React.ReactNode;
}

export default function SortableDashboardSection({ id, children }: SortableDashboardSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {/* Grip handle -- visible on hover */}
      <div
        {...attributes}
        {...listeners}
        style={{
          position: 'absolute',
          top: 8,
          left: -24,
          width: 20,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'grab',
          opacity: 0,
          transition: 'opacity 0.2s',
          zIndex: 5,
          color: '#D1D5DB',
          borderRadius: 4,
        }}
        className="group-hover/section:opacity-100"
      >
        <GripVertical size={14} />
      </div>
      <div className="group/section">
        {children}
      </div>
    </div>
  );
}
