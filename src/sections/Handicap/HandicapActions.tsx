import { HandicapAddMenu } from './HandicapAddMenu';
import { HandicapExportMenu } from './HandicapExportMenu';
import { Button } from '../../components/button';
import { Trash2 } from 'lucide-react';

interface HandicapActionsProps {
  leagueSelected: boolean;
  selectedCount: number;
  isSaving: boolean;
  isLoading: boolean;
  historyLoading: boolean;
  onAddSingle: () => void;
  onBulkAdd: () => void;
  onBulkDelete: () => void;
  onExportRules: () => void;
  onExportHistory: () => void;
  onExportBackup: () => void;
}

/** Renders the page's export, bulk-delete, and add-handicap actions. */
export function HandicapActions(props: HandicapActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <HandicapExportMenu
        disabled={!props.leagueSelected}
        rulesLoading={props.isLoading}
        historyLoading={props.historyLoading}
        onExportRules={props.onExportRules}
        onExportHistory={props.onExportHistory}
        onExportBackup={props.onExportBackup}
      />
      {props.selectedCount > 0 && (
        <Button
          variant="outline"
          onClick={props.onBulkDelete}
          disabled={props.isSaving}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Bulk Delete ({props.selectedCount})
        </Button>
      )}
      <HandicapAddMenu
        disabled={!props.leagueSelected}
        onAddSingle={props.onAddSingle}
        onBulkAdd={props.onBulkAdd}
      />
    </div>
  );
}
