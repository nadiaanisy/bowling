import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '../components/alert-dialog';
import type { ReactNode } from 'react';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingDeleteType: 'team' | 'teams' | 'player' | 'players' | null;
  confirmMessage: ReactNode;
  isDeleting: boolean;
  onConfirm: () => void;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  pendingDeleteType,
  confirmMessage,
  isDeleting,
  onConfirm
}: ConfirmDeleteDialogProps) {
  const title = pendingDeleteType === 'team'
    ? 'Delete team?'
    : pendingDeleteType === 'teams'
    ? 'Delete selected teams?'
    : pendingDeleteType === 'players'
    ? 'Delete selected players?'
    : pendingDeleteType === 'player'
    ? 'Delete player?'
    : 'Confirm deletion';

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && isDeleting) return;
        onOpenChange(nextOpen);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{confirmMessage}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isDeleting}
            onClick={(event) => {
              event.preventDefault();
              if (isDeleting) return;
              onConfirm();
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
