/* Validates that the username contains at least 3 characters. */
export const getUsernameValidationError = (username: string) =>
  username.trim().length < 3
    ? 'Enter a username with at least 3 characters.'
    : '';

/* Validates that the password contains at least 6 characters. */
export const getPasswordValidationError = (password: string) =>
  password.length < 6 ? 'Enter a password with at least 6 characters.' : '';

/* Validates that the name contains at least 2 characters. */
export const getSignupNameValidationError = (name: string) =>
  name.trim().length < 2 ? 'Enter a name with at least 2 characters.' : '';

/* Checks whether the password and confirmation password match. */
export const getConfirmPasswordValidationError = (
  password: string,
  confirmPassword: string,
) =>
  confirmPassword.length > 0 && password !== confirmPassword
    ? 'Passwords do not match.'
    : '';

/* Evaluates password strength based on length and character requirements. */
export const getPasswordStrength = (password: string) => {
  if (password.length < 6) return 'Weak';
  if (password.length >= 10 && /[A-Z]/.test(password) && /\d/.test(password))
    return 'Strong';
  return 'Good';
};
