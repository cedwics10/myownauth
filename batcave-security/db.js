const path = require('node:path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, 'database.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  );
`);

module.exports = db;
