import { supabase } from '../supabase/supabaseClient';

export type TeamActivity = {
  id: number;
  league_id: number;
  team_id: number | null;
  actor_auth_user_id: string | null;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
};

type Id = string | number;

async function writeTeamActivity(
  leagueId: Id,
  teamId: Id | null,
  action: string,
  details: Record<string, unknown> = {},
): Promise<void> {
  const { error } = await supabase.from('team_activity').insert({
    league_id: leagueId,
    team_id: teamId,
    action,
    details,
  });

  if (error) {
    throw new Error(
      `The change was saved, but its activity record could not be written: ${error.message}`,
    );
  }
}

async function setTeamArchivedState(
  teamId: Id,
  leagueId: Id,
  archived: boolean,
): Promise<void> {
  const timestamp = new Date().toISOString();

  const { data, error } = await supabase
    .from('teams')
    .update({
      archived_at: archived ? timestamp : null,
      updated_at: timestamp,
    })
    .eq('id', teamId)
    .eq('league_id', leagueId)
    .select('id')
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to update team archive status: ${error.message}`);
  }

  if (!data) {
    throw new Error('Team not found or you do not have access to this league.');
  }

  await writeTeamActivity(
    leagueId,
    teamId,
    archived ? 'team.archived' : 'team.restored',
  );
}

export async function archiveTeam(teamId: Id, leagueId: Id): Promise<void> {
  await setTeamArchivedState(teamId, leagueId, true);
}

export async function restoreTeam(teamId: Id, leagueId: Id): Promise<void> {
  await setTeamArchivedState(teamId, leagueId, false);
}

async function setPlayerArchivedState(
  playerId: Id,
  teamId: Id,
  leagueId: Id,
  archived: boolean,
): Promise<void> {
  const timestamp = new Date().toISOString();

  const { data, error } = await supabase
    .from('players')
    .update({
      archived_at: archived ? timestamp : null,
      updated_at: timestamp,
    })
    .eq('id', playerId)
    .eq('team_id', teamId)
    .eq('league_id', leagueId)
    .select('id')
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to update player archive status: ${error.message}`);
  }

  if (!data) {
    throw new Error(
      'Player not found or the player does not belong to this team and league.',
    );
  }

  await writeTeamActivity(
    leagueId,
    teamId,
    archived ? 'player.archived' : 'player.restored',
    { player_id: playerId },
  );
}

export async function archivePlayer(
  playerId: Id,
  teamId: Id,
  leagueId: Id,
): Promise<void> {
  await setPlayerArchivedState(playerId, teamId, leagueId, true);
}

export async function restorePlayer(
  playerId: Id,
  teamId: Id,
  leagueId: Id,
): Promise<void> {
  await setPlayerArchivedState(playerId, teamId, leagueId, false);
}

export async function getTeamActivity(
  leagueId: Id,
  limit = 50,
): Promise<TeamActivity[]> {
  const safeLimit = Math.max(1, Math.min(Math.floor(limit), 200));

  const { data, error } = await supabase
    .from('team_activity')
    .select(
      'id, league_id, team_id, actor_auth_user_id, action, details, created_at',
    )
    .eq('league_id', leagueId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(safeLimit);

  if (error) {
    throw new Error(`Unable to load team activity: ${error.message}`);
  }

  return (data ?? []) as TeamActivity[];
}
