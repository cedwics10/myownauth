const express = require('express');
const db = require('./db');

const PORT = process.env.PORT || 3000;

const GADGETS = [
  { name: 'Batarang', description: 'Projectile aérodynamique à retour, lame rétractable.' },
  { name: 'Grappin', description: 'Lanceur à câble haute tension, portée 80 mètres.' },
  { name: 'Batmobile', description: 'Véhicule blindé à propulsion turbine.' },
  { name: 'Ceinture utilitaire', description: 'Compartiments modulaires, accès en une seconde.' },
  { name: 'Vision nocturne', description: 'Capteurs thermiques et infrarouges intégrés au masque.' },
  { name: 'Bombe fumigène', description: 'Écran de fumée opaque pour une sortie discrète.' },
];

const app = express();
app.use(express.json({ limit: '20kb' }));

app.get('/api/secrets', (req, res) => res.json({ gadgets: GADGETS }));

app.get('/api/reports', (req, res) => {
  const reports = db.prepare('SELECT id, content, created_at AS createdAt FROM reports ORDER BY id DESC').all();
  res.json({ reports });
});

app.post('/api/reports', (req, res) => {
  const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';
  if (!content) return res.status(400).json({ message: 'Le rapport ne peut pas être vide.' });
  if (content.length > 2000) return res.status(400).json({ message: 'Rapport limité à 2000 caractères.' });

  const { lastInsertRowid } = db.prepare('INSERT INTO reports (content) VALUES (?)').run(content);
  const report = db
    .prepare('SELECT id, content, created_at AS createdAt FROM reports WHERE id = ?')
    .get(lastInsertRowid);
  res.status(201).json({ message: 'Rapport transmis.', report });
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'JSON invalide.' });
  console.error(err);
  res.status(500).json({ message: 'Erreur interne.' });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Batcave API sur http://localhost:${PORT}`));
}

module.exports = app;
