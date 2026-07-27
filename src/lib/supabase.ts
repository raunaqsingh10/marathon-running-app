import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const url = import.meta.env.VITE_SUPABASE_URL
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || !url || !publishableKey

export const supabase = !isDemoMode ? createClient<Database>(url!, publishableKey!, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
}) : null
