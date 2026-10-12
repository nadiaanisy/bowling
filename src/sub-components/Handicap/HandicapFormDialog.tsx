import { FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/dialog';
import { Input } from '../../components/input';
import { Label } from '../../components/label';
import { Button } from '../../components/button';
import { HandicapSetting } from '../../utils/interfaces';

interface HandicapFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRule: HandicapSetting | null;
  average: string;
  onAverageChange: (value: string) => void;
  handicap: string;
  onHandicapChange: (value: string) => void;
  isSaving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function HandicapFormDialog({
  open,
  onOpenChange,
  editingRule,
  average,
  onAverageChange,
  handicap,
  onHandicapChange,
  isSaving,
  onSubmit,
}: HandicapFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onPointerDownOutside={(event) => event.preventDefault()}>
        <DialogHeader>
          <DialogTitle>
            {editingRule ? 'Edit Handicap' : 'Add Handicap'}
          </DialogTitle>
          <DialogDescription>
            Enter the average and the handicap value for this league.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="handicap-average">Average</Label>
              <Input
                id="handicap-average"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 180"
                value={average}
                onChange={(event) => onAverageChange(event.target.value)}
                required
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="handicap-value">Handicap</Label>
              <Input
                id="handicap-value"
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 20"
                value={handicap}
                onChange={(event) => onHandicapChange(event.target.value)}
                required
                disabled={isSaving}
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving
                ? 'Saving...'
                : editingRule
                  ? 'Save Changes'
                  : 'Add Handicap'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
