import {
  ChangeEvent,
  FormEvent
} from 'react';
import { Label } from '../../components/label';
import type { HandicapImportPreview } from '../../utils/interfaces';
import { Button } from '../../components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/dialog';

interface HandicapBulkAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  input: string;
  onInputChange: (value: string) => void;
  error: string;
  onErrorChange: (value: string) => void;
  isSaving: boolean;
  fileName: string;
  onFileSelect: (file: File) => void;
  preview: HandicapImportPreview;
  importDisabled: boolean;
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
  fileName,
  onFileSelect,
  preview,
  importDisabled,
  onSubmit,
}: HandicapBulkAddDialogProps) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onFileSelect(file);
    // Allow selecting the same file again after correcting it.
    event.target.value = '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-x-hidden overflow-y-auto rounded-md border sm:max-w-5xl top-[6.5%] md:top-[12%] left-[4.5%] md:left-[22%]"
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Bulk Add Handicap</DialogTitle>
          <DialogDescription>
            Paste data or upload a CSV, TSV, or TXT file. Each data row must
            contain AVG, Men&apos;s HDC, and Women&apos;s HDC. The entire import
            is blocked if any row is invalid.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bulk-handicap-file">
              Import file (optional, max 5 MB)
            </Label>
            <input
              id="bulk-handicap-file"
              type="file"
              accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain"
              onChange={handleFileChange}
              disabled={isSaving}
              className="cursor-pointer block w-full text-sm file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-2"
            />
            {fileName && (
              <p className="text-xs text-muted-foreground">
                Selected file: {fileName}
              </p>
            )}
          </div>

          <div className="space-y-2 pt-4">
            <Label htmlFor="bulk-handicap-input">
              AVG, Men&apos;s HDC, Women&apos;s HDC
            </Label>
            <textarea
              id="bulk-handicap-input"
              className="min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={'100,40,50\n101,39,49\n102,38,48'}
              value={input}
              onChange={(event) => {
                onInputChange(event.target.value);
                onErrorChange('');
              }}
              spellCheck={false}
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              Supported separators: comma, tab, or semicolon. An optional header
              row is allowed.
            </p>
          </div>

          {input.trim() && (
            <section className="space-y-2" aria-label="Import preview">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Import preview</h3>
                <div className="flex flex-wrap gap-3 text-xs">
                  <span>{preview.dataRowCount} data rows</span>
                  <span className="text-emerald-600">
                    {preview.validCount} valid
                  </span>
                  <span
                    className={
                      preview.invalidCount
                        ? 'text-destructive'
                        : 'text-muted-foreground'
                    }
                  >
                    {preview.invalidCount} invalid
                  </span>
                </div>
              </div>
              {preview.errors.map((message) => (
                <p key={message} className="text-sm text-destructive">
                  {message}
                </p>
              ))}
              <div className="max-h-64 overflow-auto rounded-md border">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-muted">
                    <tr>
                      <th className="px-3 py-2">Row</th>
                      <th className="px-3 py-2">AVG</th>
                      <th className="px-3 py-2">Men&apos;s HDC</th>
                      <th className="px-3 py-2">Women&apos;s HDC</th>
                      <th className="px-3 py-2">Validation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((row) => (
                      <tr key={row.rowNumber} className="border-t align-top">
                        <td className="px-3 py-2">{row.rowNumber}</td>
                        <td className="px-3 py-2">{row.averageText || '—'}</td>
                        <td className="px-3 py-2">
                          {row.menHandicapText || '—'}
                        </td>
                        <td className="px-3 py-2">
                          {row.womenHandicapText || '—'}
                        </td>
                        <td className="px-3 py-2">
                          {row.errors.length === 0 ? (
                            <span className="text-emerald-600">Valid</span>
                          ) : (
                            <ul className="list-disc space-y-1 pl-4 text-destructive">
                              {row.errors.map((rowError) => (
                                <li key={rowError}>{rowError}</li>
                              ))}
                            </ul>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || importDisabled}>
              {isSaving ? 'Importing...' : 'Import All'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
