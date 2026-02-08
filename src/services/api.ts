import { useAuthStore } from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api'

export class HttpError extends Error {
    public status: number
    public data?: unknown

  constructor(status: number, message: string, data?: unknown) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.data = data

    // Restore prototype chain for correct instanceof behavior on older targets
    Object.setPrototypeOf(this, HttpError.prototype)
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  params?: Record<string, string | number | undefined>
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, params } = options
  
  // Get token from auth store
  const token = useAuthStore.getState().getAccessToken()
  
  // Build URL with query params
  let url = `${API_URL}${endpoint}`
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    console.debug('[API] Request:', { url, method, hasToken: !!token })

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    // Log status for easier debugging
    console.debug('[API] Response status:', { url, status: response.status })

    if (!response.ok) {
      // Attempt to surface body content (json or text) before delegating to handler
      try {
        // Clone in case handler also reads the body
        const clone = response.clone()
        const bodyJson = await clone.json().catch(() => null)
        if (bodyJson) {
          console.error('[API] Error body (json):', bodyJson)
        } else {
          const bodyText = await response.text().catch(() => '')
          if (bodyText) console.error('[API] Error body (text):', bodyText)
        }
      } catch (e) {
        // swallow diagnostics errors
      }

      await handleHttpError(response)
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T
    }

    // Try to parse JSON, but fallback to text if response is not JSON
    try {
      return (await response.json()) as T
    } catch (e) {
      const text = await response.text().catch(() => '')
      // Return text as unknown when JSON parse fails
      return (text as unknown) as T
    }
  } catch (error: unknown) {
    // Network errors (connection failed, DNS error, CORS, etc)
    const err = error as Error
    if (err instanceof TypeError || /Failed to fetch|NetworkError|Network request failed/i.test(err.message)) {
      console.error('[API] Network error', { url, message: err.message })
      throw new HttpError(0, `Erro de conexão. Verifique sua internet: ${err.message}`)
    }

    // Re-throw HttpError instances
    if (error instanceof HttpError) {
      throw error
    }

    console.error('[API] Unexpected error', { url, error })
    // Generic error fallback
    throw new HttpError(0, 'Ocorreu um erro inesperado')
  }
}

async function handleHttpError(response: Response): Promise<never> {
  const status = response.status
  let errorData: unknown
  let errorMessage = ''

  // Try to parse error response body
  try {
    // Prefer JSON, but fall back to text if necessary
    try {
      errorData = await response.json()
      console.error('❌ [API] Erro do servidor (json):', errorData)
      errorMessage = (errorData as { message?: string })?.message || ''
    } catch {
      const text = await response.text().catch(() => '')
      if (text) {
        errorData = text
        console.error('❌ [API] Erro do servidor (text):', text)
        errorMessage = text
      }
    }
  } catch {
    // If JSON parsing fails, use default messages
  }

  // Handle specific status codes
  switch (status) {
    case 401: {
      // Unauthorized - session expired
      const authStore = useAuthStore.getState()
      authStore.signOut()
      
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
      
      throw new HttpError(401, 'Sua sessão expirou. Faça login novamente', errorData)
    }

    case 403:
      // Forbidden - no permission
      throw new HttpError(
        403, 
        errorMessage || 'Você não tem permissão para acessar este recurso',
        errorData
      )

    case 500:
    case 502:
    case 503:
    case 504:
      // Server errors
      throw new HttpError(
        status,
        errorMessage || 'Erro no servidor. Tente novamente mais tarde',
        errorData
      )

    default:
      // Generic error with custom message or fallback
      throw new HttpError(
        status,
        errorMessage || `Erro na requisição (${status})`,
        errorData
      )
  }
}

export const api = {
  get: <T>(endpoint: string, params?: Record<string, string | number | undefined>) => 
    request<T>(endpoint, { method: 'GET', params }),
  
  post: <T>(endpoint: string, body: unknown) => 
    request<T>(endpoint, { method: 'POST', body }),
  
  patch: <T>(endpoint: string, body: unknown) => 
    request<T>(endpoint, { method: 'PATCH', body }),
  
  delete: <T>(endpoint: string) => 
    request<T>(endpoint, { method: 'DELETE' }),
}
