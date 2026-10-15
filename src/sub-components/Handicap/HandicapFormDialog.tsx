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
  menHandicap: string;
  onMenHandicapChange: (value: string) => void;
  womenHandicap: string;
  onWomenHandicapChange: (value: string) => void;
  isSaving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function HandicapFormDialog({
  open,
  onOpenChange,
  editingRule,
  average,
  onAverageChange,
  menHandicap,
  onMenHandicapChange,
  womenHandicap,
  onWomenHandicapChange,
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
            Enter the average and the separate handicap values for men and
            women.
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="men-handicap-value">Men's HDC</Label>
                <Input
                  id="men-handicap-value"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 40"
                  value={menHandicap}
                  onChange={(event) => onMenHandicapChange(event.target.value)}
                  required
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="women-handicap-value">Women's HDC</Label>
                <Input
                  id="women-handicap-value"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 50"
                  value={womenHandicap}
                  onChange={(event) =>
                    onWomenHandicapChange(event.target.value)
                  }
                  required
                  disabled={isSaving}
                />
              </div>
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
