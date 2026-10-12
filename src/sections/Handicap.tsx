import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/card';
import { Button } from '../components/button';
import { Plus, Trash2, Upload } from 'lucide-react';
import { HandicapTable } from '../sub-components/Handicap/HandicapTable';
import { HandicapFormDialog } from '../sub-components/Handicap/HandicapFormDialog';
import { HandicapBulkAddDialog } from '../sub-components/Handicap/HandicapBulkAddDialog';
import { HandicapDeleteDialog } from '../sub-components/Handicap/HandicapDeleteDialog';
import { useHandicap } from '../utils/functions/handicap';

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
            Define the handicap value assigned to each player average.
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
          <CardTitle>Handicap Table</CardTitle>
          <CardDescription>
            Maintain the average-to-handicap values used by this league.
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
        onInputChange={handicap.setBulkInput}
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
        handicap={handicap.handicap}
        onHandicapChange={handicap.setHandicap}
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
