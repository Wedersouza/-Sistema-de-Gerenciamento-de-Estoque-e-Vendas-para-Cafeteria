const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db/connection");
const requireAuth = require("../middlewares/requireAuth");

const router = express.Router();
router.use(requireAuth);

router.get("/me", (req, res) => {
  res.json(
    db.prepare("SELECT id, nome, login, email, telefone, perfil FROM usuarios WHERE id = ?").get(req.session.usuario.id)
  );
});

router.put("/me", (req, res) => {
  const { nome, email, telefone } = req.body;
  db.prepare("UPDATE usuarios SET nome = ?, email = ?, telefone = ? WHERE id = ?")
    .run(nome, email || null, telefone || null, req.session.usuario.id);
  req.session.usuario.nome = nome;
  res.json({ ok: true });
});

router.put("/me/senha", (req, res) => {
  const { senhaAtual, novaSenha } = req.body;
  const usuario = db.prepare("SELECT * FROM usuarios WHERE id = ?").get(req.session.usuario.id);

  if (!bcrypt.compareSync(senhaAtual, usuario.senha_hash)) {
    return res.status(401).json({ erro: "Senha atual incorreta." });
  }

  const novoHash = bcrypt.hashSync(novaSenha, 10);
  db.prepare("UPDATE usuarios SET senha_hash = ? WHERE id = ?").run(novoHash, req.session.usuario.id);
  res.json({ ok: true });
});

module.exports = router;