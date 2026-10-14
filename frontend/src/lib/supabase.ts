import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || ''

/**
 * Checks whether a key looks like a Supabase service_role key.
 * Service role keys bypass RLS and must NEVER be exposed in frontend bundles.
 */
function isServiceRoleKey(key: string): boolean {
  if (!key) return false
  if (key.toLowerCase().includes('service_role') || key.toLowerCase().includes('service-role')) {
    return true
  }
  try {
    const parts = key.split('.')
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      if (payload?.role === 'service_role') {
        return true
      }
    }
  } catch {
    // If decoding fails, rely on explicit string matching
  }
  return false
}

/**
 * Validates the Supabase URL and anon key before client initialization.
 */
function validateSupabaseConfig(url: string, key: string): { valid: boolean; error: string | null } {
  if (!url || !key) {
    return {
      valid: false,
      error: 'Supabase environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are missing in this deployment. Please set them in your Vercel Project Settings > Environment Variables or in frontend/.env.local for local development.',
    }
  }

  if (
    url.includes('your-project-ref') ||
    url.includes('placeholder') ||
    url.includes('example.com') ||
    !/^https?:\/\//i.test(url)
  ) {
    return {
      valid: false,
      error: 'VITE_SUPABASE_URL is not configured with a valid Supabase project URL.',
    }
  }

  if (
    key.includes('your-publishable-anon-key') ||
    key.includes('placeholder') ||
    key.length < 20
  ) {
    return {
      valid: false,
      error: 'VITE_SUPABASE_ANON_KEY is not configured with a valid publishable key.',
    }
  }

  if (isServiceRoleKey(key)) {
    return {
      valid: false,
      error: 'CRITICAL SECURITY ERROR: Supabase service_role key detected in frontend configuration. NEVER expose your service_role key in client-side code! Use only the publishable anon key.',
    }
  }

  return { valid: true, error: null }
}

const validation = validateSupabaseConfig(supabaseUrl, supabaseAnonKey)

/**
 * Indicates whether Supabase credentials have been correctly configured and validated.
 */
export const isSupabaseConfigured: boolean = validation.valid

/**
 * Human-readable configuration error message when Supabase is not properly configured.
 */
export const supabaseConfigError: string | null = validation.error

if (!isSupabaseConfigured) {
  console.warn(`[ProofPocket AI] ${supabaseConfigError}`)
}

/**
 * Creates a safe fallback proxy when Supabase is unconfigured.
 * Prevents throwing unhandled exceptions or making HTTP requests to fake/placeholder domains.
 */
function createUnconfiguredProxy(): SupabaseClient {
  const handler: ProxyHandler<object> = {
    get(_target, prop) {
      if (prop === 'then') return undefined
      if (prop === 'auth') {
        return {
          getSession: async () => ({
            data: { session: null },
            error: new Error(supabaseConfigError ?? 'Supabase is not configured in this deployment.'),
          }),
          onAuthStateChange: () => ({
            data: { subscription: { unsubscribe: () => {} } },
          }),
          signInWithPassword: async () => ({
            data: { user: null, session: null },
            error: new Error(supabaseConfigError ?? 'Supabase is not configured in this deployment.'),
          }),
          signUp: async () => ({
            data: { user: null, session: null },
            error: new Error(supabaseConfigError ?? 'Supabase is not configured in this deployment.'),
          }),
          signOut: async () => ({
            error: new Error(supabaseConfigError ?? 'Supabase is not configured in this deployment.'),
          }),
        }
      }
      return () => {
        throw new Error(
          `Cannot call supabase.${String(prop)}(): ` +
          (supabaseConfigError ?? 'Supabase is not configured in this deployment.')
        )
      }
    },
  }
  return new Proxy({}, handler) as unknown as SupabaseClient
}

/**
 * Supabase client instance.
 * Initialized ONLY when valid credentials are provided.
 * When unconfigured, a safe proxy prevents sending requests to fake domains.
 */
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createUnconfiguredProxy()

/**
 * Diagnostic helper to test the Supabase connection.
 * Performs a read-only probe on the `purchases` table without mutating any data.
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      message: supabaseConfigError ?? 'Supabase credentials are not configured.',
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
