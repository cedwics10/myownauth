export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function defaultMessage(status: number) {
  if (status === 404) return 'Ressource introuvable.'
  if (status >= 500) return 'Le serveur de la Batcave ne répond pas. Est-il démarré ?'
  return 'Requête refusée.'
}

type ApiOptions = { method?: string; body?: unknown }

export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'

  let response: Response
  try {
    response = await fetch(path, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch {
    throw new ApiError(0, 'Impossible de joindre la Batcave. Vérifiez votre connexion.')
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new ApiError(response.status, data.message || defaultMessage(response.status))
  return data as T
}
