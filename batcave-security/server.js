const path = require('node:path');
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

app.listen(PORT, () => console.log(`Batcave sur http://localhost:${PORT}`));
