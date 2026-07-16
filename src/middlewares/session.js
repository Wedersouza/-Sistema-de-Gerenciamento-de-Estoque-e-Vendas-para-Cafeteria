const session = require("express-session");

// MemoryStore (padrão do express-session, não precisa de biblioteca extra).
// Limitação assumida: a sessão se perde se o servidor for reiniciado
// (ex: durante o desenvolvimento). Para o uso do projeto isso é aceitável;
// se sobrar tempo, trocamos por um store persistente.
const sessionMiddleware = session({
  secret: "torra-cafeteria-dev-secret", // TODO: mover para variável de ambiente antes de qualquer uso fora do ambiente local
  resave: false,
  saveUninitialized: false,
  cookie: {
    // Regra de negócio: sessão só encerra por logout manual, sem expiração
    // automática por tempo. Por isso um maxAge bem longo (30 dias), em vez
    // do padrão (sessão morre quando o navegador fecha).
    maxAge: 30 * 24 * 60 * 60 * 1000,
  },
});

module.exports = sessionMiddleware;