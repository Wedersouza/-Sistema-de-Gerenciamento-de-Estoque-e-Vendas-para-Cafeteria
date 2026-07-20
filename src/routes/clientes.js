const express = require("express");
const db = require("../db/connection");
const requireAuth = require("../middlewares/requireAuth");

const router = express.Router();
router.use(requireAuth);

router.get("/clientes", (req, res) => {
  res.json(db.prepare("SELECT * FROM clientes ORDER BY nome").all());
});

router.post("/clientes", (req, res) => {
  const { nome, telefone, email, endereco } = req.body;
  if (!nome) return res.status(400).json({ erro: "Nome é obrigatório." });

  const resultado = db
    .prepare("INSERT INTO clientes (nome, telefone, email, endereco) VALUES (?, ?, ?, ?)")
    .run(nome, telefone || null, email || null, endereco || null);

  res.status(201).json({ id: resultado.lastInsertRowid });
});

router.patch("/clientes/:id/inativar", (req, res) => {
  const resultado = db.prepare("UPDATE clientes SET ativo = 0 WHERE id = ?").run(req.params.id);
  if (resultado.changes === 0) return res.status(404).json({ erro: "Cliente não encontrado." });
  res.json({ ok: true });
});

module.exports = router;