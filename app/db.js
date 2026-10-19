const path = require('node:path');
const Database = require('better-sqlite3');

const db = new Database(process.env.DB_PATH || path.join(__dirname, 'database.db'));

// Anciennes bases : suppression des comptes utilisateurs et du lien rapport → utilisateur.
const reportColumns = db.prepare('PRAGMA table_info(reports)').all().map((column) => column.name);
if (reportColumns.includes('user_id')) {
  db.exec(`
    CREATE TABLE reports_new (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    INSERT INTO reports_new (id, content, created_at) SELECT id, content, created_at FROM reports;
    DROP TABLE reports;
    ALTER TABLE reports_new RENAME TO reports;
  `);
}
db.exec('DROP TABLE IF EXISTS users');

db.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

module.exports = db;
