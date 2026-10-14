import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

/**
 * Checks whether the required environment variables are set and are not placeholder values.
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-ref') &&
  !supabaseAnonKey.includes('your-publishable-anon-key')
)

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.info(
    'ProofPocket AI: Supabase environment variables are pending. ' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env.local to enable live database connectivity.'
  )
}

/**
 * Supabase client instance.
 * Uses placeholder values when environment variables are not yet provided
 * to prevent startup crashes in development.
 */
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl! : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey! : 'placeholder-anon-key'
)

/**
 * Diagnostic helper to test the Supabase connection.
 * Performs a read-only probe on the `purchases` table without mutating any data.
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      message: 'Supabase credentials are not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to frontend/.env.local',
    }
  }

  try {
    const { error } = await supabase.from('purchases').select('id').limit(1)

    if (error) {
      return {
        success: false,
        message: `Supabase query failed: ${error.message} (code: ${error.code})`,
      }
    }

    return {
      success: true,
      message: 'Successfully reached Supabase database and verified table access!',
    }
  } catch (err: unknown) {
    return {
      success: false,
      message: `Network error connecting to Supabase: ${err instanceof Error ? err.message : String(err)}`,
    }
  }
}
