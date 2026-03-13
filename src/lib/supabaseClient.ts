import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || '';

// Create client safely so it doesn't crash the app on load if missing
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey) 
  : null as any;

export async function fetchContentFromSupabase() {
  if (!supabase) {
    throw new Error('As chaves do Supabase (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY) não estão configuradas nas variáveis de ambiente da Vercel.');
  }

  const [{ data: settingsData }, { data: services }, { data: gallery }, { data: video_gallery }, { data: appointments }] = await Promise.all([
    supabase.from('settings').select('*'),
    supabase.from('services').select('*'),
    supabase.from('gallery').select('*'),
    supabase.from('video_gallery').select('*'),
    supabase.from('appointments').select('*').order('date', { ascending: false })
  ]);

  const settings: any = {};
  settingsData?.forEach((s: any) => settings[s.key] = s.value);

  return {
    settings,
    services: services || [],
    gallery: gallery || [],
    video_gallery: video_gallery || [],
    appointments: appointments || []
  };
}
