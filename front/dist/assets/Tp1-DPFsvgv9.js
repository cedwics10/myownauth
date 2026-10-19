import{S as e,a as t,b as n,d as r,g as i,h as a,l as o,o as s,p as c,r as l,y as u}from"./index-BqxPjNWf.js";var d=[`id`,`aria-selected`,`aria-controls`,`tabindex`,`onClick`],f={class:`gadget-index`},p=[`id`,`aria-labelledby`],m={class:`tab-detail`},h={class:`section-heading`},g={class:`tab-detail`},_=c({__name:`Tp1`,setup(c){let _=[{title:`Phase 1 : Initialisation`,instructions:`1. Créez un dossier batcave-security. 2. À l’intérieur, initialisez un projet Node.js. 3. Installez les dépendances nécessaires : express, bcrypt et better-sqlite3. 4. Configurez votre fichier server.js et votre base de données database.db. La BDD doit contenir, à minima, une table users avec un id (PK), un username (text unique) et un password (text).`,steps:[{title:`Créez un dossier batcave-security.`,detail:`Dossier créé à la racine du dépôt.`,files:[{path:`Terminal`,note:`Création du dossier.`,code:`mkdir batcave-security
cd batcave-security`}]},{title:`À l’intérieur, initialisez un projet Node.js.`,detail:`npm init -y génère le package.json. Ensuite, main pointe vers server.js et un script start lance node --watch server.js (conseil du TP).`,files:[{path:`Terminal`,note:`Initialisation du projet.`,code:`npm init -y`}]},{title:`Installez les dépendances nécessaires : express, bcrypt et better-sqlite3.`,detail:`Les trois dépendances sont ajoutées au package.json par npm install.`,files:[{path:`Terminal`,note:`Installation des trois dépendances.`,code:`npm install express bcrypt better-sqlite3`},{path:`batcave-security/package.json`,note:`Fichier complet après les étapes 2 et 3.`,code:`{
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
}`}]},{title:`Configurez votre fichier server.js et votre base de données database.db.`,detail:`La table users contient un id (PK), un username (text unique) et un password (text). La base est dans db.js, comme dans le support de cours ; database.db est créé au premier lancement.`,files:[{path:`batcave-security/db.js`,note:`Ouvre database.db et crée la table users si elle n’existe pas.`,code:`const path = require('node:path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, 'database.db'));

db.exec(\`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  );
\`);

module.exports = db;`},{path:`batcave-security/server.js`,note:`Serveur Express relié à la base, à l’écoute sur le port 3000.`,code:`const express = require('express');
const db = require('./db');

const PORT = 3000;

const app = express();

app.listen(PORT, () => console.log(\`Batcave sur http://localhost:\${PORT}\`));`},{path:`batcave-security/.gitignore`,note:`Hors consigne : les dépendances et la base ne sont pas versionnées.`,code:`node_modules
database.db`}]}]},{title:`Phase 2 : Le registre des justiciers`,instructions:`Avant d’entrer dans le système, il faut y être enregistré ! Côté Serveur : Créez une route POST /register qui reçoit un username et un password dans le corps de la requête. Le mot de passe doit être haché avant d’être inséré dans la table users. Côté Front (Public) : Créez un fichier public/register.html avec un formulaire pour permettre à un nouveau justicier de s’inscrire. Vous pouvez utiliser un framework CSS pour le style. N’oubliez pas de traiter les données saisies par le justicier dans un fichier public/register.js.`,steps:[{title:`Côté Serveur : route POST /register`,detail:`La route lit username et password dans le corps JSON (express.json), hache le mot de passe avec bcrypt (10 salt rounds) puis l’insère dans users. Elle répond 201, ou 400 si un champ manque. express.static sert le dossier public.`,files:[{path:`batcave-security/server.js`,note:`Fichier complet après la phase 2.`,code:`const path = require('node:path');
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('./db');

const PORT = 3000;

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Nom d’utilisateur et mot de passe requis.' });
  }

  const hash = await bcrypt.hash(password, 10);
  db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hash);
  res.status(201).json({ message: 'Justicier enregistré.' });
});

app.listen(PORT, () => console.log(\`Batcave sur http://localhost:\${PORT}\`));`}]},{title:`Côté Front (Public) : formulaire d’inscription`,detail:`public/register.html contient le formulaire, stylé avec Bootstrap 5. public/register.js intercepte l’envoi, poste les données en JSON vers /register avec fetch() et affiche la réponse du serveur.`,files:[{path:`batcave-security/public/register.html`,note:`Formulaire d’inscription.`,code:`<!doctype html>
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
</html>`},{path:`batcave-security/public/register.js`,note:`Traitement des données saisies.`,code:`const form = document.getElementById('register-form');
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
    const data = await response.json();

    if (!response.ok) {
      showMessage(data.message || 'Inscription refusée.', 'danger');
      return;
    }
    showMessage(data.message, 'success');
    form.reset();
  } catch {
    showMessage('Serveur injoignable.', 'danger');
  }
});`}]}]}],v=n(0),y=n([]);function b(e){let t={ArrowRight:v.value+1,ArrowLeft:v.value-1,Home:0,End:_.length-1}[e.key];t!==void 0&&(e.preventDefault(),v.value=(t+_.length)%_.length,y.value[v.value]?.focus())}return(n,c)=>(a(),o(t,null,[c[1]||=s(`section`,{class:`page-head`},[s(`p`,{class:`eyebrow`},`TP1 // BASIC AUTH`),s(`h1`,null,[r(`Le système de sécurité de la `),s(`span`,null,`Batcave`),r(`.`)]),s(`p`,null,`Basic Auth sécurisé par Bcrypt et stocké en SQLite.`)],-1),s(`div`,{class:`tabs`,role:`tablist`,"aria-label":`Phases du TP1`,onKeydown:b},[(a(),o(t,null,i(_,(t,n)=>s(`button`,{id:`tp1-tab-${n}`,key:t.title,ref_for:!0,ref_key:`tabRefs`,ref:y,class:`tab`,type:`button`,role:`tab`,"aria-selected":v.value===n,"aria-controls":`tp1-panel-${n}`,tabindex:v.value===n?0:-1,onClick:e=>v.value=n},[s(`span`,f,`PHASE `+e(n+1)+` // FAIT`,1),r(` `+e(t.title),1)],8,d)),64))],32),(a(),o(t,null,i(_,(n,r)=>u(s(`section`,{id:`tp1-panel-${r}`,key:n.title,class:`tab-panel`,role:`tabpanel`,"aria-labelledby":`tp1-tab-${r}`},[s(`p`,m,e(n.instructions),1),(a(!0),o(t,null,i(n.steps,(n,r)=>(a(),o(`div`,{key:n.title,class:`phase-step`},[s(`div`,h,[s(`h2`,null,e(r+1)+`. `+e(n.title),1),c[0]||=s(`span`,null,`FAIT`,-1)]),s(`p`,g,e(n.detail),1),(a(!0),o(t,null,i(n.files,t=>(a(),o(`article`,{key:t.path+t.note,class:`code-card`},[s(`header`,null,[s(`h3`,null,e(t.path),1),s(`p`,null,e(t.note),1)]),s(`pre`,null,[s(`code`,null,e(t.code),1)])]))),128))]))),128))],8,p),[[l,v.value===r]])),64))],64))}});export{_ as default};