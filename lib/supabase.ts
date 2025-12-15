import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vewkmwyxikszriapusjz.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZld2ttd3l4aWtzenJpYXB1c2p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3OTgxNzIsImV4cCI6MjA4MTM3NDE3Mn0.NZ--Bad5F1FwXY8OUog4EbkN5-_H7o6PUqKf5T3RYCY';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase Configuration Error:');
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.error('Set these in your .env.local file');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
