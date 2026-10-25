import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/table';
import { HandicapSetting } from '../../utils/interfaces';
import { Button } from '../../components/button';
import {
  Pencil,
  Trash2
} from 'lucide-react';

interface HandicapTableProps {
  rules: HandicapSetting[];
  selectedRuleIds: Array<string | number>;
  isLoading: boolean;
  isSaving: boolean;
  onToggleRule: (id: string | number) => void;
  onToggleAll: () => void;
  onEdit: (rule: HandicapSetting) => void;
  onDelete: (rule: HandicapSetting) => void;
}

export function HandicapTable({
  rules,
  selectedRuleIds,
  isLoading,
  isSaving,
  onToggleRule,
  onToggleAll,
  onEdit,
  onDelete,
}: HandicapTableProps) {
  const allSelected =
    rules.length > 0 &&
    rules.every((rule) => selectedRuleIds.includes(rule.id));

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col">
      {/* Header is outside the scrolling viewport, so scrolling starts at row 1. */}
      <div className="shrink-0 overflow-x-hidden">
        <Table className="w-full table-fixed">
          <colgroup>
            <col className="w-[48px]" />
            <col />
            <col />
            <col />
            <col className="w-[132px]" />
          </colgroup>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-11 px-4 bg-background align-middle">
                <input
                  type="checkbox"
                  aria-label="Select all handicap rules"
                  checked={allSelected}
                  onChange={onToggleAll}
                  disabled={isLoading || rules.length === 0 || isSaving}
                  className="h-4 w-4 align-middle"
                />
              </TableHead>
              <TableHead className="h-11 bg-background px-4 text-center align-middle">
                Average
              </TableHead>
              <TableHead className="h-11 bg-background px-4 text-center align-middle">
                Men HDC
              </TableHead>
              <TableHead className="h-11 bg-background px-4 text-center align-middle">
                Women HDC
              </TableHead>
              <TableHead className="h-11 bg-background px-3 text-center align-middle">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      </div>

      {/* Only this area scrolls; the header remains fixed above it. */}
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
        <Table className="w-full table-fixed">
          <colgroup>
            <col className="w-[48px]" />
            <col />
            <col />
            <col />
            <col className="w-[132px]" />
          </colgroup>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground"
                >
                  Loading handicap settings...
                </TableCell>
              </TableRow>
            ) : rules.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground"
                >
                  No handicap rules configured yet.
                </TableCell>
              </TableRow>
            ) : (
              rules.map((rule) => (
                <TableRow key={rule.id} className="h-12">
                  <TableCell className="px-3 py-2 text-center align-middle">
                    <input
                      type="checkbox"
                      aria-label={`Select handicap ${rule.average}`}
                      checked={selectedRuleIds.includes(rule.id)}
                      onChange={() => onToggleRule(rule.id)}
                      disabled={isSaving}
                      className="h-4 w-4 align-middle"
                    />
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center align-middle font-medium tabular-nums">
                    {rule.average}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center align-middle tabular-nums">
                    {rule.men_handicap}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center align-middle tabular-nums">
                    {rule.women_handicap ?? '—'}
                  </TableCell>
                  <TableCell className="px-3 py-2 align-middle">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-9 p-0"
                        disabled={isSaving}
                        onClick={() => onEdit(rule)}
                        aria-label={`Edit handicap ${rule.average}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-9 p-0"
                        disabled={isSaving}
                        onClick={() => onDelete(rule)}
                        aria-label={`Delete handicap ${rule.average}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
