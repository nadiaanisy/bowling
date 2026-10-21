import { HandicapSetting } from '../../utils/interfaces';
import { Button } from '../../components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/dialog';

interface HandicapDeleteDialogProps {
  singleOpen: boolean;
  onSingleOpenChange: (open: boolean) => void;
  bulkOpen: boolean;
  onBulkOpenChange: (open: boolean) => void;
  ruleToDelete: HandicapSetting | null;
  selectedCount: number;
  isSaving: boolean;
  onConfirmSingle: () => void;
  onConfirmBulk: () => void;
}

export function HandicapDeleteDialog({
  singleOpen,
  onSingleOpenChange,
  bulkOpen,
  onBulkOpenChange,
  ruleToDelete,
  selectedCount,
  isSaving,
  onConfirmSingle,
  onConfirmBulk,
}: HandicapDeleteDialogProps) {
  return (
    <>
      <Dialog open={bulkOpen} onOpenChange={onBulkOpenChange}>
        <DialogContent
          className="top-[36%] md:top-[40%] left-[4.5%] md:left-[36%]"
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Delete Handicap Rules</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedCount} selected handicap
              rule
              {selectedCount === 1 ? '' : 's'}? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => onBulkOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="button" disabled={isSaving} onClick={onConfirmBulk}>
              {isSaving ? 'Deleting...' : 'Delete All'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={singleOpen} onOpenChange={onSingleOpenChange}>
        <DialogContent
          className="top-[36%] md:top-[40%] left-[4.5%] md:left-[36%]"
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Delete Handicap</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the handicap rule for average{' '}
              <strong>{ruleToDelete?.average}</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => onSingleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="button" disabled={isSaving} onClick={onConfirmSingle}>
              {isSaving ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
