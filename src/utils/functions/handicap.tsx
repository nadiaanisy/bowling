import { FormEvent, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { addHandicapSetting, addHandicapSettings } from '../api/add';
import { deleteHandicapSetting, deleteHandicapSettings } from '../api/delete';
import { getHandicapSettings, getLeagueHandicapConfig } from '../api/get';
import { saveLeagueHandicapConfig, updateHandicapSetting } from '../api/update';
import { HandicapSetting } from '../interfaces';
import { useCustomHook } from '../hooks';

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
    menHandicap,
    setMenHandicap,
    womenHandicap,
    setWomenHandicap,
    isSaving,
    setIsSaving,
    dialogOpen,
    setDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    bulkDeleteDialogOpen,
    setBulkDeleteDialogOpen,
    menMaxHandicap,
    setMenMaxHandicap,
    womenMaxHandicap,
    setWomenMaxHandicap,
    isSavingConfig,
    setIsSavingConfig,
  } = useCustomHook();

  const loadRules = useCallback(async () => {
    if (leagueId === null) {
      setRules([]);
      setSelectedRuleIds([]);
      setLoadError('');
      setIsLoading(false);
      setMenMaxHandicap('40');
      setWomenMaxHandicap('50');
      return;
    }

    setIsLoading(true);
    setLoadError('');

    try {
      const [data, config] = await Promise.all([
        getHandicapSettings(leagueId),
        getLeagueHandicapConfig(leagueId),
      ]);
      setRules([...data].sort((a, b) => a.average - b.average));
      setSelectedRuleIds([]);
      setMenMaxHandicap(String(config?.men_max_handicap ?? 40));
      setWomenMaxHandicap(String(config?.women_max_handicap ?? 50));
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
  }, [leagueId]);
  useEffect(() => {
    void loadRules();
  }, [loadRules]);

  const resetForm = () => {
    setAverage('');
    setMenHandicap('');
    setWomenHandicap('');
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
    setMenHandicap(String(rule.men_handicap));
    setWomenHandicap(String(rule.women_handicap ?? ''));
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

    const avg = Number(average),
      men = Number(menHandicap),
      women = Number(womenHandicap);

    if (!average.trim() || !Number.isFinite(avg) || avg < 0) {
      toast.error('Average must be a valid non-negative number.');
      return;
    }

    if (!menHandicap.trim() || !Number.isFinite(men) || men < 0) {
      toast.error("Men's handicap must be a valid non-negative number.");
      return;
    }

    if (!womenHandicap.trim() || !Number.isFinite(women) || women < 0) {
      toast.error("Women's handicap must be a valid non-negative number.");
      return;
    }

    const duplicateAverage = rules.some(
      (rule) => Number(rule.average) === avg && rule.id !== editingRule?.id,
    );

    if (duplicateAverage) {
      toast.error(`AVG ${avg} already exists in this league.`);
      return;
    }

    setIsSaving(true);
    try {
      const result = editingRule
        ? await updateHandicapSetting(editingRule.id, leagueId, avg, men, women)
        : await addHandicapSetting(leagueId, avg, men, women);
      if (!result) return;
      setRules((current) =>
        [...current.filter((rule) => rule.id !== result.id), result].sort(
          (a, b) => a.average - b.average,
        ),
      );
      toast.success(
        editingRule
          ? 'Handicap updated successfully.'
          : 'Handicap added successfully.',
      );
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

    if (!lines.length) {
      setBulkError('Please enter at least one AVG, Men HDC, Women HDC row.');
      return;
    }

    const parsed: Array<{
      average: number;
      men_handicap: number;
      women_handicap: number;
    }> = [];
    const seen = new Set<number>();
    const existing = new Set(rules.map((rule) => Number(rule.average)));
    for (let i = 0; i < lines.length; i += 1) {
      const values = lines[i].split(/[\,\t;]/).map((value) => value.trim());

      if (values.length !== 3 || values.some((value) => value === '')) {
        setBulkError(
          `Row ${i + 1}: enter exactly AVG, Men's HDC, and Women's HDC.`,
        );
        return;
      }

      const [avg, men, women] = values.map(Number);
      if (
        [avg, men, women].some((value) => !Number.isFinite(value) || value < 0)
      ) {
        setBulkError(
          `Row ${i + 1}: all values must be valid non-negative numbers.`,
        );
        return;
      }

      if (existing.has(avg) || seen.has(avg)) {
        setBulkError(`Row ${i + 1}: AVG ${avg} is duplicated.`);
        return;
      }

      seen.add(avg);
      parsed.push({ average: avg, men_handicap: men, women_handicap: women });
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
        [...current, ...created].sort((a, b) => a.average - b.average),
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

  const handleSaveConfig = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (leagueId === null) {
      toast.error('Please select a league first.');
      return;
    }

    const men = Number(menMaxHandicap),
      women = Number(womenMaxHandicap);
    if (
      !menMaxHandicap.trim() ||
      !womenMaxHandicap.trim() ||
      !Number.isInteger(men) ||
      men < 0 ||
      !Number.isInteger(women) ||
      women < 0
    ) {
      toast.error('Maximum handicaps must be non-negative whole numbers.');
      return;
    }

    setIsSavingConfig(true);
    try {
      if (await saveLeagueHandicapConfig(leagueId, men, women)) {
        toast.success('Maximum handicap settings saved.');
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to save maximum handicaps.',
      );
    } finally {
      setIsSavingConfig(false);
    }
  };

  const toggleRuleSelection = (id: string | number) =>
    setSelectedRuleIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  const toggleSelectAll = () =>
    setSelectedRuleIds(
      selectedRuleIds.length === rules.length
        ? []
        : rules.map((rule) => rule.id),
    );
  const confirmDelete = async () => {
    if (!ruleToDelete || leagueId === null) return;
    setIsSaving(true);
    try {
      const deleted = await deleteHandicapSetting(ruleToDelete.id, leagueId);
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
    } finally {
      setIsSaving(false);
    }
  };

  const confirmBulkDelete = async () => {
    if (leagueId === null || !selectedRuleIds.length) return;
    setIsSaving(true);
    try {
      const ids = [...selectedRuleIds],
        count = await deleteHandicapSettings(ids, leagueId);
      if (count === null || count === 0) return;
      setRules((current) => current.filter((rule) => !ids.includes(rule.id)));
      toast.success(
        `${count} handicap rule${count === 1 ? '' : 's'} deleted successfully.`,
      );
      setSelectedRuleIds([]);
      setBulkDeleteDialogOpen(false);
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
    menHandicap,
    setMenHandicap,
    womenHandicap,
    setWomenHandicap,
    menMaxHandicap,
    setMenMaxHandicap,
    womenMaxHandicap,
    setWomenMaxHandicap,
    isSavingConfig,
    handleSaveConfig,
  };
}
