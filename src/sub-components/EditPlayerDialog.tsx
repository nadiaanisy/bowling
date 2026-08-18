import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../components/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/select';
import { Pencil } from 'lucide-react';
import type { FormEvent } from 'react';
import { Input } from '../components/input';
import { Label } from '../components/label';
import { Button } from '../components/button';
import { Textarea } from '../components/textarea';
import type { LeagueMember } from '../utils/interfaces';

interface EditPlayerDialogProps {
  player: LeagueMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTriggerClick: () => void;
  editingPlayerName: string;
  setEditingPlayerName: (name: string) => void;
  editingPlayerStatus: string;
  setEditingPlayerStatus: (status: string) => void;
  editingPlayerType: 'regular' | 'substitute';
  setEditingPlayerType: (type: 'regular' | 'substitute') => void;
  editingPlayerNotes: string;
  setEditingPlayerNotes: (notes: string) => void;
  updatingPlayer: boolean;
  hasChanges: boolean;
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
}

export function EditPlayerDialog({
  player,
  open,
  onOpenChange,
  onTriggerClick,
  editingPlayerName,
  setEditingPlayerName,
  editingPlayerStatus,
  setEditingPlayerStatus,
  editingPlayerType,
  setEditingPlayerType,
  editingPlayerNotes,
  setEditingPlayerNotes,
  updatingPlayer,
  hasChanges,
  onSubmit,
  onCancel
}: EditPlayerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={`Edit ${player.name}`}
          onClick={onTriggerClick}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent onPointerDownOutside={(event) => event.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Edit player</DialogTitle>
          <DialogDescription>Update this player's name, status, or notes.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`edit-player-name-${player.id}`}>Name</Label>
            <Input
              id={`edit-player-name-${player.id}`}
              value={editingPlayerName}
              onChange={(event) => setEditingPlayerName(event.target.value)}
              disabled={updatingPlayer}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`edit-player-status-${player.id}`}>Status</Label>
            <Select
              value={editingPlayerStatus || 'active'}
              onValueChange={setEditingPlayerStatus}
              disabled={updatingPlayer}
            >
              <SelectTrigger id={`edit-player-status-${player.id}`}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`edit-player-type-${player.id}`}>Type</Label>
            <Select
              value={editingPlayerType}
              onValueChange={(value) => setEditingPlayerType(value as 'regular' | 'substitute')}
              disabled={updatingPlayer}
            >
              <SelectTrigger id={`edit-player-type-${player.id}`}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="substitute">Substitute</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`edit-player-notes-${player.id}`}>Notes</Label>
            <Textarea
              id={`edit-player-notes-${player.id}`}
              value={editingPlayerNotes}
              onChange={(event) => setEditingPlayerNotes(event.target.value)}
              disabled={updatingPlayer}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel} disabled={updatingPlayer}>
              Cancel
            </Button>
            <Button type="submit" disabled={updatingPlayer || !editingPlayerName.trim() || !hasChanges}>
              {updatingPlayer ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
