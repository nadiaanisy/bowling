import { UseHook } from '../../utils/hooks';
import { Input } from '../../components/input';
import { Label } from '../../components/label';
import {
TableCell,
TableRow
} from '../../components/table';
import { updateMatchSessionDate } from '../../utils/api/update';
import type { MatchData } from '../../utils/interfaces';
import { Button } from '../../components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/dialog';
import { handleDeleteMatch } from '../../functions/timetable';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../components/alert-dialog';
import { toast } from 'sonner';
import {
Pencil,
Trash2
} from 'lucide-react';

interface RowProps {
  leagueId: string | null;
  match: MatchData;
  selected: boolean;
  onToggleSelect: (matchId: string | number) => void;
  deletingMatch: boolean;
  setDeletingMatch: (value: boolean) => void;
  retryTimetable: () => Promise<void>;
}

export function Row({
  leagueId,
  match,
  selected,
  onToggleSelect,
  deletingMatch,
  setDeletingMatch,
  retryTimetable,
}: RowProps) {
  const {
    deleteDialogMatchId,
    setDeleteDialogMatchId,
    editingMatchId,
    setEditingMatchId,
    editedSessionDate,
    setEditedSessionDate,
    savingSessionDate,
    setSavingSessionDate,
  } = UseHook();
  const deleteDialogOpen =
    String(deleteDialogMatchId) === String(match.match_id);
  const editDateDialogOpen = String(editingMatchId) === String(match.match_id);

  const handleSaveDate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!leagueId || savingSessionDate) return;
    setSavingSessionDate(true);
    try {
      const saved = await updateMatchSessionDate(
        match.match_id,
        leagueId,
        editedSessionDate,
      );
      if (!saved) return;
      toast.success('Session date updated.');
      setEditingMatchId(null);
      await retryTimetable();
    } finally {
      setSavingSessionDate(false);
    }
  };

  const handleDelete = async (event: React.MouseEvent) => {
    event.preventDefault();

    await handleDeleteMatch(
      deletingMatch,
      setDeletingMatch,
      match.match_id,
      async () => {
        setDeleteDialogMatchId(null);
        await retryTimetable();
      },
    );
  };

  return (
    <TableRow key={match.match_id}>
      {/* SELECT */}
      <TableCell className="w-10">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(match.match_id)}
          disabled={deletingMatch}
          aria-label={`Select match ${match.match_id}`}
        />
      </TableCell>

      {/* WEEK */}
      <TableCell>Week {match.week_number}</TableCell>

      {/* SESSION DATE */}
      <TableCell>{match.scheduled_date ?? '—'}</TableCell>

      {/* BOWLING ARRANGEMENT */}
      <TableCell>
        {match.schedule_type === 'pre_bowl'
          ? 'Pre-bowl'
          : match.schedule_type === 'post_bowl'
            ? 'Post-bowl'
            : 'Regular'}
      </TableCell>

      {/* LANE */}
      <TableCell>{match.lane}</TableCell>

      {/* TEAM 1 */}
      <TableCell>{match.team1.name}</TableCell>

      {/* TEAM 2 */}
      <TableCell>{match.team2.name}</TableCell>

      {/* STATUS */}
      <TableCell>
        {match.status === 'completed' ? (
          <span className="text-green-600">Completed</span>
        ) : (
          <span className="text-muted-foreground">Pending</span>
        )}
      </TableCell>

      {/* ACTION */}
      <TableCell>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Edit date for week ${match.week_number}`}
          onClick={() => {
            setEditedSessionDate(match.scheduled_date ?? '');
            setEditingMatchId(match.match_id);
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <AlertDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            if (!deletingMatch) {
              setDeleteDialogMatchId(open ? match.match_id : null);
            }
          }}
        >
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={deletingMatch}
              onClick={() => setDeleteDialogMatchId(match.match_id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>

              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                match from the schedule.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={deletingMatch}>
                Cancel
              </AlertDialogCancel>

              <AlertDialogAction
                variant="destructive"
                disabled={deletingMatch}
                onClick={handleDelete}
              >
                {deletingMatch ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Dialog
          open={editDateDialogOpen}
          onOpenChange={(open) =>
            !savingSessionDate &&
            setEditingMatchId(open ? match.match_id : null)
          }
        >
          <DialogContent>
            <form
              onSubmit={(event) => void handleSaveDate(event)}
              className="space-y-4"
            >
              <DialogHeader>
                <DialogTitle>Change session date</DialogTitle>
                <DialogDescription>
                  Adjust this match for a public holiday, event, or league
                  change.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor={`match-date-${match.match_id}`}>
                  Session date
                </Label>
                <Input
                  id={`match-date-${match.match_id}`}
                  type="date"
                  value={editedSessionDate}
                  onChange={(event) => setEditedSessionDate(event.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingMatchId(null)}
                  disabled={savingSessionDate}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingSessionDate || !editedSessionDate}
                >
                  {savingSessionDate ? 'Saving…' : 'Save Date'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  );
}
