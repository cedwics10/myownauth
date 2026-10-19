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
      <span class="gadget-index">PHASE {{ index + 1 }} // FAIT</span>
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
