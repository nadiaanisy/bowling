import {
  Dispatch,
  ReactNode,
  SetStateAction
} from 'react';
import { toast } from 'sonner';
import { errorToastStyle } from './toast-styles';

export const catchError = (customErrMessage: string, err: any) => {
  // Normalize unknown errors before displaying them to the user.
  const message = err instanceof Error ? err.message : String(err);
  toast.error(customErrMessage + message, errorToastStyle);
};

/* --- Ask For Confirmation --- */
export const askConfirm = (
  message: ReactNode,
  action: () => void | Promise<void>,
  setConfirmMessage: (message: ReactNode) => void,
  setConfirmAction: Dispatch<SetStateAction<() => void | Promise<void>>>,
  setConfirmOpen: (open: boolean) => void
) => {
  setConfirmMessage(message);
  setConfirmAction(() => action);
  setConfirmOpen(true);
};