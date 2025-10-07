import { supabase } from '@/lib/supabase';

export const createRealtimeChannel = (name: string) =>
  supabase.channel(name, { config: { broadcast: { self: false } } });

