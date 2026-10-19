<script setup lang="ts">
import { computed, ref } from 'vue'

import { basicHeader, call, credentials, DIRECT_URL, isOnline, type Reply } from '../batcaveSecurity'

const props = defineProps<{ phase: '3' | '3.1' | '3.2' }>()

type State = 'idle' | 'running' | 'success' | 'error'
type Result = { ok: boolean; got: string }
type Check = { label: string; expected: string; run: () => Promise<Result> }
type Row = { label: string; expected: string; got: string; state: State }

type Gadget = { name: string; desc: string; icon: string }
type Me = { id: number; username: string }
type Report = { id: number; userId: number; content: string; createdAt: string }

const rows = ref<Row[]>([])
const running = ref(false)
const status = ref('')
const statusType = ref<'success' | 'error' | ''>('')
const gadgets = ref<Gadget[]>([])
const me = ref<Me | null>(null)
const report = ref<Report | null>(null)
const reportContent = ref('Rapport de vérification : patrouille terminée dans le secteur nord de Gotham.')
let pageHtml: string | null = null

const badges: Record<State, string> = { idle: 'ATTENTE', running: 'EN COURS', success: 'OK', error: 'ÉCHEC' }
const passed = computed(() => rows.value.filter((row) => row.state === 'success').length)
const failed = computed(() => rows.value.some((row) => row.state === 'error'))

const authorization = computed(() => basicHeader(credentials.username, credentials.password))
const decodedPreview = computed(() => `${credentials.username}:${'•'.repeat(credentials.password.length)}`)

const isGadgetList = (data: unknown): data is Gadget[] =>
  Array.isArray(data) &&
  data.length > 0 &&
  data.every((g) => typeof g?.name === 'string' && typeof g?.desc === 'string' && typeof g?.icon === 'string')
const isMe = (data: unknown): data is Me =>
  typeof (data as Me)?.id === 'number' && typeof (data as Me)?.username === 'string'
const isReport = (data: unknown): data is Report =>
  typeof (data as Report)?.id === 'number' && typeof (data as Report)?.userId === 'number'

const expectStatus = (reply: Reply, expected: number): Result => ({
  ok: reply.status === expected,
  got: String(reply.status),
})

async function fetchGadgets(): Promise<Result> {
  const reply = await call('/api/secrets', { authorization: authorization.value })
  if (reply.status === 200 && isGadgetList(reply.data)) {
    gadgets.value = reply.data
    return { ok: true, got: `200, ${reply.data.length} gadgets` }
  }
  return { ok: false, got: String(reply.status) }
}

// Vérifie le contenu de private/bat-computer.html, servi par GET /bat-computer.
function pageContains(needle: string | RegExp) {
  return async (): Promise<Result> => {
    if (pageHtml === null) {
      const reply = await call('/bat-computer', { authorization: authorization.value })
      pageHtml = reply.status === 200 ? reply.text : ''
    }
    const ok = typeof needle === 'string' ? pageHtml.includes(needle) : needle.test(pageHtml)
    return { ok, got: ok ? 'trouvé' : pageHtml ? 'absent' : 'page inaccessible' }
  }
}

function checksFor(phase: typeof props.phase): Check[] {
  const auth = authorization.value
  const wrongAuth = basicHeader(credentials.username, `${credentials.password}-faux`)

  if (phase === '3') {
    return [
      {
        label: 'Sans en-tête Authorization → GET /api/secrets',
        expected: '401',
        run: async () => expectStatus(await call('/api/secrets'), 401),
      },
      {
        label: 'Le 401 renvoie l’en-tête WWW-Authenticate',
        expected: 'Basic realm=…',
        run: async () => {
          const reply = await call('/api/secrets')
          return { ok: /^Basic /i.test(reply.wwwAuthenticate ?? ''), got: reply.wwwAuthenticate ?? 'absent' }
        },
      },
      {
        label: 'Schéma autre que Basic (Bearer)',
        expected: '401',
        run: async () => expectStatus(await call('/api/secrets', { authorization: 'Bearer batsignal' }), 401),
      },
      {
        label: 'Base64 invalide',
        expected: '401',
        run: async () => expectStatus(await call('/api/secrets', { authorization: 'Basic !!!!' }), 401),
      },
      {
        label: 'Mauvais mot de passe (comparaison avec la base)',
        expected: '401',
        run: async () => expectStatus(await call('/api/secrets', { authorization: wrongAuth }), 401),
      },
      { label: 'Bons identifiants → GET /api/secrets', expected: '200, tableau { name, desc, icon }', run: fetchGadgets },
      {
        label: 'Sans identifiants → GET /bat-computer',
        expected: '401',
        run: async () => expectStatus(await call('/bat-computer'), 401),
      },
      {
        label: 'Bons identifiants → GET /bat-computer',
        expected: '200, text/html',
        run: async () => {
          const reply = await call('/bat-computer', { authorization: auth })
          const type = reply.contentType.split(';')[0] || '—'
          return { ok: reply.status === 200 && type === 'text/html', got: `${reply.status}, ${type}` }
        },
      },
      {
        label: 'Fichier hors du dossier public → /private/bat-computer.html',
        expected: '404',
        run: async () => expectStatus(await call('/private/bat-computer.html', { authorization: auth }), 404),
      },
    ]
  }

  if (phase === '3.1') {
    return [
      {
        label: 'Sans en-tête → GET /api/me',
        expected: '401',
        run: async () => expectStatus(await call('/api/me'), 401),
      },
      {
        label: 'Avec identifiants → GET /api/me',
        expected: `{ id, username: "${credentials.username}" }`,
        run: async () => {
          const reply = await call('/api/me', { authorization: auth })
          if (reply.status === 200 && isMe(reply.data) && reply.data.username === credentials.username) {
            me.value = reply.data
            return { ok: true, got: JSON.stringify(reply.data) }
          }
          return { ok: false, got: reply.status === 200 ? JSON.stringify(reply.data) : String(reply.status) }
        },
      },
      { label: 'La page appelle GET /api/me', expected: '/api/me présent', run: pageContains('/api/me') },
      {
        label: 'La page affiche « Bienvenue, Justicier … »',
        expected: 'texte présent',
        run: pageContains('Bienvenue, Justicier'),
      },
      {
        label: 'Sans en-tête → POST /api/reports',
        expected: '401',
        run: async () => expectStatus(await call('/api/reports', { method: 'POST', body: { content: 'x' } }), 401),
      },
      {
        label: 'Rapport vide → POST /api/reports',
        expected: '400',
        run: async () =>
          expectStatus(await call('/api/reports', { method: 'POST', authorization: auth, body: { content: '   ' } }), 400),
      },
      {
        label: 'Rapport → POST /api/reports, lié à votre id',
        expected: me.value ? `201, userId = ${me.value.id}` : '201, userId = votre id',
        run: async () => {
          const reply = await call('/api/reports', {
            method: 'POST',
            authorization: auth,
            body: { content: reportContent.value },
          })
          if (reply.status !== 201 || !isReport(reply.data)) return { ok: false, got: String(reply.status) }
          report.value = reply.data
          if (!me.value) return { ok: false, got: `201, userId = ${reply.data.userId} (GET /api/me a échoué)` }
          return { ok: reply.data.userId === me.value.id, got: `201, userId = ${reply.data.userId}` }
        },
      },
    ]
  }

  return [
    {
      label: 'Sans en-tête : le navigateur ne l’ajoute pas tout seul',
      expected: '401',
      run: async () => expectStatus(await call('/api/secrets'), 401),
    },
    { label: 'En-tête injecté à la main → GET /api/secrets', expected: '200, tableau de gadgets', run: fetchGadgets },
    { label: 'La page appelle GET /api/secrets', expected: '/api/secrets présent', run: pageContains('/api/secrets') },
    {
      label: 'La page injecte l’en-tête Authorization',
      expected: "headers.set('Authorization', …)",
      run: pageContains("headers.set('Authorization'"),
    },
    {
      label: 'La page génère les cartes dans le DOM',
      expected: 'createElement / innerHTML',
      run: pageContains(/createElement\(|innerHTML|insertAdjacentHTML/),
    },
    {
      label: 'L’arsenal est affiché en grille',
      expected: 'display: grid ou flex',
      run: pageContains(/display:\s*(grid|flex)/),
    },
  ]
}

async function verify() {
  status.value = ''
  if (!credentials.username || !credentials.password) {
    status.value = 'Saisissez le nom et le mot de passe d’un justicier inscrit.'
    statusType.value = 'error'
    return
  }

  running.value = true
  rows.value = []
  gadgets.value = []
  me.value = null
  report.value = null
  pageHtml = null

  if (!(await isOnline())) {
    status.value =
      'Serveur batcave-security injoignable : docker compose up -d --build, ou npm start dans batcave-security/ avec npm run dev.'
    statusType.value = 'error'
    running.value = false
    return
  }

  const checks = checksFor(props.phase)
  rows.value = checks.map(({ label, expected }) => ({ label, expected, got: '', state: 'idle' }))
  for (const [index, check] of checks.entries()) {
    const row = rows.value[index]
    if (!row) continue
    row.state = 'running'
    try {
      const result = await check.run()
      row.got = result.got
      row.state = result.ok ? 'success' : 'error'
    } catch {
      row.got = 'erreur réseau'
      row.state = 'error'
    }
    // L'attendu peut dépendre d'un résultat précédent (id renvoyé par /api/me).
    row.expected = checksFor(props.phase)[index]?.expected ?? row.expected
  }

  status.value = `${passed.value}/${rows.value.length} vérifications réussies.`
  statusType.value = failed.value ? 'error' : 'success'
  running.value = false
}

async function register() {
  status.value = ''
  if (!credentials.username || !credentials.password) {
    status.value = 'Saisissez un nom et un mot de passe à enregistrer.'
    statusType.value = 'error'
    return
  }
  try {
    const reply = await call('/register', {
      method: 'POST',
      body: { username: credentials.username, password: credentials.password },
    })
    const message = (reply.data as { message?: string } | null)?.message
    status.value = message ?? `Réponse ${reply.status}.`
    statusType.value = reply.status === 201 ? 'success' : 'error'
  } catch {
    status.value = 'Serveur batcave-security injoignable.'
    statusType.value = 'error'
  }
}

function formatDate(value: string) {
  return new Date(`${value.replace(' ', 'T')}Z`).toLocaleString('fr-FR')
}
</script>

<template>
  <section class="verifier" :aria-label="`Vérification de la phase ${phase}`">
    <form class="panel-form" @submit.prevent="verify">
      <p class="panel-label">Vérification en direct contre batcave-security</p>
      <div class="verifier-fields">
        <div>
          <label :for="`verifier-username-${phase}`">Nom d’utilisateur</label>
          <input
            :id="`verifier-username-${phase}`"
            v-model.trim="credentials.username"
            type="text"
            autocomplete="username"
          />
        </div>
        <div>
          <label :for="`verifier-password-${phase}`">Mot de passe</label>
          <input
            :id="`verifier-password-${phase}`"
            v-model="credentials.password"
            type="password"
            autocomplete="current-password"
          />
        </div>
      </div>
      <template v-if="phase === '3.1'">
        <label :for="`verifier-report-${phase}`">Note de mission envoyée à POST /api/reports</label>
        <textarea :id="`verifier-report-${phase}`" v-model="reportContent" rows="2" maxlength="2000" />
      </template>
      <div class="verifier-actions">
        <button class="button button-primary" type="submit" :disabled="running">
          {{ running ? 'Vérification…' : 'Lancer la vérification' }}
        </button>
        <button class="button button-quiet" type="button" :disabled="running" @click="register">Créer ce compte</button>
        <a class="button button-quiet" :href="`${DIRECT_URL}/bat-computer`" target="_blank" rel="noopener">
          Ouvrir le Bat-Ordinateur ↗
        </a>
      </div>
      <p v-if="status" class="form-status" :data-state="statusType" role="status">{{ status }}</p>
    </form>

    <template v-if="rows.length">
      <div class="check-summary">
        <div class="check-meter" :data-failed="failed">
          <span :style="{ width: `${(passed / rows.length) * 100}%` }" />
        </div>
        <span>{{ passed }}/{{ rows.length }}</span>
      </div>
      <ol class="check-list">
        <li v-for="row in rows" :key="row.label">
          <span class="check-badge" :data-state="row.state">{{ badges[row.state] }}</span>
          <span>{{ row.label }}</span>
          <span class="check-value"><small>Attendu</small>{{ row.expected }}</span>
          <span class="check-value"><small>Obtenu</small>{{ row.got || '—' }}</span>
        </li>
      </ol>
      <p v-if="phase === '3.1'" class="check-note">
        La clé étrangère reports.user_id → users.id se vérifie dans la base : ici, on contrôle que le rapport
        revient bien avec l’id de l’utilisateur connecté.
      </p>
    </template>

    <section v-if="phase === '3' && gadgets.length" class="check-visual">
      <div class="section-heading">
        <h2>Réponse de GET /api/secrets</h2>
        <span>{{ gadgets.length }} objets JSON</span>
      </div>
      <table class="check-table">
        <thead>
          <tr><th scope="col">name</th><th scope="col">desc</th><th scope="col">icon</th></tr>
        </thead>
        <tbody>
          <tr v-for="gadget in gadgets" :key="gadget.name">
            <td>{{ gadget.name }}</td>
            <td>{{ gadget.desc }}</td>
            <td>{{ gadget.icon }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section v-if="phase === '3.1' && (me || report)" class="check-visual">
      <div class="section-heading">
        <h2>Rendu</h2>
        <span>GET /api/me · POST /api/reports</span>
      </div>
      <div v-if="me" class="welcome-banner">
        <span class="panel-label">Réponse de GET /api/me : id {{ me.id }}</span>
        <strong>Bienvenue, Justicier {{ me.username }}</strong>
      </div>
      <ol v-if="report" class="report-list">
        <li>
          <span class="gadget-index">
            Rapport #{{ report.id }} // userId {{ report.userId }} // {{ formatDate(report.createdAt) }}
          </span>
          <p>{{ report.content }}</p>
        </li>
      </ol>
    </section>

    <section v-if="phase === '3.2'" class="check-visual">
      <div class="section-heading">
        <h2>En-tête envoyé par fetch()</h2>
        <span>construit à la main</span>
      </div>
      <div class="header-preview">
        <p>Authorization: {{ credentials.username ? authorization : 'Basic …' }}</p>
        <p>Base64 décodé : {{ credentials.username ? decodedPreview : '—' }}</p>
      </div>
      <template v-if="gadgets.length">
        <div class="section-heading check-visual">
          <h2>Arsenal généré dans le DOM</h2>
          <span>grille CSS Grid · {{ gadgets.length }} cartes</span>
        </div>
        <div class="gadget-grid">
          <article v-for="(gadget, index) in gadgets" :key="gadget.name" class="gadget-card">
            <span class="gadget-index">GADGET {{ String(index + 1).padStart(2, '0') }}</span>
            <span class="gadget-icon" aria-hidden="true">◆</span>
            <h3>{{ gadget.name }}</h3>
            <p>{{ gadget.desc }}</p>
            <small>{{ gadget.icon }}</small>
          </article>
        </div>
      </template>
    </section>
  </section>
</template>
