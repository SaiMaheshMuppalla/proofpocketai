/**
 * ProofPocket AI — Backend API Client
 *
 * Connects the React frontend to the FastAPI backend service.
 * In local dev: defaults to http://localhost:8000 (configurable via VITE_API_BASE_URL or VITE_API_URL).
 * In production: defaults to same-origin ("") so requests hit the same Vercel deployment domain.
 */

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL
  if (envUrl !== undefined && envUrl !== '') {
    return envUrl.replace(/\/+$/, '')
  }
  // In development: fallback to localhost FastAPI port
  // In production: fallback to same-origin ("")
  return import.meta.env.DEV ? 'http://localhost:8000' : ''
}

const API_BASE_URL = getApiBaseUrl()

export interface HealthCheckResponse {
  status: string
  timestamp?: string
  version?: string
}

export interface DocumentsResponse {
  documents: unknown[]
  total: number
}

/**
 * Checks the FastAPI backend health status.
 * Hits either same-origin `/health` in production or localhost:8000/health in dev.
 */
export async function checkBackendHealth(): Promise<{ success: boolean; data?: HealthCheckResponse; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!res.ok) {
      return {
        success: false,
        error: `Backend responded with HTTP status ${res.status}`,
      }
    }

    const data = await res.json()
    return { success: true, data }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

/**
 * Fetches user documents from FastAPI backend.
 * Phase 3 endpoint.
 */
export async function fetchDocuments(): Promise<{ success: boolean; data?: DocumentsResponse; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/documents`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!res.ok) {
      return {
        success: false,
        error: `Backend responded with HTTP status ${res.status}`,
      }
    }

    const data = await res.json()
    return { success: true, data }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

export { API_BASE_URL }
