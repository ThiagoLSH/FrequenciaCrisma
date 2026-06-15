import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://qzxabpyhvykiugtcznep.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6eGFicHlodnlraXVndGN6bmVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NzgzOTQsImV4cCI6MjA5NzA1NDM5NH0.wAz83AZCRrBzDcmrYE0Qfkr7SHcdryP1dexO-bKdGpk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
