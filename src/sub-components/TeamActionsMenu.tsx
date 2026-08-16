import {
  useEffect,
  useRef
} from 'react';
import {
  ListX,
  MoreHorizontal,
  Trash2,
  UserPlus,
  Pencil
} from 'lucide-react';
import { Button } from '../components/button';

interface TeamActionsMenuProps {
  teamName: string;
  memberCount: number;
  deletingTeam: boolean;
  deletingPlayer: boolean;
  open: boolean;
  onToggle: () => void;
  onAddPlayer: () => void;
  onEditTeam: () => void;
  onBulkDelete: () => void;
  onDeleteTeam: () => void;
}

export function TeamActionsMenu({
  teamName,
  memberCount,
  deletingTeam,
  deletingPlayer,
  open,
  onToggle,
  onAddPlayer,
  onEditTeam,
  onBulkDelete,
  onDeleteTeam
}: TeamActionsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) onToggle();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open, onToggle]);

  return (
    <div ref={menuRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`More actions for ${teamName}`}
        onClick={onToggle}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
      {open && <div className="absolute right-0 top-10 z-20 w-48 rounded-md border bg-background p-1 shadow-lg">
        <button type="button" onClick={onAddPlayer} className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm hover:bg-muted">
          <UserPlus className="h-4 w-4" />
          Add player
        </button>
        <button type="button" onClick={onEditTeam} className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm hover:bg-muted">
          <Pencil className="h-4 w-4" />
          Edit team
        </button>
        <button type="button" onClick={onBulkDelete} disabled={memberCount === 0 || deletingPlayer} className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm hover:bg-muted disabled:pointer-events-none disabled:opacity-50">
          <ListX className="h-4 w-4" />
          Bulk delete
        </button>
        <div className="my-1 border-t" />
        <button type="button" onClick={onDeleteTeam} disabled={deletingTeam} className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-50">
          <Trash2 className="h-4 w-4" />
          Delete team
        </button>
      </div>}
    </div>
  );
}
