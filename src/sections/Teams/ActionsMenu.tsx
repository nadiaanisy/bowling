import {
  useEffect,
  useRef
} from 'react';
import { Button } from '../../components/button';
import {
  Archive,
  MoreVertical,
  Trash2,
  UserPlus,
  Pencil
} from 'lucide-react';

interface ActionsMenuProps {
  teamName: string;
  memberCount: number;
  deletingTeam: boolean;
  deletingPlayer: boolean;
  open: boolean;
  onToggle: () => void;
  onAddPlayer: () => void;
  onEditTeam: () => void;
  onDeleteTeam: () => void;
  onArchiveTeam: () => void;
  archivingTeam: boolean;
}

export function ActionsMenu({
  teamName,
  memberCount,
  deletingTeam,
  deletingPlayer,
  open,
  onToggle,
  onAddPlayer,
  onEditTeam,
  onDeleteTeam,
  onArchiveTeam,
  archivingTeam,
}: ActionsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const isBlindTeam = teamName.trim().toLowerCase() === 'blind';

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        onToggle();
      }
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
        <MoreVertical className="h-4 w-4" />
      </Button>

      {open && (
        <div className="absolute right-0 top-10 z-20 w-52 rounded-md border border-slate-700 bg-[#11131f] p-1 text-slate-100 shadow-xl">
          <button
            type="button"
            onClick={onAddPlayer}
            disabled={isBlindTeam}
            title={
              isBlindTeam
                ? 'BLIND is a scoring placeholder and cannot have team members.'
                : undefined
            }
            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm hover:bg-violet-950 disabled:pointer-events-none disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            Add player
          </button>

          <button
            type="button"
            onClick={onEditTeam}
            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm hover:bg-violet-950"
          >
            <Pencil className="h-4 w-4" />
            Edit team
          </button>

          <button
            type="button"
            onClick={onArchiveTeam}
            disabled={archivingTeam || deletingTeam}
            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-amber-300 hover:bg-amber-950/40 disabled:pointer-events-none disabled:opacity-50"
          >
            <Archive className="h-4 w-4" />
            {archivingTeam ? 'Archiving…' : 'Archive team'}
          </button>

          <div className="my-1 border-t border-slate-700" />

          <button
            type="button"
            onClick={onDeleteTeam}
            disabled={deletingTeam || archivingTeam}
            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-red-400 hover:bg-red-950/40 disabled:pointer-events-none disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete team
          </button>
        </div>
      )}
    </div>
  );
}
