import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey && !anonKey.includes('coloque_'))

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        // A sessão não deve sobreviver a reload/back-forward do navegador.
        // Enquanto a aba permanecer aberta, o Supabase ainda pode renovar o token.
        persistSession: false,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export function configurationMessage() {
  return 'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no ambiente local para conectar o sistema.'
}
