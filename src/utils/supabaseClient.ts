import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL! || 'https://cgqiwpinupydxzyxtetj.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncWl3cGludXB5ZHh6eXh0ZXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzgyNjgsImV4cCI6MjA3NjkxNDI2OH0.yBtd-nv75GveT8Mp_HdMeZBnAf-QmozyK2PIPdA20UU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public',
    parseToNumber: true, // ✅ forces bigint (int8) to return as number
  },
} as any)