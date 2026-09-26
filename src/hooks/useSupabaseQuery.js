import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabaseClient';

/**
 * A custom hook to fetch data from Supabase using React Query for caching.
 * @param {string} key - The unique query key (e.g., ['bookings', user.id])
 * @param {string} table - The Supabase table to query
 * @param {string} select - The columns to select (default: '*')
 * @param {object} filters - Key-value pairs for eq filters
 * @param {boolean} single - Whether to return a single record
 */
export const useSupabaseQuery = (key, table, select = '*', filters = {}, single = false) => {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      let query = supabase.from(table).select(select);
      
      Object.entries(filters).forEach(([col, val]) => {
        if (val !== undefined && val !== null) {
          query = query.eq(col, val);
        }
      });
      
      if (single) {
        query = query.single();
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
};
