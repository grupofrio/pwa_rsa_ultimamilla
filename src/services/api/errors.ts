export class ApiError extends Error {
  readonly code: string
  readonly status: number
  readonly correlationId: string
  readonly retryable: boolean

  constructor(input: {
    message: string
    code: string
    status: number
    correlationId: string
    retryable?: boolean
  }) {
    super(input.message)
    this.name = 'ApiError'
    this.code = input.code
    this.status = input.status
    this.correlationId = input.correlationId
    this.retryable = input.retryable ?? false
  }
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 401 || error.code === 'session_expired')
}

export function isForbidden(error: unknown): boolean {
  return error instanceof ApiError && error.status === 403
}
