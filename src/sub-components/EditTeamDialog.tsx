import type { FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../components/dialog';
import { Input } from '../components/input';
import { Label } from '../components/label';
import { Button } from '../components/button';
import { Textarea } from '../components/textarea';

interface EditTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTeamName: string;
  setEditingTeamName: (name: string) => void;
  editingTeamNotes: string;
  setEditingTeamNotes: (notes: string) => void;
  updatingTeam: boolean;
  hasChanges: boolean;
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
}

export function EditTeamDialog({
  open,
  onOpenChange,
  editingTeamName,
  setEditingTeamName,
  editingTeamNotes,
  setEditingTeamNotes,
  updatingTeam,
  hasChanges,
  onSubmit,
  onCancel
}: EditTeamDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onPointerDownOutside={(event) => event.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Edit team</DialogTitle>
          <DialogDescription>Update the team name for this league.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="edit-team-name">Team name</Label>
            <Input
              id="edit-team-name"
              value={editingTeamName}
              onChange={(event) => setEditingTeamName(event.target.value)}
              disabled={updatingTeam}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-team-notes">Notes</Label>
            <Textarea
              id="edit-team-notes"
              value={editingTeamNotes}
              onChange={(event) => setEditingTeamNotes(event.target.value)}
              disabled={updatingTeam}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel} disabled={updatingTeam}>
              Cancel
            </Button>
            <Button type="submit" disabled={updatingTeam || !editingTeamName.trim() || !hasChanges}>
              {updatingTeam ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
