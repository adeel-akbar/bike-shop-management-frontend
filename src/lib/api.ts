
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '')

const TOKEN_KEY = 'motodesk_access_token'

// Restore the token when the page refreshes
let accessToken: string | null =
  typeof window !== 'undefined'
    ? sessionStorage.getItem(TOKEN_KEY)
    : null

let onUnauthorized: (() => void) | undefined

export function setAccessToken(token: string | null) {
  accessToken = token

  if (typeof window !== 'undefined') {
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token)
    } else {
      sessionStorage.removeItem(TOKEN_KEY)
    }
  }
}

export function isAuthenticated() {
  return accessToken !== null
}

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured.')
  }

  if (!path.startsWith('/') || path.startsWith('//')) {
    throw new Error('Use a relative API endpoint.')
  }

  const headers = new Headers(options.headers)

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    if (path !== '/login') {
      setAccessToken(null)
      onUnauthorized?.()
    }

    throw new ApiError(
      401,
      path === '/login'
        ? 'Invalid username or password.'
        : 'Your session has expired. Please sign in again.'
    )
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      'The request could not be completed. Please try again.'
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

// FastAPI OAuth2 expects form data, not JSON
export function loginForm(username: string, password: string) {
  return new URLSearchParams({ username, password })
}

export async function apiPdfRequest(path: string): Promise<Blob> {
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured.')
  }

  if (!path.startsWith('/') || path.startsWith('//')) {
    throw new Error('Use a relative API endpoint.')
  }

  const headers = new Headers()

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch(`${baseUrl}${path}`, {
    headers,
  })

  if (response.status === 401) {
    setAccessToken(null)
    onUnauthorized?.()

    throw new ApiError(
      401,
      'Your session has expired. Please sign in again.'
    )
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      'Unable to download the receipt. Please try again.'
    )
  }

  return response.blob()
}