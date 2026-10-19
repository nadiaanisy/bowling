import {
  FormEvent,
  useCallback,
  useEffect,
  useState
} from 'react';
import { useCustomHook } from '../utils/hooks';
import {
  addHandicapSetting,
  addHandicapSettings
} from '../utils/api/add';
import {
  getHandicapSettings,
  getLeagueHandicapConfig
} from '../utils/api/get';
import {
  deleteHandicapSetting,
  deleteHandicapSettings,
} from '../utils/api/delete';
import {
  saveLeagueHandicapConfig,
  updateHandicapSetting,
} from '../utils/api/update';
import { HandicapSetting } from '../utils/interfaces';
import { toast } from 'sonner';

const isValidNumber = (value: string, decimals: number) => {
  const trimmed = value.trim();

  if (!trimmed) return false;

  const number = Number(trimmed);

  if (!Number.isFinite(number) || number < 0) return false;

  const decimalPart = trimmed.split('.')[1];

  return !decimalPart || decimalPart.length <= decimals;
};

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
    let isCurrent = true;

    const load = async () => {
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

        if (!isCurrent) return;

        setRules([...data].sort((a, b) => a.average - b.average));
        setSelectedRuleIds([]);
        setMenMaxHandicap(String(config?.men_max_handicap ?? 40));
        setWomenMaxHandicap(String(config?.women_max_handicap ?? 50));
      } catch (error) {
        if (!isCurrent) return;

        setLoadError(
          error instanceof Error
            ? error.message
            : 'Unable to load handicap settings.',
        );
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isCurrent = false;
    };
  }, [
    leagueId,
    setRules,
    setSelectedRuleIds,
    setLoadError,
    setIsLoading,
    setMenMaxHandicap,
    setWomenMaxHandicap,
  ]);

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

    if (!isValidNumber(average, 2)) {
      toast.error(
        'Average must be non-negative with at most 2 decimal places.',
      );
      return;
    }

    if (!isValidNumber(menHandicap, 0)) {
      toast.error("Men's handicap must be a non-negative whole number.");
      return;
    }

    if (!isValidNumber(womenHandicap, 0)) {
      toast.error("Women's handicap must be a non-negative whole number.");
      return;
    }

    const avg = Number(average);
    const men = Number(menHandicap);
    const women = Number(womenHandicap);

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

      const [avgText, menText, womenText] = values;

      if (
        !isValidNumber(avgText, 2) ||
        !isValidNumber(menText, 0) ||
        !isValidNumber(womenText, 0)
      ) {
        setBulkError(
          `Row ${i + 1}: AVG must have at most 2 decimal places, and both handicaps must be non-negative whole numbers.`,
        );
        return;
      }

      const avg = Number(avgText);
      const men = Number(menText);
      const women = Number(womenText);

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
        await loadRules();

        toast.error(
          'Not all handicap rules were added. The table has been refreshed.',
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
      await saveLeagueHandicapConfig(leagueId, men, women);
      toast.success('Maximum handicap settings saved.');
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

      if (!deleted) {
        toast.error('The handicap rule was not deleted.');
        return;
      }

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
      const ids = [...selectedRuleIds];
      const count = await deleteHandicapSettings(ids, leagueId);

      if (count === 0) {
        toast.error('No selected handicap rules were deleted.');
        return;
      }

      setRules((current) => current.filter((rule) => !ids.includes(rule.id)));
      setSelectedRuleIds([]);
      toast.success(
        `${count} handicap rule${count === 1 ? '' : 's'} deleted successfully.`,
      );
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
