import { useContext } from 'react';
import { Context } from './provider';

/* Returns the current context value and throws an error if used outside the Provider. */
export const UseHook = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error('Hook must be used within Provider');
  }
  return context;
};

/* Defines a custom hook for managing shared context state. */
export const useCustomHook = () => {};
