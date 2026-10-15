import { Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/table';
import { Button } from '../../components/button';
import { HandicapSetting } from '../../utils/interfaces';

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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[48px]">
              <input
                type="checkbox"
                aria-label="Select all handicap rules"
                checked={allSelected}
                onChange={onToggleAll}
                disabled={isLoading || rules.length === 0 || isSaving}
                className="h-4 w-4"
              />
            </TableHead>
            <TableHead>Average</TableHead>
            <TableHead>Men HDC</TableHead>
            <TableHead>Women HDC</TableHead>
            <TableHead className="w-[140px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
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
              <TableRow key={rule.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    aria-label={`Select handicap ${rule.average}`}
                    checked={selectedRuleIds.includes(rule.id)}
                    onChange={() => onToggleRule(rule.id)}
                    disabled={isSaving}
                    className="h-4 w-4"
                  />
                </TableCell>
                <TableCell className="font-medium">{rule.average}</TableCell>
                <TableCell>{rule.men_handicap}</TableCell>
                <TableCell>{rule.women_handicap ?? '—'}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isSaving}
                      onClick={() => onEdit(rule)}
                      aria-label={`Edit handicap ${rule.average}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
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
  );
}
