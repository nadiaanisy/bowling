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

  const [bulkFileName, setBulkFileName] = useState('');

  const bulkPreview = useMemo(
    () =>
      previewHandicapImport(
        bulkInput,
        rules.map((rule) => Number(rule.average)),
      ),
    [bulkInput, rules],
  );

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
    setBulkFileName('');
    setBulkDialogOpen(true);
  };

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

  const toggleRuleSelection = (id: string | number) =>
    setSelectedRuleIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  const clearRuleSelection = () => setSelectedRuleIds([]);

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

const isValidNumber = (value: string, decimals: number): boolean => {
  const trimmed = value.trim();
  if (!trimmed) return false;

  const number = Number(trimmed);
  if (!Number.isFinite(number) || number < 0) return false;

  const decimalPart = trimmed.split('.')[1];
  return !decimalPart || decimalPart.length <= decimals;
};

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

const detectDelimiter = (line: string): string => {
  const counts = countDelimiters(line);
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][1] > 0
    ? Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
    : ',';
};

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

export type SortField = 'average' | 'men_handicap' | 'women_handicap';
export type SortDirection = 'asc' | 'desc';
export type RangeFilters = {
  averageMin: string;
  averageMax: string;
  menMin: string;
  menMax: string;
  womenMin: string;
  womenMax: string;
};

export const emptyRanges: RangeFilters = {
  averageMin: '',
  averageMax: '',
  menMin: '',
  menMax: '',
  womenMin: '',
  womenMax: '',
};
