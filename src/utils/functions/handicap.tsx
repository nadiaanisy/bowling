import { FormEvent, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { addHandicapSetting, addHandicapSettings } from '../api/add';
import { deleteHandicapSetting, deleteHandicapSettings } from '../api/delete';
import { getHandicapSettings } from '../api/get';
import { updateHandicapSetting } from '../api/update';
import { useCustomHook } from '../hooks';
import { HandicapSetting } from '../interfaces';

export function useHandicap(leagueId: string | number | null) {
  const {
    rules,
    setRules,
    isLoading,
    setIsLoading,
    loadError,
    setLoadError,
    bulkDialogOpen,
    setBulkDialogOpen,
    bulkInput,
    setBulkInput,
    bulkError,
    setBulkError,
    selectedRuleIds,
    setSelectedRuleIds,
    editingRule,
    setEditingRule,
    ruleToDelete,
    setRuleToDelete,
    average,
    setAverage,
    handicap,
    setHandicap,
    isSaving,
    setIsSaving,
    dialogOpen,
    setDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    bulkDeleteDialogOpen,
    setBulkDeleteDialogOpen,
  } = useCustomHook();

  const loadRules = useCallback(async () => {
    if (leagueId === null) {
      setRules([]);
      setSelectedRuleIds([]);
      setLoadError('');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError('');
    try {
      const data = await getHandicapSettings(leagueId);
      setRules([...data].sort((a, b) => a.average - b.average));
    } catch (error) {
      setRules([]);
      setLoadError(
        error instanceof Error
          ? error.message
          : 'Unable to load handicap settings.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [leagueId, setRules, setSelectedRuleIds, setLoadError, setIsLoading]);

  useEffect(() => {
    void loadRules();
  }, [loadRules]);

  const resetForm = () => {
    setAverage('');
    setHandicap('');
    setEditingRule(null);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openBulkDialog = () => {
    setBulkInput('');
    setBulkError('');
    setBulkDialogOpen(true);
  };

  const openEditDialog = (rule: HandicapSetting) => {
    setEditingRule(rule);
    setAverage(String(rule.average));
    setHandicap(String(rule.handicap));
    setDialogOpen(true);
  };

  const openDeleteDialog = (rule: HandicapSetting) => {
    setRuleToDelete(rule);
    setDeleteDialogOpen(true);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (leagueId === null) {
      toast.error('Please select a league first.');
      return;
    }

    const averageValue = Number(average);
    const handicapValue = Number(handicap);

    if (!Number.isFinite(averageValue) || averageValue < 0) {
      toast.error('Average must be a valid non-negative number.');
      return;
    }
    if (!Number.isFinite(handicapValue) || handicapValue < 0) {
      toast.error('Handicap must be a valid non-negative number.');
      return;
    }

    const duplicate = rules.some(
      (rule) => rule.average === averageValue && rule.id !== editingRule?.id,
    );
    if (duplicate) {
      toast.error(`AVG ${averageValue} already exists in this league.`);
      return;
    }

    setIsSaving(true);
    try {
      if (editingRule) {
        const updated = await updateHandicapSetting(
          editingRule.id,
          leagueId,
          averageValue,
          handicapValue,
        );
        if (!updated) return;

        setRules((current) =>
          current
            .map((rule) =>
              rule.id === editingRule.id ? (updated as HandicapSetting) : rule,
            )
            .sort((a, b) => a.average - b.average),
        );
        toast.success('Handicap updated successfully.');
      } else {
        const created = await addHandicapSetting(
          leagueId,
          averageValue,
          handicapValue,
        );
        if (!created) return;

        setRules((current) =>
          [...current, created as HandicapSetting].sort(
            (a, b) => a.average - b.average,
          ),
        );
        toast.success('Handicap added successfully.');
      }

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to save handicap.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBulkError('');

    if (leagueId === null) {
      setBulkError('Please select a league first.');
      return;
    }

    const lines = bulkInput
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      setBulkError('Please enter at least one AVG and HDC row.');
      return;
    }

    const parsed: Array<{ average: number; handicap: number }> = [];
    const seenAverages = new Set<number>();
    const existingAverages = new Set(rules.map((rule) => rule.average));

    for (let index = 0; index < lines.length; index += 1) {
      const lineNumber = index + 1;
      const values = lines[index]
        .split(/[,\t;]/)
        .map((value) => value.trim())
        .filter(Boolean);

      if (values.length !== 2) {
        setBulkError(`Row ${lineNumber}: enter exactly AVG and HDC.`);
        return;
      }

      const averageValue = Number(values[0]);
      const handicapValue = Number(values[1]);
      if (
        !Number.isFinite(averageValue) ||
        averageValue < 0 ||
        !Number.isFinite(handicapValue) ||
        handicapValue < 0
      ) {
        setBulkError(
          `Row ${lineNumber}: AVG and HDC must be valid non-negative numbers.`,
        );
        return;
      }

      if (
        existingAverages.has(averageValue) ||
        seenAverages.has(averageValue)
      ) {
        setBulkError(`Row ${lineNumber}: AVG ${averageValue} is duplicated.`);
        return;
      }

      seenAverages.add(averageValue);
      parsed.push({ average: averageValue, handicap: handicapValue });
    }

    setIsSaving(true);
    try {
      const created = await addHandicapSettings(leagueId, parsed);
      if (created.length !== parsed.length) {
        toast.error(
          'Not all handicap rules were added. Please check the table and try again.',
        );
        return;
      }

      setRules((current) =>
        [...current, ...(created as HandicapSetting[])].sort(
          (a, b) => a.average - b.average,
        ),
      );
      toast.success(`${created.length} handicap rules added successfully.`);
      setBulkDialogOpen(false);
      setBulkInput('');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to add handicap rules.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const toggleRuleSelection = (ruleId: string | number) => {
    setSelectedRuleIds((current) =>
      current.includes(ruleId)
        ? current.filter((id) => id !== ruleId)
        : [...current, ruleId],
    );
  };

  const toggleSelectAll = () => {
    if (selectedRuleIds.length === rules.length) {
      setSelectedRuleIds([]);
      return;
    }
    setSelectedRuleIds(rules.map((rule) => rule.id));
  };

  const confirmDelete = async () => {
    if (!ruleToDelete || leagueId === null) return;

    setIsSaving(true);
    try {
      const deleted = await deleteHandicapSetting(ruleToDelete.id, leagueId);
      // The API helper already handles database errors. Do not show a
      // duplicate error toast when it returns false/null.
      if (!deleted) return;

      setRules((current) =>
        current.filter((rule) => rule.id !== ruleToDelete.id),
      );
      setSelectedRuleIds((current) =>
        current.filter((id) => id !== ruleToDelete.id),
      );
      toast.success('Handicap deleted successfully.');
      setRuleToDelete(null);
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to delete handicap.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const confirmBulkDelete = async () => {
    if (leagueId === null || selectedRuleIds.length === 0) return;

    setIsSaving(true);
    try {
      const idsToDelete = [...selectedRuleIds];
      const deletedCount = await deleteHandicapSettings(idsToDelete, leagueId);
      // The API helper already handles database errors. A zero count is
      // not a successful deletion, so leave the dialog open without a toast.
      if (deletedCount === null || deletedCount === 0) return;

      setRules((current) =>
        current.filter((rule) => !idsToDelete.includes(rule.id)),
      );
      toast.success(
        `${deletedCount} handicap rule${deletedCount === 1 ? '' : 's'} deleted successfully.`,
      );
      setSelectedRuleIds([]);
      setBulkDeleteDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to delete handicap rules.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return {
    rules,
    selectedRuleIds,
    isLoading,
    isSaving,
    loadError,
    bulkDialogOpen,
    setBulkDialogOpen,
    bulkInput,
    setBulkInput,
    bulkError,
    setBulkError,
    editingRule,
    ruleToDelete,
    average,
    setAverage,
    handicap,
    setHandicap,
    dialogOpen,
    setDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    bulkDeleteDialogOpen,
    setBulkDeleteDialogOpen,
    loadRules,
    openAddDialog,
    openBulkDialog,
    openEditDialog,
    openDeleteDialog,
    handleSave,
    handleBulkAdd,
    toggleRuleSelection,
    toggleSelectAll,
    confirmDelete,
    confirmBulkDelete,
  };
}
