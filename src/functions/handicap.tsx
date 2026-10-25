import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import { useCustomHook } from '../utils/hooks';
import {
  errorToastStyle,
  successToastStyle
} from './toast-styles';
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
import {
  HandicapImportPreview,
  HandicapImportRow,
  HandicapSetting,
} from '../utils/interfaces';
import { toast } from 'sonner';

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
    bulkFileName,
    setBulkFileName,
  } = useCustomHook();

  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkEditMenValue, setBulkEditMenValue] = useState('');
  const [bulkEditWomenValue, setBulkEditWomenValue] = useState('');
  const [bulkEditError, setBulkEditError] = useState('');

  /* Loads handicap rules and league configuration, resetting state when no league is selected. */
  const loadRules = useCallback(async () => {
    if (leagueId === null) {
      setRules([]);
      setSelectedRuleIds([]);
      setLoadError('');
      setIsLoading(false);
      setMenMaxHandicap('0');
      setWomenMaxHandicap('0');
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
  }, [
    leagueId,
    setRules,
    setSelectedRuleIds,
    setLoadError,
    setIsLoading,
    setMenMaxHandicap,
    setWomenMaxHandicap,
  ]);

  /* Loads handicap rules and league limits whenever the selected league changes. */
  useEffect(() => {
    void loadRules();
  }, [loadRules]);

  /* Generates a preview of the bulk handicap import using the current input and rule averages. */
  const bulkPreview = useMemo(
    () =>
      previewHandicapImport(
        bulkInput,
        rules.map((rule) => Number(rule.average)),
      ),
    [bulkInput, rules],
  );

  /* Clears the add/edit form and its current editing target. */
  const resetForm = () => {
    setAverage('');
    setMenHandicap('');
    setWomenHandicap('');
    setEditingRule(null);
  };

  /* Resets the form and opens the dialog for a new handicap rule. */
  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  /* Clears previous import data and opens the bulk-import dialog. */
  const openBulkDialog = () => {
    setBulkInput('');
    setBulkError('');
    setBulkFileName('');
    setBulkDialogOpen(true);
  };

  /* Validates and reads a supported handicap import file. */
  const handleBulkFileSelect = async (file: File) => {
    setBulkError('');
    setBulkInput('');
    setBulkFileName('');
    const supportedExtension = /\.(csv|tsv|txt)$/i.test(file.name);
    if (!supportedExtension) {
      setBulkError('Choose a .csv, .tsv, or .txt file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setBulkError('The file is too large. Maximum file size is 5 MB.');
      return;
    }
    try {
      const content = await file.text();
      if (!content.trim()) {
        setBulkError('The selected file is empty.');
        return;
      }
      setBulkInput(content);
      setBulkFileName(file.name);
    } catch {
      setBulkError('Unable to read the selected file. Try another file.');
    }
  };

  /* Loads an existing rule into the form and opens the edit dialog. */
  const openEditDialog = (rule: HandicapSetting) => {
    setEditingRule(rule);
    setAverage(String(rule.average));
    setMenHandicap(String(rule.men_handicap));
    setWomenHandicap(String(rule.women_handicap ?? ''));
    setDialogOpen(true);
  };

  /* Selects a rule for deletion and opens its confirmation dialog. */
  const openDeleteDialog = (rule: HandicapSetting) => {
    setRuleToDelete(rule);
    setDeleteDialogOpen(true);
  };

  /* Validates and creates or updates one handicap rule. */
  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (leagueId === null) {
      toast.error('Please select a league first.', errorToastStyle);
      return;
    }

    if (!isValidNumber(average, 2)) {
      toast.error(
        'Average must be non-negative with at most 2 decimal places.',
        errorToastStyle,
      );
      return;
    }

    if (!isValidNumber(menHandicap, 0)) {
      toast.error(
        "Men's handicap must be a non-negative whole number.",
        errorToastStyle,
      );
      return;
    }

    if (!isValidNumber(womenHandicap, 0)) {
      toast.error(
        "Women's handicap must be a non-negative whole number.",
        errorToastStyle,
      );
      return;
    }

    const avg = Number(average);
    const men = Number(menHandicap);
    const women = Number(womenHandicap);

    const duplicateAverage = rules.some(
      (rule) => Number(rule.average) === avg && rule.id !== editingRule?.id,
    );

    if (duplicateAverage) {
      toast.error(`AVG ${avg} already exists in this league.`, errorToastStyle);
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
        successToastStyle,
      );
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to save handicap.',
        errorToastStyle,
      );
    } finally {
      setIsSaving(false);
    }
  };

  /* Validates the import preview and inserts all valid rows as one operation. */
  const handleBulkAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBulkError('');

    if (leagueId === null) {
      setBulkError('Please select a league first.');
      return;
    }

    const preview = previewHandicapImport(
      bulkInput,
      rules.map((rule) => Number(rule.average)),
    );

    if (preview.dataRowCount === 0 || preview.rows.length === 0) {
      setBulkError(
        preview.errors[0] ?? 'Enter at least one handicap data row.',
      );
      return;
    }

    if (preview.invalidCount > 0 || preview.errors.length > 0) {
      setBulkError(
        'Import blocked. Fix every invalid or duplicate row before importing.',
      );
      return;
    }

    // The preview is valid only when every row has all three numeric values.
    // Keep the type guard here so nullable preview fields never reach the API.
    const parsed = preview.rows.map((row) => {
      if (
        row.average === null ||
        row.men_handicap === null ||
        row.women_handicap === null
      ) {
        throw new Error(
          `Import row ${row.rowNumber} is missing a valid numeric value.`,
        );
      }

      return {
        average: row.average,
        men_handicap: row.men_handicap,
        women_handicap: row.women_handicap,
      };
    });

    setIsSaving(true);
    try {
      // Re-check against the latest in-memory rules immediately before inserting.
      const latestExisting = new Set(rules.map((rule) => Number(rule.average)));
      if (parsed.some((row) => latestExisting.has(row.average))) {
        setBulkError(
          'Import blocked because one or more averages already exist. Refresh the preview and try again.',
        );
        return;
      }

      const created = await addHandicapSettings(leagueId, parsed);

      if (created.length !== parsed.length) {
        await loadRules();
        setBulkError(
          'Not all handicap rules were added. The table was refreshed; review the preview before retrying.',
        );
        return;
      }

      setRules((current) =>
        [...current, ...created].sort((a, b) => a.average - b.average),
      );
      toast.success(
        `${created.length} handicap rules added successfully.`,
        successToastStyle,
      );
      setBulkDialogOpen(false);
      setBulkInput('');
      setBulkFileName('');
    } catch (error) {
      setBulkError(
        error instanceof Error
          ? `${error.message} Your import data has been kept so you can review it and retry.`
          : 'Unable to add handicap rules. Your import data has been kept so you can retry.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  /* Validates and saves the league's maximum-handicap configuration. */
  const handleSaveConfig = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (leagueId === null) {
      toast.error('Please select a league first.', errorToastStyle);
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
      toast.error(
        'Maximum handicaps must be non-negative whole numbers.',
        errorToastStyle,
      );
      return;
    }

    setIsSavingConfig(true);
    try {
      await saveLeagueHandicapConfig(leagueId, men, women);
      toast.success('Maximum handicap settings saved.', successToastStyle);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to save maximum handicaps.',
        errorToastStyle,
      );
    } finally {
      setIsSavingConfig(false);
    }
  };

  /* Opens bulk edit with both optional values cleared. */
  const openBulkEdit = () => {
    setBulkEditMenValue('');
    setBulkEditWomenValue('');
    setBulkEditError('');
    setBulkEditOpen(true);
  };

  /* Applies one or both supplied values to selected rules. Blank fields stay unchanged. */
  const confirmBulkEdit = async () => {
    setBulkEditError('');
    if (leagueId === null) {
      setBulkEditError('Please select a league first.');
      return;
    }
    if (selectedRuleIds.length === 0) {
      setBulkEditError('Select at least one handicap rule.');
      return;
    }
    const hasMenValue = bulkEditMenValue.trim() !== '';
    const hasWomenValue = bulkEditWomenValue.trim() !== '';
    if (!hasMenValue && !hasWomenValue) {
      setBulkEditError("Enter a men's handicap, a women's handicap, or both.");
      return;
    }
    if (
      (hasMenValue && !isValidNumber(bulkEditMenValue, 0)) ||
      (hasWomenValue && !isValidNumber(bulkEditWomenValue, 0))
    ) {
      setBulkEditError('Entered values must be non-negative whole numbers.');
      return;
    }

    const selectedRules = rules.filter((rule) =>
      selectedRuleIds.includes(rule.id),
    );
    if (selectedRules.length === 0) {
      setBulkEditError(
        'No selected rules were found. Refresh the table and try again.',
      );
      return;
    }

    // Never silently convert an unedited null value to zero.
    const hasMissingPreservedValue = selectedRules.some(
      (rule) =>
        (!hasMenValue && rule.men_handicap === null) ||
        (!hasWomenValue && rule.women_handicap === null),
    );
    if (hasMissingPreservedValue) {
      setBulkEditError(
        'Some selected rules have a blank value in a field you left unchanged. Enter a value for that field too, or edit those rules individually first.',
      );
      return;
    }

    const nextMenValue = hasMenValue ? Number(bulkEditMenValue) : null;
    const nextWomenValue = hasWomenValue ? Number(bulkEditWomenValue) : null;
    const changedRules = selectedRules.filter(
      (rule) =>
        (nextMenValue !== null && Number(rule.men_handicap) !== nextMenValue) ||
        (nextWomenValue !== null &&
          Number(rule.women_handicap) !== nextWomenValue),
    );
    if (changedRules.length === 0) {
      setBulkEditError(
        'The selected rules already have these values. No changes are needed.',
      );
      return;
    }

    setIsSaving(true);
    let updatedCount = 0;
    try {
      for (const rule of changedRules) {
        const updated = await updateHandicapSetting(
          rule.id,
          leagueId,
          Number(rule.average),
          nextMenValue !== null ? nextMenValue : Number(rule.men_handicap),
          nextWomenValue !== null
            ? nextWomenValue
            : Number(rule.women_handicap),
        );
        setRules((current) =>
          current
            .map((item) => (item.id === updated.id ? updated : item))
            .sort((a, b) => a.average - b.average),
        );
        updatedCount += 1;
      }

      toast.success(
        `${updatedCount} handicap rule${updatedCount === 1 ? '' : 's'} updated successfully.`,
        successToastStyle,
      );
      setSelectedRuleIds([]);
      setBulkEditOpen(false);
      setBulkEditMenValue('');
      setBulkEditWomenValue('');
    } catch (error) {
      await loadRules();
      setBulkEditOpen(false);
      toast.error(
        `${updatedCount} of ${changedRules.length} updates completed before an error. The table was refreshed to show the current saved data. ${error instanceof Error ? error.message : 'Unable to complete bulk edit.'}`,
        errorToastStyle,
      );
    } finally {
      setIsSaving(false);
    }
  };

  /* Toggles selection of a single handicap rule. */
  const toggleRuleSelection = (id: string | number) =>
    setSelectedRuleIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  /* Clears all selected handicap rules. */
  const clearRuleSelection = () => setSelectedRuleIds([]);

  /* Selects all visible rules, or clears them when all are already selected. */
  const toggleSelectAll = (visibleRuleIds: Array<string | number>) => {
    const allVisibleSelected =
      visibleRuleIds.length > 0 &&
      visibleRuleIds.every((id) => selectedRuleIds.includes(id));
    setSelectedRuleIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !visibleRuleIds.includes(id));
      }

      const next = current.slice();

      visibleRuleIds.forEach((id) => {
        if (!next.includes(id)) {
          next.push(id);
        }
      });

      return next;
    });
  };

  /* Deletes the confirmed rule and updates local state after success. */
  const confirmDelete = async () => {
    if (!ruleToDelete || leagueId === null) return;
    setIsSaving(true);
    try {
      const deleted = await deleteHandicapSetting(ruleToDelete.id, leagueId);

      if (!deleted) {
        toast.error('The handicap rule was not deleted.', errorToastStyle);
        return;
      }

      setRules((current) =>
        current.filter((rule) => rule.id !== ruleToDelete.id),
      );
      setSelectedRuleIds((current) =>
        current.filter((id) => id !== ruleToDelete.id),
      );
      toast.success('Handicap deleted successfully.', successToastStyle);
      setRuleToDelete(null);
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to delete handicap.',
        errorToastStyle,
      );
    } finally {
      setIsSaving(false);
    }
  };

  /* Deletes selected rules that are currently visible in the table. */
  const confirmBulkDelete = async (visibleRuleIds: Array<string | number>) => {
    const visibleIds = new Set(visibleRuleIds);
    const idsToDelete = selectedRuleIds.filter((id) => visibleIds.has(id));
    if (leagueId === null || idsToDelete.length === 0) return;
    setIsSaving(true);
    try {
      const ids = [...idsToDelete];
      const count = await deleteHandicapSettings(ids, leagueId);

      if (count === 0) {
        toast.error(
          'No selected handicap rules were deleted.',
          errorToastStyle,
        );
        return;
      }

      setRules((current) => current.filter((rule) => !ids.includes(rule.id)));
      setSelectedRuleIds([]);
      toast.success(
        `${count} handicap rule${count === 1 ? '' : 's'} deleted successfully.`,
        successToastStyle,
      );
      setBulkDeleteDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to delete handicap rules.',
        errorToastStyle,
      );
    } finally {
      setIsSaving(false);
    }
  };

  return {
    rules,
    selectedRuleIds,
    bulkEditOpen,
    setBulkEditOpen,
    bulkEditMenValue,
    setBulkEditMenValue,
    bulkEditWomenValue,
    setBulkEditWomenValue,
    bulkEditError,
    setBulkEditError,
    openBulkEdit,
    confirmBulkEdit,
    isLoading,
    isSaving,
    loadError,
    bulkDialogOpen,
    setBulkDialogOpen,
    bulkInput,
    setBulkInput,
    bulkFileName,
    setBulkFileName,
    bulkPreview,
    handleBulkFileSelect,
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
    clearRuleSelection,
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

/* Validates a non-negative numeric value with a maximum decimal precision. */
const isValidNumber = (value: string, decimals: number): boolean => {
  const trimmed = value.trim();
  if (!trimmed) return false;

  const number = Number(trimmed);
  if (!Number.isFinite(number) || number < 0) return false;

  const decimalPart = trimmed.split('.')[1];
  return !decimalPart || decimalPart.length <= decimals;
};

/* Counts candidate delimiters while ignoring delimiters inside quoted values. */
const countDelimiters = (line: string): Record<string, number> => {
  const counts: Record<string, number> = { ',': 0, '\t': 0, ';': 0 };
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (!quoted && char in counts) {
      counts[char] += 1;
    }
  }

  return counts;
};

/* Detects the most likely delimiter for an import row. */
const detectDelimiter = (line: string): string => {
  const counts = countDelimiters(line);
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][1] > 0
    ? Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
    : ',';
};

/* Parses one delimited row while respecting quoted and escaped quotes. */
const parseLine = (line: string, delimiter: string): string[] => {
  const values: string[] = [];
  let value = '';
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        value += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === delimiter && !quoted) {
      values.push(value.trim());
      value = '';
    } else {
      value += char;
    }
  }

  values.push(value.trim());
  return values;
};

/* Identifies a supported AVG / men's / women's handicap header row. */
const isHeaderRow = (values: string[]): boolean => {
  const normalized = values.map((value) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z]/g, ''),
  );
  return (
    normalized.length >= 3 &&
    (normalized[0] === 'avg' || normalized[0] === 'average') &&
    (normalized[1].includes('men') || normalized[1] === 'mhdc') &&
    (normalized[2].includes('women') ||
      normalized[2] === 'womanshdc' ||
      normalized[2] === 'fhdc')
  );
};

/* Parses import text and reports row-level validation and duplicate errors. */
export const previewHandicapImport = (
  input: string,
  existingAverages: number[],
): HandicapImportPreview => {
  const cleanInput = input.replace(/^\uFEFF/, '');
  const sourceLines = cleanInput.split(/\r?\n/);
  const nonEmptyLines = sourceLines
    .map((line, index) => ({ line: line.trim(), rowNumber: index + 1 }))
    .filter(({ line }) => line.length > 0);

  if (nonEmptyLines.length === 0) {
    return {
      rows: [],
      dataRowCount: 0,
      validCount: 0,
      invalidCount: 0,
      errors: ['Add data or select a non-empty file.'],
    };
  }

  const firstDelimiter = detectDelimiter(nonEmptyLines[0].line);
  const firstValues = parseLine(nonEmptyLines[0].line, firstDelimiter);
  const hasHeader = isHeaderRow(firstValues);
  const dataLines = hasHeader ? nonEmptyLines.slice(1) : nonEmptyLines;
  const existing = new Set(existingAverages.map(Number));
  const seen = new Map<number, number[]>();

  const rows: HandicapImportRow[] = dataLines.map(({ line, rowNumber }) => {
    const delimiter = detectDelimiter(line);
    const values = parseLine(line, delimiter);
    const errors: string[] = [];

    if (values.length !== 3) {
      errors.push(
        "Expected exactly three columns: AVG, Men's HDC, and Women's HDC.",
      );
    }

    const [averageText = '', menHandicapText = '', womenHandicapText = ''] =
      values;
    if (values.length === 3 && values.some((value) => value === '')) {
      errors.push('All three columns are required.');
    }
    if (averageText && !isValidNumber(averageText, 2)) {
      errors.push(
        'AVG must be a non-negative number with at most 2 decimal places.',
      );
    }
    if (menHandicapText && !isValidNumber(menHandicapText, 0)) {
      errors.push("Men's HDC must be a non-negative whole number.");
    }
    if (womenHandicapText && !isValidNumber(womenHandicapText, 0)) {
      errors.push("Women's HDC must be a non-negative whole number.");
    }

    const average =
      averageText && isValidNumber(averageText, 2) ? Number(averageText) : null;
    const men_handicap =
      menHandicapText && isValidNumber(menHandicapText, 0)
        ? Number(menHandicapText)
        : null;
    const women_handicap =
      womenHandicapText && isValidNumber(womenHandicapText, 0)
        ? Number(womenHandicapText)
        : null;

    if (average !== null) {
      if (existing.has(average))
        errors.push(`AVG ${average} already exists in this league.`);
      const rowNumbers = seen.get(average) ?? [];
      rowNumbers.push(rowNumber);
      seen.set(average, rowNumbers);
    }

    return {
      rowNumber,
      averageText,
      menHandicapText,
      womenHandicapText,
      average,
      men_handicap,
      women_handicap,
      errors,
    };
  });

  // Use Map.forEach for compatibility with projects targeting older JavaScript.
  seen.forEach((rowNumbers, average) => {
    if (rowNumbers.length > 1) {
      rows.forEach((row) => {
        if (row.average === average) {
          row.errors.push(
            `AVG ${average} is duplicated within the import (rows ${rowNumbers.join(', ')}).`,
          );
        }
      });
    }
  });

  const invalidCount = rows.filter((row) => row.errors.length > 0).length;
  const topLevelErrors =
    dataLines.length === 0
      ? ['The file contains a header but no data rows.']
      : [];

  return {
    rows,
    dataRowCount: rows.length,
    validCount: rows.length - invalidCount,
    invalidCount,
    errors: topLevelErrors,
  };
};

/* Formats a value as a string, using an em dash for nullish values and JSON for objects. */
export const formatHistoryValue = (value: unknown): string => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};
