import type {
  Dispatch,
  FormEvent,
  MutableRefObject,
  SetStateAction,
} from 'react';
import {
  errorToastStyle,
  successToastStyle
} from './toast-styles';
import { addUser } from '../utils/api/add';
import {
  getConfirmPasswordValidationError,
  getPasswordValidationError,
  getSignupNameValidationError,
  getUsernameValidationError,
} from './validation-error';
import { toast } from 'sonner';

/* Handles login form validation, authentication, and loading states. */
export const handleLoginSubmit = async (
  e: FormEvent,
  login: (username: string, password: string) => Promise<boolean>,
  username: string,
  password: string,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setFieldErrors: Dispatch<
    SetStateAction<{ username: string; password: string }>
  >,
  isSubmittingRef: MutableRefObject<boolean>,
) => {
  e.preventDefault();
  if (isSubmittingRef.current) return;

  const usernameError = getUsernameValidationError(username);
  const passwordError = getPasswordValidationError(password);

  setFieldErrors({ username: usernameError, password: passwordError });
  if (usernameError || passwordError) {
    toast.error('Please correct the highlighted fields.', errorToastStyle);
    return;
  }

  isSubmittingRef.current = true;
  setLoading(true);
  try {
    const isLoggedIn = await login(username.trim(), password);
    if (!isLoggedIn) {
      toast.error(
        'Login failed. Check your username and password.',
        errorToastStyle,
      );
    }
  } catch {
    toast.error(
      'Unable to sign in right now. Please try again.',
      errorToastStyle,
    );
  } finally {
    isSubmittingRef.current = false;
    setLoading(false);
  }
};

/* Handles signup validation, account creation, and success feedback. */
export const handleSignupSubmit = async (
  e: FormEvent,
  name: string,
  username: string,
  password: string,
  confirmPassword: string,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setFieldErrors: Dispatch<
    SetStateAction<{ username: string; password: string }>
  >,
  setSignupNameError: Dispatch<SetStateAction<string>>,
  setConfirmPasswordError: Dispatch<SetStateAction<string>>,
  onSuccess: () => void,
  isSubmittingRef: MutableRefObject<boolean>,
) => {
  e.preventDefault();
  if (isSubmittingRef.current) return;

  const nameError = getSignupNameValidationError(name);
  const usernameError = getUsernameValidationError(username);
  const passwordError = getPasswordValidationError(password);
  const confirmationError = getConfirmPasswordValidationError(
    password,
    confirmPassword,
  );

  setSignupNameError(nameError);
  setConfirmPasswordError(confirmationError);

  setFieldErrors({
    username: usernameError,
    password: passwordError || confirmationError,
  });

  if (nameError || usernameError || passwordError || confirmationError) {
    toast.error('Please correct the highlighted fields.', errorToastStyle);
    return;
  }

  isSubmittingRef.current = true;
  setLoading(true);
  try {
    const user = await addUser(name.trim(), username.trim(), password);
    // addUser owns failure notifications and returns null on failure.
    if (!user) return;

    toast.success(
      `Account "${user.user_name}" created. You can now log in.`,
      successToastStyle,
    );
    onSuccess();
  } catch {
    // Defensive fallback for unexpected failures outside addUser's handled errors.
    toast.error(
      'Unable to create account right now. Please try again.',
      errorToastStyle,
    );
  } finally {
    isSubmittingRef.current = false;
    setLoading(false);
  }
};
