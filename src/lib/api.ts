
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '')

let accessToken: string | null = null
let onUnauthorized: (() => void) | undefined

export function setAccessToken(token: string | null) {
  accessToken = token
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
      accessToken = null
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

export function loginForm(username: string, password: string) {
  return new URLSearchParams({ username, password })
}
