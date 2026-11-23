import { addHandicapSetting } from './add';
import type {
HandicapChangeHistory,
HandicapSetting
} from '../interfaces';
import { table } from '../constants/db';
import {
  deleteHelper,
  getHelper,
  updateHelper,
} from '../supabase/supabaseHelper';

const sameNumberOrNull = (left: unknown, right: unknown) => {
  if (left === null || right === null) return left === right;
  const leftNumber = Number(left);
  const rightNumber = Number(right);
  return Number.isFinite(leftNumber) && Number.isFinite(rightNumber)
    ? leftNumber === rightNumber
    : left === right;
};

const isCurrentRuleVersion = (
  current: HandicapSetting,
  snapshot: Record<string, unknown>,
) =>
  ['average', 'men_handicap', 'women_handicap'].every(
    (key) =>
      Object.prototype.hasOwnProperty.call(snapshot, key) &&
      sameNumberOrNull(current[key as keyof HandicapSetting], snapshot[key]),
  );

const loadRule = async (id: string | number, leagueId: string | number) => {
  const { data, error } = await getHelper(
    table.handicapSettings,
    'id, league_id, average, men_handicap, women_handicap, created_at, updated_at',
  )
    .eq('id', id)
    .eq('league_id', leagueId)
    .maybeSingle();

  if (error)
    throw new Error(`Unable to verify the current rule: ${error.message}`);
  return (data ?? null) as HandicapSetting | null;
};

const ensureWithinCurrentMaximums = async (
  leagueId: string | number,
  men: number,
  women: number | null,
) => {
  const { data, error } = await getHelper(table.leagues, 'setup_config')
    .eq('id', leagueId)
    .maybeSingle();
  if (error)
    throw new Error(`Unable to verify Handicap limits: ${error.message}`);

  const setup = (
    data as unknown as { setup_config?: Record<string, unknown> | null } | null
  )?.setup_config;
  const enabled =
    (setup?.enable_handicap === true || setup?.enable_handicap === 'true') &&
    setup?.calculation_method !== 'No handicap';
  if (!enabled) return;

  const menMaximum = Number(setup?.men_maximum ?? 0);
  const womenMaximum = Number(setup?.ladies_maximum ?? 0);
  if (men > menMaximum || (women !== null && women > womenMaximum)) {
    throw new Error(
      `This restore exceeds current league maximums (men ${menMaximum}, women ${womenMaximum}). Update League Setup first if this value should be allowed.`,
    );
  }
};

/** Restores a previous rule or League Setup Handicap configuration snapshot. */
export const undoHandicapChange = async (
  entry: HandicapChangeHistory,
  leagueId: string | number,
): Promise<{ message: string; setupConfig?: Record<string, unknown> }> => {
  if (String(entry.league_id) !== String(leagueId)) {
    throw new Error('This history entry belongs to a different league.');
  }

  if (entry.entity_type === 'league_config') {
    if (entry.action !== 'updated') {
      throw new Error('This League Setup history entry cannot be restored.');
    }

    const { data, error: readError } = await getHelper(
      table.leagues,
      'id, setup_config',
    )
      .eq('id', leagueId)
      .maybeSingle();
    if (readError) {
      throw new Error(`Unable to load League Setup: ${readError.message}`);
    }
    const league = data as unknown as {
      id: string | number;
      setup_config: Record<string, unknown> | null;
    } | null;
    if (!league) throw new Error('The league could not be found.');

    const before = entry.before_values ?? {};
    const after = entry.after_values ?? {};
    const current = (league.setup_config ?? {}) as Record<string, unknown>;
    const keys = Array.from(
      new Set([...Object.keys(before), ...Object.keys(after)]),
    );
    if (keys.length === 0) {
      throw new Error(
        'This history entry has no Handicap settings to restore.',
      );
    }

    for (const key of keys) {
      const expected = Object.prototype.hasOwnProperty.call(after, key)
        ? after[key]
        : undefined;
      const actual = Object.prototype.hasOwnProperty.call(current, key)
        ? current[key]
        : undefined;
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(
          'These Handicap settings have changed since this history entry. Refresh history and restore the latest change instead.',
        );
      }
    }

    const restored = { ...current };
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(before, key)) {
        restored[key] = before[key];
      } else {
        delete restored[key];
      }
    }

    const restoredEnabled =
      (restored.enable_handicap === true ||
        restored.enable_handicap === 'true') &&
      restored.calculation_method !== 'No handicap';
    if (restoredEnabled) {
      const { data: ruleData, error: rulesError } = await getHelper(
        table.handicapSettings,
        'average, men_handicap, women_handicap',
      ).eq('league_id', leagueId);
      if (rulesError) {
        throw new Error(
          `Unable to verify existing Handicap rules: ${rulesError.message}`,
        );
      }
      const existingRules = (ruleData ?? []) as unknown as Array<{
        average: number;
        men_handicap: number;
        women_handicap: number | null;
      }>;
      const overMaximum = existingRules.filter(
        (rule) =>
          Number(rule.men_handicap) > Number(restored.men_maximum ?? 0) ||
          (rule.women_handicap !== null &&
            Number(rule.women_handicap) > Number(restored.ladies_maximum ?? 0)),
      );
      if (overMaximum.length > 0) {
        throw new Error(
          `Cannot restore these settings because existing rules exceed the restored maximums. Review AVG: ${overMaximum.map((rule) => rule.average).join(', ')}.`,
        );
      }
    }

    const { data: updatedRow, error } = await updateHelper(table.leagues, {
      setup_config: restored,
      updated_at: new Date().toISOString(),
    })
      .eq('id', leagueId)
      .select('id')
      .maybeSingle();
    if (error) {
      throw new Error(`Unable to restore League Setup: ${error.message}`);
    }
    if (!updatedRow) throw new Error('League Setup was not updated.');

    return {
      message: 'Previous Handicap settings restored.',
      setupConfig: restored,
    };
  }

  if (entry.entity_id === null) {
    throw new Error('This history entry does not identify a Handicap rule.');
  }

  const current = await loadRule(entry.entity_id, leagueId);
  if (entry.action === 'created') {
    const after = entry.after_values;
    if (!current || !after || !isCurrentRuleVersion(current, after)) {
      throw new Error(
        'This rule has changed since it was added. Refresh history and restore the latest change instead.',
      );
    }
    const { data, error } = await deleteHelper(table.handicapSettings)
      .eq('id', entry.entity_id)
      .eq('league_id', leagueId)
      .select('id');
    if (error)
      throw new Error(`Unable to undo the added rule: ${error.message}`);
    if (!data?.length) throw new Error('The rule was not deleted.');
    return { message: 'Added rule undone.' };
  }

  if (entry.action === 'updated') {
    const before = entry.before_values;
    const after = entry.after_values;
    if (
      !current ||
      !before ||
      !after ||
      !isCurrentRuleVersion(current, after)
    ) {
      throw new Error(
        'This rule has changed since this history entry. Refresh history and restore the latest change instead.',
      );
    }
    const average = Number(before.average);
    const men = Number(before.men_handicap);
    const women =
      before.women_handicap === null ? null : Number(before.women_handicap);
    await ensureWithinCurrentMaximums(leagueId, men, women);
    const { data, error } = await updateHelper(table.handicapSettings, {
      average,
      men_handicap: men,
      women_handicap: women,
      updated_at: new Date().toISOString(),
    })
      .eq('id', entry.entity_id)
      .eq('league_id', leagueId)
      .select('id')
      .maybeSingle();
    if (error) throw new Error(`Unable to restore the rule: ${error.message}`);
    if (!data) throw new Error('The rule was not updated.');
    return { message: 'Previous rule values restored.' };
  }

  const before = entry.before_values;
  if (!before)
    throw new Error('This deleted rule has no saved values to restore.');
  const average = Number(before.average);
  if (!Number.isFinite(average)) {
    throw new Error('This deleted rule has invalid saved values.');
  }
  await ensureWithinCurrentMaximums(
    leagueId,
    Number(before.men_handicap),
    before.women_handicap === null ? null : Number(before.women_handicap),
  );
  await addHandicapSetting(
    leagueId,
    average,
    Number(before.men_handicap),
    before.women_handicap === null ? null : Number(before.women_handicap),
  );
  return { message: 'Deleted rule restored.' };
};
