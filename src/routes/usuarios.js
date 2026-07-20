const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db/connection");
const requireAuth = require("../middlewares/requireAuth");
const requireAdmin = require("../middlewares/requireAdmin");

const router = express.Router();
router.use(requireAuth);

router.get("/usuarios", requireAdmin, (req, res) => {
  res.json(
    db
      .prepare("SELECT id, nome, login, email, telefone, perfil, ativo, ultimo_acesso FROM usuarios ORDER BY nome")
      .all()
  );
});

router.post("/usuarios", requireAdmin, (req, res) => {
  const { nome, login, senha, email, telefone, perfil } = req.body;
  if (!nome || !login || !senha) {
    return res.status(400).json({ erro: "Nome, login e senha são obrigatórios." });
  }

  const jaExiste = db.prepare("SELECT id FROM usuarios WHERE login = ?").get(login);
  if (jaExiste) return res.status(409).json({ erro: "Login já está em uso." });

  const senhaHash = bcrypt.hashSync(senha, 10);
  const resultado = db
    .prepare(
      `INSERT INTO usuarios (nome, login, senha_hash, email, telefone, perfil, ativo)
       VALUES (?, ?, ?, ?, ?, ?, 1)`
    )
    .run(nome, login, senhaHash, email || null, telefone || null, perfil === "Administrador" ? "Administrador" : "Funcionario");

  res.status(201).json({ id: resultado.lastInsertRowid });
});

router.patch("/usuarios/:id/inativar", requireAdmin, (req, res) => {
  const resultado = db.prepare("UPDATE usuarios SET ativo = 0 WHERE id = ?").run(req.params.id);
  if (resultado.changes === 0) return res.status(404).json({ erro: "Usuário não encontrado." });
  res.json({ ok: true });
});

router.patch("/usuarios/:id/reativar", requireAdmin, (req, res) => {
  db.prepare("UPDATE usuarios SET ativo = 1 WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;