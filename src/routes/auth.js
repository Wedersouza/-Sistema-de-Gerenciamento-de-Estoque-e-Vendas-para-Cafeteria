const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db/connection");

const router = express.Router();

router.post("/login", (req, res) => {
  const { login, senha } = req.body;

  if (!login || !senha) {
    return res.status(400).json({ erro: "Login e senha são obrigatórios." });
  }

  const usuario = db.prepare("SELECT * FROM usuarios WHERE login = ?").get(login);

  // Mensagem genérica de propósito: não revela se o problema foi o login
  // ou a senha, nem se o usuário existe ou está inativo.
  const credenciaisInvalidas = () =>
    res.status(401).json({ erro: "Login ou senha inválidos." });

  if (!usuario) return credenciaisInvalidas();
  if (!usuario.ativo) return credenciaisInvalidas();

  const senhaCorreta = bcrypt.compareSync(senha, usuario.senha_hash);
  if (!senhaCorreta) return credenciaisInvalidas();

  // Guarda só o essencial na sessão — nunca o hash da senha.
  req.session.usuario = {
    id: usuario.id,
    nome: usuario.nome,
    perfil: usuario.perfil,
  };

  db.prepare("UPDATE usuarios SET ultimo_acesso = CURRENT_TIMESTAMP WHERE id = ?").run(usuario.id);

  res.json({ usuario: req.session.usuario });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.post("/cadastro", (req, res) => {
  const { nome, email, telefone, login, senha } = req.body;

  if (!nome || !login || !senha) {
    return res.status(400).json({ erro: "Nome, login e senha são obrigatórios." });
  }

  const jaExiste = db.prepare("SELECT id FROM usuarios WHERE login = ?").get(login);
  if (jaExiste) return res.status(409).json({ erro: "Login já está em uso." });

  const senhaHash = bcrypt.hashSync(senha, 10);
  const resultado = db
    .prepare(
      `INSERT INTO usuarios (nome, login, senha_hash, email, telefone, perfil, ativo)
       VALUES (?, ?, ?, ?, ?, 'Funcionario', 1)`
    )
    .run(nome, login, senhaHash, email || null, telefone || null);

  res.status(201).json({ id: resultado.lastInsertRowid });
});

module.exports = router;
