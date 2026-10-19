const path = require('node:path');
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('./db');

const PORT = 3000;

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const gadgets = [
  { name: 'Batarang', desc: 'Arme de jet', icon: 'fa-star' },
  { name: 'Grappin', desc: 'Lance-câble pour atteindre les toits', icon: 'fa-anchor' },
  { name: 'Batmobile', desc: 'Véhicule blindé', icon: 'fa-car' },
  { name: 'Ceinture utilitaire', desc: 'Rangement de tous les gadgets', icon: 'fa-toolbox' },
  { name: 'Bombe fumigène', desc: 'Couverture pour disparaître', icon: 'fa-smog' },
];

// Hash comparé quand l'utilisateur n'existe pas : bcrypt tourne dans tous les cas,
// le temps de réponse ne révèle donc pas si le nom d'utilisateur existe.
const DUMMY_HASH = bcrypt.hashSync('batcave-dummy-password', 10);

function denyAccess(res) {
  res.set('WWW-Authenticate', 'Basic realm="Batcave", charset="UTF-8"');
  res.status(401).json({ message: 'Accès refusé.' });
}

async function basicAuth(req, res, next) {
  const [scheme, encoded] = (req.headers.authorization ?? '').trim().split(/\s+/);
  if (scheme.toLowerCase() !== 'basic' || !encoded) {
    return denyAccess(res);
  }

  const credentials = Buffer.from(encoded, 'base64').toString('utf8');
  const separator = credentials.indexOf(':');
  if (separator === -1) {
    return denyAccess(res);
  }
  const username = credentials.slice(0, separator);
  const password = credentials.slice(separator + 1);

  const user = db.prepare('SELECT id, username, password FROM users WHERE username = ?').get(username);
  const passwordMatches = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
  if (!user || !passwordMatches) {
    return denyAccess(res);
  }
  req.user = { id: user.id, username: user.username };
  next();
}

app.post('/register', async (req, res) => {
  const { username: rawUsername, password } = req.body ?? {};
  const username = typeof rawUsername === 'string' ? rawUsername.trim() : '';
  if (!username || typeof password !== 'string' || !password) {
    return res.status(400).json({ message: 'Nom d’utilisateur et mot de passe requis.' });
  }
  if (/\s/.test(username)) {
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

app.get('/bat-computer', basicAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'private', 'bat-computer.html'));
});

app.get('/api/secrets', basicAuth, (req, res) => {
  res.json(gadgets);
});

app.get('/api/me', basicAuth, (req, res) => {
  res.json({ id: req.user.id, username: req.user.username });
});

app.post('/api/reports', basicAuth, (req, res) => {
  const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';
  if (!content) {
    return res.status(400).json({ message: 'Le rapport ne peut pas être vide.' });
  }
  if (content.length > 2000) {
    return res.status(400).json({ message: 'Le rapport ne doit pas dépasser 2000 caractères.' });
  }

  const { lastInsertRowid } = db
    .prepare('INSERT INTO reports (user_id, content) VALUES (?, ?)')
    .run(req.user.id, content);
  const report = db
    .prepare('SELECT id, user_id AS userId, content, created_at AS createdAt FROM reports WHERE id = ?')
    .get(lastInsertRowid);
  res.status(201).json(report);
});

app.listen(PORT, () => console.log(`Batcave sur http://localhost:${PORT}`));
