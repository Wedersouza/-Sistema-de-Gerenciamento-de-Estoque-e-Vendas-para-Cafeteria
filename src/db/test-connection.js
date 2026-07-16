// Script de teste isolado — não faz parte do servidor.
// Serve só para confirmar que o Node consegue abrir o database.sqlite
// e enxergar as tabelas criadas pelo schema.sql.
const db = require("./connection");

const tabelas = db
  .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
  .all();

console.log("Tabelas encontradas:", tabelas.map((t) => t.name));
