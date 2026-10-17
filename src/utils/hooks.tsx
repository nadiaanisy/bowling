import { useContext } from 'react';
import { Context } from './provider';

export const UseHook = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error('Hook must be used within Provider');
  }
  return context;
};

export const useCustomHook = () => {};
