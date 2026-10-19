<script setup lang="ts">
import { ref } from 'vue'

type SourceFile = { path: string; note: string; code: string }
type Step = { title: string; detail: string; files: SourceFile[] }
type Phase = { title: string; instructions: string; steps: Step[] }

const steps: Step[] = [
  {
    title: 'Créez un dossier batcave-security.',
    detail: 'Dossier créé à la racine du dépôt.',
    files: [{ path: 'Terminal', note: 'Création du dossier.', code: 'mkdir batcave-security\ncd batcave-security' }],
  },
  {
    title: 'À l’intérieur, initialisez un projet Node.js.',
    detail:
      'npm init -y génère le package.json. Ensuite, main pointe vers server.js et un script start lance node --watch server.js (conseil du TP).',
    files: [{ path: 'Terminal', note: 'Initialisation du projet.', code: 'npm init -y' }],
  },
  {
    title: 'Installez les dépendances nécessaires : express, bcrypt et better-sqlite3.',
    detail: 'Les trois dépendances sont ajoutées au package.json par npm install.',
    files: [
      { path: 'Terminal', note: 'Installation des trois dépendances.', code: 'npm install express bcrypt better-sqlite3' },
      {
        path: 'batcave-security/package.json',
        note: 'Fichier complet après les étapes 2 et 3.',
        code: `{
  "name": "batcave-security",
  "version": "1.0.0",
  "description": "",
  "main": "server.js",
  "scripts": {
    "start": "node --watch server.js",
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "bcrypt": "^6.0.0",
    "better-sqlite3": "^13.0.3",
    "express": "^5.3.0"
  }
}`,
      },
    ],
  },
  {
    title: 'Configurez votre fichier server.js et votre base de données database.db.',
    detail:
      'La table users contient un id (PK), un username (text unique) et un password (text). La base est dans db.js, comme dans le support de cours ; database.db est créé au premier lancement.',
    files: [
      {
        path: 'batcave-security/db.js',
        note: 'Ouvre database.db et crée la table users si elle n’existe pas.',
        code: `const path = require('node:path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, 'database.db'));

db.exec(\`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  );
\`);

module.exports = db;`,
      },
      {
        path: 'batcave-security/server.js',
        note: 'Serveur Express relié à la base, à l’écoute sur le port 3000.',
        code: `const express = require('express');
const db = require('./db');

const PORT = 3000;

const app = express();

app.listen(PORT, () => console.log(\`Batcave sur http://localhost:\${PORT}\`));`,
      },
      {
        path: 'batcave-security/.gitignore',
        note: 'Hors consigne : les dépendances et la base ne sont pas versionnées.',
        code: 'node_modules\ndatabase.db',
      },
    ],
  },
]

const phases: Phase[] = [
  {
    title: 'Phase 1 : Initialisation',
    instructions:
      '1. Créez un dossier batcave-security. 2. À l’intérieur, initialisez un projet Node.js. 3. Installez les dépendances nécessaires : express, bcrypt et better-sqlite3. 4. Configurez votre fichier server.js et votre base de données database.db. La BDD doit contenir, à minima, une table users avec un id (PK), un username (text unique) et un password (text).',
    steps,
  },
  {
    title: 'Phase 2 : Le registre des justiciers',
    instructions:
      'Avant d’entrer dans le système, il faut y être enregistré ! Côté Serveur : Créez une route POST /register qui reçoit un username et un password dans le corps de la requête. Le mot de passe doit être haché avant d’être inséré dans la table users. Côté Front (Public) : Créez un fichier public/register.html avec un formulaire pour permettre à un nouveau justicier de s’inscrire. Vous pouvez utiliser un framework CSS pour le style. N’oubliez pas de traiter les données saisies par le justicier dans un fichier public/register.js.',
    steps: [
      {
        title: 'Côté Serveur : route POST /register',
        detail:
          'La route lit username et password dans le corps JSON (express.json), hache le mot de passe avec bcrypt (10 salt rounds) puis l’insère dans users. Elle répond 201, 400 si un champ manque ou n’est pas du texte, et 409 si le nom d’utilisateur est déjà pris. express.static sert le dossier public.',
        files: [
          {
            path: 'batcave-security/server.js',
            note: 'Fichier complet à la fin de la phase 2.',
            code: `const path = require('node:path');
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('./db');

const PORT = 3000;

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/register', async (req, res) => {
  const { username, password } = req.body ?? {};
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    return res.status(400).json({ message: 'Nom d’utilisateur et mot de passe requis.' });
  }

  const hash = await bcrypt.hash(password, 10);
  try {
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hash);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ message: 'Ce nom d’utilisateur est déjà pris.' });
    }
    throw err;
  }
  res.status(201).json({ message: 'Justicier enregistré.' });
});

app.listen(PORT, () => console.log(\`Batcave sur http://localhost:\${PORT}\`));`,
          },
        ],
      },
      {
        title: 'Côté Front (Public) : formulaire d’inscription',
        detail:
          'public/register.html contient le formulaire, stylé avec Bootstrap 5. public/register.js intercepte l’envoi, poste les données en JSON vers /register avec fetch() et affiche la réponse du serveur.',
        files: [
          {
            path: 'batcave-security/public/register.html',
            note: 'Formulaire d’inscription.',
            code: `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Inscription — Batcave</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
</head>
<body class="bg-dark text-light">
  <main class="container py-5" style="max-width: 420px;">
    <h1 class="h3 mb-4">Registre des justiciers</h1>
    <form id="register-form" novalidate>
      <div class="mb-3">
        <label for="username" class="form-label">Nom d’utilisateur</label>
        <input type="text" id="username" name="username" class="form-control" autocomplete="username" required>
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">Mot de passe</label>
        <input type="password" id="password" name="password" class="form-control" autocomplete="new-password" required>
      </div>
      <button type="submit" class="btn btn-warning w-100">S’inscrire</button>
    </form>
    <div id="message" class="alert mt-3 d-none" role="status"></div>
  </main>
  <script src="register.js"><\/script>
</body>
</html>`,
          },
          {
            path: 'batcave-security/public/register.js',
            note: 'Traitement des données saisies.',
            code: `const form = document.getElementById('register-form');
const message = document.getElementById('message');

function showMessage(text, type) {
  message.textContent = text;
  message.className = \`alert mt-3 alert-\${type}\`;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = form.username.value;
  const password = form.password.value;

  try {
    const response = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      showMessage(data.message || 'Inscription refusée.', 'danger');
      return;
    }
    showMessage(data.message, 'success');
    form.reset();
  } catch {
    showMessage('Serveur injoignable.', 'danger');
  }
});`,
          },
        ],
      },
    ],
  },
  {
    title: 'Phase 2.1 : Robustesse du registre',
    instructions:
      'Un système de sécurité ne doit pas accepter n’importe quoi ! Améliorez votre route POST /register : Refusez l’inscription si le mot de passe ne fait pas 8 caractères ou plus ; Si un utilisateur tente de s’inscrire avec un nom d’utilisateur déjà utilisé, renvoyez un code de statut 409 Conflict au lieu de laisser le serveur crasher à cause de la contrainte SQL UNIQUE ; Assurez-vous que le nom d’utilisateur ne contient pas d’espaces (utilisez la méthode JS .trim()).',
    steps: [
      {
        title: 'Mot de passe de 8 caractères ou plus',
        detail: 'Un mot de passe de moins de 8 caractères est refusé avec un 400 avant tout hachage.',
        files: [],
      },
      {
        title: 'Nom d’utilisateur déjà utilisé : 409 Conflict',
        detail:
          'L’insertion est entourée d’un try/catch : l’erreur SQLITE_CONSTRAINT_UNIQUE devient un 409 au lieu de faire planter la requête. Toute autre erreur est relancée.',
        files: [],
      },
      {
        title: 'Pas d’espaces dans le nom d’utilisateur',
        detail:
          '.trim() retire les espaces autour du nom (« batman » et « batman » avec espaces sont le même justicier). Un nom qui contient encore un espace au milieu est refusé avec un 400.',
        files: [
          {
            path: 'batcave-security/server.js',
            note: 'Fichier complet après la phase 2.1.',
            code: `const path = require('node:path');
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('./db');

const PORT = 3000;

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/register', async (req, res) => {
  const { username: rawUsername, password } = req.body ?? {};
  const username = typeof rawUsername === 'string' ? rawUsername.trim() : '';
  if (!username || typeof password !== 'string' || !password) {
    return res.status(400).json({ message: 'Nom d’utilisateur et mot de passe requis.' });
  }
  if (/\\s/.test(username)) {
    return res.status(400).json({ message: 'Le nom d’utilisateur ne doit pas contenir d’espaces.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Le mot de passe doit faire au moins 8 caractères.' });
  }

  const hash = await bcrypt.hash(password, 10);
  try {
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hash);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ message: 'Ce nom d’utilisateur est déjà pris.' });
    }
    throw err;
  }
  res.status(201).json({ message: 'Justicier enregistré.' });
});

app.listen(PORT, () => console.log(\`Batcave sur http://localhost:\${PORT}\`));`,
          },
        ],
      },
    ],
  },
]

const active = ref(0)
const tabRefs = ref<HTMLButtonElement[]>([])

function onTabKeydown(event: KeyboardEvent) {
  const moves: Record<string, number> = {
    ArrowRight: active.value + 1,
    ArrowLeft: active.value - 1,
    Home: 0,
    End: phases.length - 1,
  }
  const next = moves[event.key]
  if (next === undefined) return
  event.preventDefault()
  active.value = (next + phases.length) % phases.length
  tabRefs.value[active.value]?.focus()
}
</script>

<template>
  <section class="page-head">
    <p class="eyebrow">TP1 // BASIC AUTH</p>
    <h1>Le système de sécurité de la <span>Batcave</span>.</h1>
    <p>Basic Auth sécurisé par Bcrypt et stocké en SQLite.</p>
  </section>

  <div class="tabs" role="tablist" aria-label="Phases du TP1" @keydown="onTabKeydown">
    <button
      v-for="(phase, index) in phases"
      :id="`tp1-tab-${index}`"
      :key="phase.title"
      ref="tabRefs"
      class="tab"
      type="button"
      role="tab"
      :aria-selected="active === index"
      :aria-controls="`tp1-panel-${index}`"
      :tabindex="active === index ? 0 : -1"
      @click="active = index"
    >
      <span class="gadget-index">FAIT</span>
      {{ phase.title }}
    </button>
  </div>

  <section
    v-for="(phase, index) in phases"
    v-show="active === index"
    :id="`tp1-panel-${index}`"
    :key="phase.title"
    class="tab-panel"
    role="tabpanel"
    :aria-labelledby="`tp1-tab-${index}`"
  >
    <p class="tab-detail">{{ phase.instructions }}</p>
    <div v-for="(step, stepIndex) in phase.steps" :key="step.title" class="phase-step">
      <div class="section-heading">
        <h2>{{ stepIndex + 1 }}. {{ step.title }}</h2>
        <span>FAIT</span>
      </div>
      <p class="tab-detail">{{ step.detail }}</p>
      <article v-for="file in step.files" :key="file.path + file.note" class="code-card">
        <header>
          <h3>{{ file.path }}</h3>
          <p>{{ file.note }}</p>
        </header>
        <pre><code>{{ file.code }}</code></pre>
      </article>
    </div>
  </section>
</template>
