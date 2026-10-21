import { HandicapTable } from './HandicapTable';
import { HandicapFormDialog } from './HandicapFormDialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/card';
import { Input } from '../../components/input';
import { Label } from '../../components/label';
import { HandicapDeleteDialog } from './HandicapDeleteDialog';
import { Button } from '../../components/button';
import { HandicapBulkAddDialog } from './HandicapBulkAddDialog';
import { useHandicap } from '../../functions/handicap';
import {
  Plus,
  Save,
  Trash2,
  Upload
} from 'lucide-react';

interface HandicapProps {
  leagueId: string | number | null;
}

export default function Handicap({ leagueId }: HandicapProps) {
  const handicap = useHandicap(leagueId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1>Handicap Setup</h1>
          <p className="text-muted-foreground">
            Configure average-based handicap values separately for men and
            women.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {handicap.selectedRuleIds.length > 0 && (
            <Button
              variant="outline"
              onClick={() => handicap.setBulkDeleteDialogOpen(true)}
              disabled={handicap.isSaving}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Bulk Delete ({handicap.selectedRuleIds.length})
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handicap.openBulkDialog}
            disabled={leagueId === null}
          >
            <Upload className="mr-2 h-4 w-4" />
            Bulk Add
          </Button>
          <Button onClick={handicap.openAddDialog} disabled={leagueId === null}>
            <Plus className="mr-2 h-4 w-4" />
            Add Handicap
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maximum Handicap</CardTitle>
          <CardDescription>
            Set the maximum handicap applied to each gender in this league.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handicap.handleSaveConfig} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="men-max-handicap">Men's maximum handicap</Label>
                <Input
                  id="men-max-handicap"
                  type="number"
                  min="0"
                  step="1"
                  value={handicap.menMaxHandicap}
                  onChange={(event) =>
                    handicap.setMenMaxHandicap(event.target.value)
                  }
                  disabled={handicap.isSavingConfig || leagueId === null}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="women-max-handicap">
                  Women's maximum handicap
                </Label>
                <Input
                  id="women-max-handicap"
                  type="number"
                  min="0"
                  step="1"
                  value={handicap.womenMaxHandicap}
                  onChange={(event) =>
                    handicap.setWomenMaxHandicap(event.target.value)
                  }
                  disabled={handicap.isSavingConfig || leagueId === null}
                  required
                />
              </div>
            </div>
            <div>
              <Button
                type="submit"
                disabled={handicap.isSavingConfig || leagueId === null}
              >
                <Save className="mr-2 h-4 w-4" />
                {handicap.isSavingConfig ? 'Saving...' : 'Save Maximums'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Handicap Table</CardTitle>
          <CardDescription>
            Each average has a separate men's and women's handicap value.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {handicap.loadError ? (
            <div className="rounded-md border border-destructive/30 p-4 text-sm text-destructive">
              <div>{handicap.loadError}</div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => void handicap.loadRules()}
              >
                Retry
              </Button>
            </div>
          ) : (
            <HandicapTable
              rules={handicap.rules}
              selectedRuleIds={handicap.selectedRuleIds}
              isLoading={handicap.isLoading}
              isSaving={handicap.isSaving}
              onToggleRule={handicap.toggleRuleSelection}
              onToggleAll={handicap.toggleSelectAll}
              onEdit={handicap.openEditDialog}
              onDelete={handicap.openDeleteDialog}
            />
          )}
        </CardContent>
      </Card>

      <HandicapBulkAddDialog
        open={handicap.bulkDialogOpen}
        onOpenChange={handicap.setBulkDialogOpen}
        input={handicap.bulkInput}
        onInputChange={(value) => {
          handicap.setBulkInput(value);
          handicap.setBulkFileName('');
        }}
        fileName={handicap.bulkFileName}
        onFileSelect={handicap.handleBulkFileSelect}
        preview={handicap.bulkPreview}
        importDisabled={
          handicap.bulkPreview.dataRowCount === 0 ||
          handicap.bulkPreview.invalidCount > 0 ||
          handicap.bulkPreview.errors.length > 0 ||
          handicap.bulkPreview.validCount === 0
        }
        error={handicap.bulkError}
        onErrorChange={handicap.setBulkError}
        isSaving={handicap.isSaving}
        onSubmit={handicap.handleBulkAdd}
      />

      <HandicapFormDialog
        open={handicap.dialogOpen}
        onOpenChange={handicap.setDialogOpen}
        editingRule={handicap.editingRule}
        average={handicap.average}
        onAverageChange={handicap.setAverage}
        menHandicap={handicap.menHandicap}
        onMenHandicapChange={handicap.setMenHandicap}
        womenHandicap={handicap.womenHandicap}
        onWomenHandicapChange={handicap.setWomenHandicap}
        isSaving={handicap.isSaving}
        onSubmit={handicap.handleSave}
      />

      <HandicapDeleteDialog
        singleOpen={handicap.deleteDialogOpen}
        onSingleOpenChange={handicap.setDeleteDialogOpen}
        bulkOpen={handicap.bulkDeleteDialogOpen}
        onBulkOpenChange={handicap.setBulkDeleteDialogOpen}
        ruleToDelete={handicap.ruleToDelete}
        selectedCount={handicap.selectedRuleIds.length}
        isSaving={handicap.isSaving}
        onConfirmSingle={() => void handicap.confirmDelete()}
        onConfirmBulk={() => void handicap.confirmBulkDelete()}
      />
    </div>
  );
}
