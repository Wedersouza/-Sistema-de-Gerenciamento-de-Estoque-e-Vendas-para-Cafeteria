// Script único, rodado manualmente uma vez, só para termos um usuário de
// teste no banco antes de a tela de cadastro existir de verdade (Etapa 8).
const bcrypt = require("bcryptjs");
const db = require("./connection");

const login = "admin";
const senha = "admin123"; // troque depois de testar, se quiser
const senhaHash = bcrypt.hashSync(senha, 10);

const jaExiste = db.prepare("SELECT id FROM usuarios WHERE login = ?").get(login);

if (jaExiste) {
  console.log("Usuário 'admin' já existe (id " + jaExiste.id + "). Nada foi inserido.");
} else {
  db.prepare(`
    INSERT INTO usuarios (nome, login, senha_hash, email, perfil, ativo)
    VALUES (?, ?, ?, ?, ?, 1)
  `).run("Administrador de Teste", login, senhaHash, "admin@torracafe.com", "Administrador");

  console.log("Usuário 'admin' criado. Login: admin / Senha: admin123");
}
