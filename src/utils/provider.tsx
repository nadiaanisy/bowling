import {
  createContext,
  ReactNode
} from 'react';
import { useCustomHook } from './hooks';

export const Context = createContext<any | undefined>(undefined);

/* Provides context values to child components. */
export function Provider({ children }: { children: ReactNode }) {
  const value = useCustomHook();

  return <Context.Provider value={value}>{children}</Context.Provider>;
}
