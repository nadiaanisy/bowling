import { Dispatch, ReactNode, SetStateAction } from 'react';
import { toast } from 'sonner';
import { errorToastStyle } from './toast-styles';

/* Displays error messages to the user using a consistent toast style. */
export const catchError = (customErrMessage: string, err: any) => {
  // Normalize unknown errors before displaying them to the user.
  const message = err instanceof Error ? err.message : String(err);
  toast.error(customErrMessage + message, errorToastStyle);
};

/* Opens a confirmation dialog with a message and action to execute when confirmed. */
export const askConfirm = (
  message: ReactNode,
  action: () => void | Promise<void>,
  setConfirmMessage: (message: ReactNode) => void,
  setConfirmAction: Dispatch<SetStateAction<() => void | Promise<void>>>,
  setConfirmOpen: (open: boolean) => void,
) => {
  setConfirmMessage(message);
  setConfirmAction(() => action);
  setConfirmOpen(true);
};
