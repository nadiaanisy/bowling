import { errorToastStyle, successToastStyle } from './toast-styles';
import {
  getConfirmPasswordValidationError,
  getPasswordValidationError,
  getSignupNameValidationError,
  getUsernameValidationError,
} from './validation-error';
import { toast } from 'sonner';
import { addUser } from '../../../src2/utils/api/add';
import type { FormEvent } from 'react';

/* Handles login form validation, authentication, and loading states. */
export const handleLoginSubmit = async (
  e: FormEvent,
  login: (username: string, password: string) => Promise<boolean>,
  username: string,
  password: string,
  setLoading: (loading: boolean) => void,
  setFieldErrors: (errors: { username: string; password: string }) => void,
) => {
  e.preventDefault();

  const usernameError = getUsernameValidationError(username);
  const passwordError = getPasswordValidationError(password);

  setFieldErrors({ username: usernameError, password: passwordError });
  if (usernameError || passwordError) {
    toast.error('Please correct the highlighted fields.', errorToastStyle);
    return;
  }

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
  setLoading: (loading: boolean) => void,
  setFieldErrors: (errors: { username: string; password: string }) => void,
  setSignupNameError: (error: string) => void,
  setConfirmPasswordError: (error: string) => void,
  onSuccess: () => void,
) => {
  e.preventDefault();

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

  setLoading(true);
  try {
    const user = await addUser(name.trim(), username.trim(), password);
    if (!user) return;

    toast.success(
      `Account "${user.user_name}" created. You can now log in.`,
      successToastStyle,
    );
    onSuccess();
  } finally {
    setLoading(false);
  }
};
