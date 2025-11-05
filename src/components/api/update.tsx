import {
  catchError,
  errorToastStyle,
  successToastStyle
} from '../functions';
import { toast } from 'sonner';
import { table } from '../constant';
import { updateHelper } from './supabaseHelper';
import { getTeamsAndPlayersByLeagueId } from './get';

  /* --- UPDATE PLAYER --- */
  export const updatePlayer = async (
    playerId: number,
    newName: string,
    newStatus: string,
    selectedLeagueId: any,
    setTeams: (teams: any[]) => void
  ) => {
  try {
    const { error } = await updateHelper(table.players, {
        name: newName,
        status: newStatus,
      })
      .eq('id', playerId);

    if (error) {
      toast.error('Error updating player: ' + error.message, errorToastStyle);
      return false;
    }

    toast.success('Player updated successfully!', successToastStyle);

    const updatedTeams = await getTeamsAndPlayersByLeagueId(selectedLeagueId);
    setTeams(updatedTeams);
    
    return true;
  } catch (err) {
    catchError('Error updating player: ', err);
  }
};