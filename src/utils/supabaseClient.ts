import { createClient } from '@supabase/supabase-js';
// import { Testimonial } from '../components/interface';
// import { useEffect } from 'react';
// import { toast } from 'sonner';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL! || 'https://dkxydjzmmpqdahmspnje.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRreHlkanptbXBxZGFobXNwbmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDAzNjksImV4cCI6MjA3NTc3NjM2OX0.zG6KgJatrJVLIBtXL_zdLyaWpmUT33-jm5wbB0ya1FE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public',
    parseToNumber: true, // ✅ forces bigint (int8) to return as number
  },
} as any)