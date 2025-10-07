import { supabase } from '@/lib/supabase';

export const getChannel = (type: 'chat' | 'rtc', id: string) =>
  supabase.channel(`${type}:${id}`, { config: { broadcast: { self: false } } });

