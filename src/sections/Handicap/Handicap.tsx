import {
  useEffect,
  useMemo,
  useRef
} from 'react';
import { FormDialog } from './FormDialog';
import { MaximumHandicap } from './MaxHandicap';
import { DeleteDialog } from './DeleteDialog';
import { BulkAddDialog } from './BulkAddDialog';
import { HandicapTable } from './HandicapTable';
import { HandicapHeader } from './HandicapHeader';
import { useCustomHook } from '../../utils/hooks';
import { HandicapActions } from './HandicapActions';
import { getHandicapChangeHistory } from '../../utils/api/get';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/card';
import { HandicapHistoryPanel } from './HandicapHistoryPanel';
import { HandicapTableFilters } from './HandicapTableFilters';
import { Button } from '../../components/button';
import { useHandicap } from '../../functions/handicap';
import {
  emptyRanges,
  RangeFilters,
  SortDirection,
  SortField,
} from '../../utils/constants/handicap';

interface HandicapProps {
  leagueId: string | number | null;
}

export default function Handicap({ leagueId }: HandicapProps) {
  const {
    search,
    setSearch,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    ranges,
    setRanges,
    historyRows,
    setHistoryRows,
    historyLoading,
    setHistoryLoading,
    historyError,
    setHistoryError,
  } = useCustomHook();

  const handicap = useHandicap(leagueId);

  const refreshHistory = async () => {
    if (leagueId === null) return;
    setHistoryLoading(true);
    setHistoryError('');
    try {
      setHistoryRows(await getHandicapChangeHistory(leagueId));
    } catch (error) {
      setHistoryError(
        error instanceof Error
          ? error.message
          : 'Unable to load handicap change history.',
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    let isCurrent = true;

    const loadHistory = async () => {
      if (leagueId === null) {
        setHistoryRows([]);
        setHistoryError('');
        setHistoryLoading(false);
        return;
      }

      setHistoryLoading(true);
      setHistoryError('');
      try {
        const rows = await getHandicapChangeHistory(leagueId);
        if (isCurrent) setHistoryRows(rows);
      } catch (error) {
        if (isCurrent) {
          setHistoryError(
            error instanceof Error
              ? error.message
              : 'Unable to load handicap change history.',
          );
        }
      } finally {
        if (isCurrent) setHistoryLoading(false);
      }
    };

    void loadHistory();
    return () => {
      isCurrent = false;
    };
  }, [leagueId]);

  /* Tracks whether a save operation was in progress during the previous render. */
  const wasSavingRef = useRef(false);

  useEffect(() => {
    const isSaving = handicap.isSaving || handicap.isSavingConfig;
    if (wasSavingRef.current && !isSaving && leagueId !== null) {
      void getHandicapChangeHistory(leagueId)
        .then(setHistoryRows)
        .catch((error) => {
          setHistoryError(
            error instanceof Error
              ? error.message
              : 'Unable to refresh handicap change history.',
          );
        });
    }
    wasSavingRef.current = isSaving;
  }, [handicap.isSaving, handicap.isSavingConfig, leagueId]);

  useEffect(() => {
    setSearch('');
    setSortField('average');
    setSortDirection('asc');
    setRanges(emptyRanges);
  }, [leagueId]);

  const invalidRange = (min: string, max: string) =>
    min !== '' && max !== '' && Number(min) > Number(max);

  const hasInvalidRange =
    invalidRange(ranges.averageMin, ranges.averageMax) ||
    invalidRange(ranges.menMin, ranges.menMax) ||
    invalidRange(ranges.womenMin, ranges.womenMax);

  const visibleRules = useMemo(() => {
    if (hasInvalidRange) return [];
    const query = search.trim().toLowerCase();
    const numberInRange = (value: number | null, min: string, max: string) => {
      if (value === null) return min === '' && max === '';
      return (
        (min === '' || value >= Number(min)) &&
        (max === '' || value <= Number(max))
      );
    };
    return handicap.rules
      .filter((rule) => {
        const matchesSearch =
          !query ||
          [rule.average, rule.men_handicap, rule.women_handicap].some(
            (value) =>
              value !== null && String(value).toLowerCase().includes(query),
          );
        return (
          matchesSearch &&
          numberInRange(rule.average, ranges.averageMin, ranges.averageMax) &&
          numberInRange(rule.men_handicap, ranges.menMin, ranges.menMax) &&
          numberInRange(rule.women_handicap, ranges.womenMin, ranges.womenMax)
        );
      })
      .sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        if (aValue === null) return bValue === null ? 0 : 1;
        if (bValue === null) return -1;
        const comparison = aValue - bValue;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [
    handicap.rules,
    search,
    sortField,
    sortDirection,
    ranges,
    hasInvalidRange,
  ]);

  const updateSearch = (value: string) => {
    setSearch(value);
    handicap.clearRuleSelection();
  };

  const updateRange = (key: keyof RangeFilters, value: string) => {
    setRanges((current) => ({ ...current, [key]: value }));
    handicap.clearRuleSelection();
  };

  const updateSortField = (value: SortField) => {
    setSortField(value);
    handicap.clearRuleSelection();
  };

  const updateSortDirection = (value: SortDirection) => {
    setSortDirection(value);
    handicap.clearRuleSelection();
  };

  const resetTableControls = () => {
    setSearch('');
    setSortField('average');
    setSortDirection('asc');
    setRanges(emptyRanges);
    handicap.clearRuleSelection();
  };

  /* Creates and downloads a file with the specified filename, contents, and MIME type. */
  const downloadFile = (
    filename: string,
    contents: string,
    mimeType: string,
  ) => {
    const blob = new Blob([contents], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  /* Formats a value as a string, using an em dash for nullish values and JSON for objects. */
  const csvCell = (value: unknown) => {
    const text =
      value == null
        ? ''
        : typeof value === 'object'
          ? JSON.stringify(value)
          : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };

  /* Exports the league's handicap rules as a downloadable CSV file. */
  const exportRulesCsv = () => {
    if (leagueId === null) return;
    const rows = [
      ['average', 'men_handicap', 'women_handicap', 'id'],
      ...handicap.rules.map((rule) => [
        rule.average,
        rule.men_handicap,
        rule.women_handicap,
        rule.id,
      ]),
    ];
    downloadFile(
      `handicap-rules-league-${leagueId}.csv`,
      rows.map((row) => row.map(csvCell).join(',')).join('\\r\\n'),
      'text/csv;charset=utf-8',
    );
  };

  /* Exports the league's handicap change history as a downloadable CSV file. */
  const exportHistoryCsv = () => {
    if (leagueId === null) return;
    const fields = [
      'id',
      'league_id',
      'entity_type',
      'entity_id',
      'action',
      'before_values',
      'after_values',
      'actor_id',
      'changed_at',
    ] as const;
    const rows = [
      fields,
      ...historyRows.map((entry) => fields.map((field) => entry[field])),
    ];
    downloadFile(
      `handicap-history-league-${leagueId}.csv`,
      rows.map((row) => row.map(csvCell).join(',')).join('\\r\\n'),
      'text/csv;charset=utf-8',
    );
  };

  /* Exports the league's handicap rules, maximum handicap settings, and change history as a JSON backup snapshot. */
  const exportJsonBackup = () => {
    if (leagueId === null) return;
    const backup = {
      format: 'bowling-handicap-backup',
      version: 1,
      exported_at: new Date().toISOString(),
      league_id: leagueId,
      handicap_rules: handicap.rules,
      maximum_handicap_settings: {
        men_max_handicap: Number(handicap.menMaxHandicap),
        women_max_handicap: Number(handicap.womenMaxHandicap),
      },
      change_history: historyRows,
      notes:
        'This is a league-level export snapshot, not a full database backup or automatic restore file.',
    };
    downloadFile(
      `handicap-backup-league-${leagueId}.json`,
      JSON.stringify(backup, null, 2),
      'application/json;charset=utf-8',
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <HandicapHeader />
        <HandicapActions
          leagueSelected={leagueId !== null}
          selectedCount={handicap.selectedRuleIds.length}
          isSaving={handicap.isSaving}
          isLoading={handicap.isLoading}
          historyLoading={historyLoading}
          onAddSingle={handicap.openAddDialog}
          onBulkAdd={handicap.openBulkDialog}
          onBulkDelete={() => handicap.setBulkDeleteDialogOpen(true)}
          onExportRules={exportRulesCsv}
          onExportHistory={exportHistoryCsv}
          onExportBackup={exportJsonBackup}
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <Card className="flex h-[92vh] min-w-0 flex-col xl:row-span-2">
          <CardHeader>
            <CardTitle>Handicap Table</CardTitle>
            <CardDescription>
              Each average has a separate men's and women's handicap value.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <HandicapTableFilters
              search={search}
              onSearchChange={updateSearch}
              sortField={sortField}
              onSortFieldChange={updateSortField}
              sortDirection={sortDirection}
              onSortDirectionChange={updateSortDirection}
              ranges={ranges}
              onRangeChange={updateRange}
              onReset={resetTableControls}
              disabled={handicap.isLoading || leagueId === null}
              invalidRange={hasInvalidRange}
              visibleCount={visibleRules.length}
              totalCount={handicap.rules.length}
            />
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
              <div className="min-h-0 flex-1 overflow-auto overscroll-contain">
                <HandicapTable
                  rules={visibleRules}
                  selectedRuleIds={handicap.selectedRuleIds}
                  isLoading={handicap.isLoading}
                  isSaving={handicap.isSaving}
                  onToggleRule={handicap.toggleRuleSelection}
                  onToggleAll={() =>
                    handicap.toggleSelectAll(
                      visibleRules.map((rule) => rule.id),
                    )
                  }
                  onEdit={handicap.openEditDialog}
                  onDelete={handicap.openDeleteDialog}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex min-w-0 flex-col gap-4">
          <MaximumHandicap leagueId={leagueId} />
          <HandicapHistoryPanel
            leagueId={leagueId}
            loading={historyLoading}
            error={historyError}
            rows={historyRows}
            onRefresh={() => void refreshHistory()}
          />
        </div>
      </div>

      <BulkAddDialog
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

      <FormDialog
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

      <DeleteDialog
        singleOpen={handicap.deleteDialogOpen}
        onSingleOpenChange={handicap.setDeleteDialogOpen}
        bulkOpen={handicap.bulkDeleteDialogOpen}
        onBulkOpenChange={handicap.setBulkDeleteDialogOpen}
        ruleToDelete={handicap.ruleToDelete}
        selectedCount={handicap.selectedRuleIds.length}
        isSaving={handicap.isSaving}
        onConfirmSingle={() => void handicap.confirmDelete()}
        onConfirmBulk={() =>
          void handicap.confirmBulkDelete(visibleRules.map((rule) => rule.id))
        }
      />
    </div>
  );
}
