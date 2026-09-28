import {
  TableCell,
  TableRow,
} from '../../components/table';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
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
import { Button } from '../../components/button';
import type { MatchData } from '../../utils/interfaces';
import { handleDeleteMatch } from '../../utils/functions';

interface RowProps {
  match: MatchData;
  selected: boolean;
  onToggleSelect: (matchId: string | number) => void;
  deletingMatch: boolean;
  setDeletingMatch: (value: boolean) => void;
  retryTimetable: () => Promise<void>;
}

export function Row({
  match,
  selected,
  onToggleSelect,
  deletingMatch,
  setDeletingMatch,
  retryTimetable,
}: RowProps) {
  const [
    deleteDialogOpen,
    setDeleteDialogOpen,
  ] = useState(false);

  const handleDelete = async (
    event: React.MouseEvent
  ) => {
    event.preventDefault();

    await handleDeleteMatch(
      deletingMatch,
      setDeletingMatch,
      match.match_id,
      async () => {
        setDeleteDialogOpen(false);
        await retryTimetable();
      }
    );
  };

  return (
    <TableRow
      key={match.match_id}
    >
      {/* SELECT */}
      <TableCell className="w-10">
        <input
          type="checkbox"
          checked={selected}
          onChange={() =>
            onToggleSelect(
              match.match_id
            )
          }
          disabled={deletingMatch}
          aria-label={`Select match ${match.match_id}`}
        />
      </TableCell>

      {/* WEEK */}
      <TableCell>
        Week {match.week_number}
      </TableCell>

      {/* LANE */}
      <TableCell>
        {match.lane}
      </TableCell>

      {/* TEAM 1 */}
      <TableCell>
        {match.team1.name}
      </TableCell>

      {/* TEAM 2 */}
      <TableCell>
        {match.team2.name}
      </TableCell>

      {/* STATUS */}
      <TableCell>
        {match.status === 'completed' ? (
          <span className="text-green-600">
            Completed
          </span>
        ) : (
          <span className="text-muted-foreground">
            Pending
          </span>
        )}
      </TableCell>

      {/* ACTION */}
      <TableCell>
        <AlertDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            if (!deletingMatch) {
              setDeleteDialogOpen(
                open
              );
            }
          }}
        >
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={deletingMatch}
              onClick={() =>
                setDeleteDialogOpen(
                  true
                )
              }
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you absolutely sure?
              </AlertDialogTitle>

              <AlertDialogDescription>
                This action cannot be undone.
                This will permanently delete
                the match from the schedule.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={deletingMatch}
              >
                Cancel
              </AlertDialogCancel>

              <AlertDialogAction
                variant="destructive"
                disabled={deletingMatch}
                onClick={handleDelete}
              >
                {deletingMatch
                  ? 'Deleting...'
                  : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}