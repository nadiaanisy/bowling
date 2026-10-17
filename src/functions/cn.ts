import {
  type ClassValue,
  clsx
} from 'clsx';
import { twMerge } from 'tailwind-merge';

/* Merges and deduplicates CSS class names using Tailwind utilities. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
