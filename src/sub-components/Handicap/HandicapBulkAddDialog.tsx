import { FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/dialog';
import { Label } from '../../components/label';
import { Button } from '../../components/button';

interface HandicapBulkAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  input: string;
  onInputChange: (value: string) => void;
  error: string;
  onErrorChange: (value: string) => void;
  isSaving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function HandicapBulkAddDialog({
  open,
  onOpenChange,
  input,
  onInputChange,
  error,
  onErrorChange,
  isSaving,
  onSubmit,
}: HandicapBulkAddDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onPointerDownOutside={(event) => event.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Bulk Add Handicap</DialogTitle>
          <DialogDescription>
            Paste one AVG and HDC pair per line. Comma, tab, or semicolon
            separators are supported.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="bulk-handicap-input">AVG, HDC</Label>
            <textarea
              id="bulk-handicap-input"
              className="min-h-[220px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={'100,80\n101,79\n102,78'}
              value={input}
              onChange={(event) => {
                onInputChange(event.target.value);
                onErrorChange('');
              }}
              spellCheck={false}
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              Example: 100,80 — 101,79 — 102,78
            </p>
            {error && <p className="text-sm text-destructive">{error}</p>}
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
              {isSaving ? 'Adding...' : 'Add All'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
