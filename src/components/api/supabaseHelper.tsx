import { supabase } from '../../utils/supabaseClient';

/* SUPABASE HELPER */
export const getHelper = (table: string, query: string, options?: any) => {
  return supabase.from(table).select(query, options);
}

export const insertHelper = (table: string, values: any) => {
  return supabase.from(table).insert(values);
};

export const updateHelper = (table: string, values: any) => {
  return supabase.from(table).update(values);
};

export const deleteHelper = (table: string, options?: any) => {
  return supabase.from(table).delete(options);
};