import type React from 'react';
import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/alert-dialog';

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  confirmMessage: React.ReactNode;
  confirmAction: () => void | Promise<void>;
  deletingLeague: boolean;
  setDeletingLeague: (value: boolean) => void;
}

export default function DeleteDialog({
  open,
  onOpenChange,
  confirmMessage,
  confirmAction,
  deletingLeague,
  setDeletingLeague,
}: DeleteDialogProps) {
  const handleDelete = async (event: React.MouseEvent) => {
    event.preventDefault();

    if (deletingLeague) return;

    setDeletingLeague(true);

    try {
      await confirmAction();
    } finally {
      setDeletingLeague(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="glass border-border/50">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete league?</AlertDialogTitle>

          <AlertDialogDescription>{confirmMessage}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deletingLeague}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            variant="destructive"
            disabled={deletingLeague}
            onClick={handleDelete}
          >
            {deletingLeague ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
