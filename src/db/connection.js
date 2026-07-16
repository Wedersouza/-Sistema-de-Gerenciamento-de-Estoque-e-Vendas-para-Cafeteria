const Database = require("better-sqlite3");
const path = require("path");

// Caminho do arquivo do banco, na raiz do projeto (mesmo local que você usou no DBeaver).
const dbPath = path.join(__dirname, "..", "..", "database.sqlite");

const db = new Database(dbPath);
db.pragma("foreign_keys = ON");

module.exports = db;
