import { reactive } from 'vue'

// Le serveur du TP1 (batcave-security) est joint via le proxy /batcave-security
// (nginx en Docker, Vite en dev), pour rester sur la même origine que le front.
const BASE = '/batcave-security'

// URL directe du serveur, pour ouvrir le vrai Bat-Ordinateur dans un onglet :
// npm start en dev, port publié par docker-compose sinon.
export const DIRECT_URL = import.meta.env.DEV ? 'http://localhost:3000' : 'http://localhost:3100'

// Identifiants partagés par les onglets des phases 3.x, gardés en mémoire seulement.
export const credentials = reactive({ username: '', password: '' })

// Équivalent navigateur de Buffer.from(texte).toString('base64'), accents compris.
export function toBase64(text: string) {
  const bytes = new TextEncoder().encode(text)
  return btoa(String.fromCharCode(...bytes))
}

export function basicHeader(username: string, password: string) {
  return 'Basic ' + toBase64(`${username}:${password}`)
}

export type Reply = {
  status: number
  data: unknown
  text: string
  contentType: string
  wwwAuthenticate: string | null
}

type CallOptions = { method?: string; authorization?: string; body?: unknown }

export async function call(path: string, options: CallOptions = {}): Promise<Reply> {
  const headers = new Headers()
  if (options.authorization) headers.set('Authorization', options.authorization)
  if (options.body !== undefined) headers.set('Content-Type', 'application/json')

  const response = await fetch(BASE + path, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
  const text = await response.text()
  let data: unknown = null
  try {
    data = JSON.parse(text)
  } catch {
    // réponse HTML ou vide
  }
  return {
    status: response.status,
    data,
    text,
    contentType: response.headers.get('Content-Type') ?? '',
    // Le proxy renomme l'en-tête pour que le navigateur n'ouvre pas sa fenêtre de connexion.
    wwwAuthenticate: response.headers.get('X-WWW-Authenticate') ?? response.headers.get('WWW-Authenticate'),
  }
}

// Le serveur répond 401 sur /api/secrets sans identifiants ; toute autre réponse veut dire qu'il est injoignable.
export async function isOnline() {
  try {
    return (await call('/api/secrets')).status === 401
  } catch {
    return false
  }
}
