import { Input } from '../../components/input';
import { Label } from '../../components/label';
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

interface BulkEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rules: HandicapSetting[];
  menValue: string;
  onMenValueChange: (value: string) => void;
  womenValue: string;
  onWomenValueChange: (value: string) => void;
  error: string;
  onErrorChange: (value: string) => void;
  isSaving: boolean;
  onConfirm: () => void;
}

/** Previews one field-level change across selected rules before applying it. */
export function BulkEditDialog({
  open,
  onOpenChange,
  rules,
  menValue,
  onMenValueChange,
  womenValue,
  onWomenValueChange,
  error,
  onErrorChange,
  isSaving,
  onConfirm,
}: BulkEditDialogProps) {
  const hasMenValue = menValue.trim() !== '';
  const hasWomenValue = womenValue.trim() !== '';
  const validMenValue = !hasMenValue || /^\d+$/.test(menValue.trim());
  const validWomenValue = !hasWomenValue || /^\d+$/.test(womenValue.trim());
  const validValue =
    (hasMenValue || hasWomenValue) && validMenValue && validWomenValue;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[65vh] overflow-x-hidden overflow-y-auto rounded-md border sm:max-w-5xl top-[6.5%] md:top-[20%] left-[4.5%] md:left-[22%]"
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Bulk Edit Handicap Rules</DialogTitle>
          <DialogDescription>
            Preview the change to {rules.length} selected rule
            {rules.length === 1 ? '' : 's'}. Nothing is saved until you confirm
            below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bulk-edit-men-value">Men's handicap</Label>
              <Input
                id="bulk-edit-men-value"
                type="number"
                min="0"
                step="1"
                value={menValue}
                onChange={(event) => {
                  onMenValueChange(event.target.value);
                  onErrorChange('');
                }}
                disabled={isSaving}
                placeholder="Leave blank to keep unchanged"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulk-edit-women-value">Women's handicap</Label>
              <Input
                id="bulk-edit-women-value"
                type="number"
                min="0"
                step="1"
                value={womenValue}
                onChange={(event) => {
                  onWomenValueChange(event.target.value);
                  onErrorChange('');
                }}
                disabled={isSaving}
                placeholder="Leave blank to keep unchanged"
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter one or both values. Any field left blank will remain
            unchanged.
          </p>

          <div className="overflow-x-auto rounded-md border">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="sticky top-0 bg-muted">
                <tr>
                  <th className="px-3 py-2">Average</th>
                  <th className="px-3 py-2">Field</th>
                  <th className="px-3 py-2">Current value</th>
                  <th className="px-3 py-2">Proposed value</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id} className="border-t">
                    <td className="px-3 py-2">{rule.average}</td>
                    <td className="px-3 py-2">Men's / Women's</td>
                    <td className="px-3 py-2">
                      {rule.men_handicap ?? '—'} / {rule.women_handicap ?? '—'}
                    </td>
                    <td className="px-3 py-2 font-medium">
                      {validValue
                        ? `${hasMenValue ? Number(menValue) : (rule.men_handicap ?? '—')} / ${hasWomenValue ? Number(womenValue) : (rule.women_handicap ?? '—')}`
                        : 'Enter valid whole number(s)'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSaving || rules.length === 0 || !validValue}
            onClick={onConfirm}
          >
            {isSaving
              ? 'Applying changes…'
              : `Apply changes to ${rules.length} rules`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
