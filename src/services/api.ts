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
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      await handleHttpError(response)
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T
    }

    return response.json()
  } catch (error) {
    // Network errors (connection failed, DNS error, etc)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new HttpError(0, 'Erro de conexão. Verifique sua internet')
    }
    
    // Re-throw HttpError instances
    if (error instanceof HttpError) {
      throw error
    }
    
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
    errorData = await response.json()
    errorMessage = (errorData as { message?: string })?.message || ''
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
        'Erro no servidor. Tente novamente mais tarde',
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
