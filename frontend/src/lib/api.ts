/**
 * ProofPocket AI — Backend API Client
 *
 * Connects the React frontend to the FastAPI backend service.
 * In local dev: defaults to http://localhost:8000.
 * In production: configured via VITE_API_URL environment variable.
 */

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '')

export interface HealthCheckResponse {
  status: string
  timestamp?: string
  version?: string
}

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

export { API_BASE_URL }
