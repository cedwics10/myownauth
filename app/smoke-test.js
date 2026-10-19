// Vérifie les routes de l'API sur un port libre : node smoke-test.js
const app = require('./server');
const db = require('./db');

const server = app.listen(0, async () => {
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (body) => fetch(`${base}/api/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const results = {};
  const secrets = await fetch(`${base}/api/secrets`);
  results.secrets = secrets.status;
  results.gadgets = (await secrets.json()).gadgets.length;

  const created = await post({ content: 'smoke-test' });
  results.createReport = created.status;
  const { report } = await created.json();
  results.emptyReport = (await post({ content: '  ' })).status;
  results.listReports = (await fetch(`${base}/api/reports`)).status;
  results.removedRoutes = {
    register: (await fetch(`${base}/register`, { method: 'POST' })).status,
    me: (await fetch(`${base}/api/me`)).status,
  };

  db.prepare('DELETE FROM reports WHERE id = ?').run(report.id);
  console.log(JSON.stringify(results, null, 2));
  server.close();
});
