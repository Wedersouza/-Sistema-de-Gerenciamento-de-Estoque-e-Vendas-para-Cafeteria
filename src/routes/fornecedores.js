const express = require("express");
const db = require("../db/connection");
const requireAuth = require("../middlewares/requireAuth");

const router = express.Router();
const requireAdmin = require("../middlewares/requireAdmin");
router.use(requireAuth, requireAdmin);

router.get("/fornecedores", (req, res) => {
  res.json(db.prepare("SELECT * FROM fornecedores ORDER BY nome_fantasia").all());
});

router.post("/fornecedores", (req, res) => {
  const { nome_fantasia, razao_social, cnpj, telefone, endereco } = req.body;
  if (!nome_fantasia) return res.status(400).json({ erro: "Nome fantasia é obrigatório." });

  const resultado = db
    .prepare(
      "INSERT INTO fornecedores (nome_fantasia, razao_social, cnpj, telefone, endereco) VALUES (?, ?, ?, ?, ?)"
    )
    .run(nome_fantasia, razao_social || null, cnpj || null, telefone || null, endereco || null);

  res.status(201).json({ id: resultado.lastInsertRowid });
});

router.patch("/fornecedores/:id/inativar", (req, res) => {
  const resultado = db.prepare("UPDATE fornecedores SET ativo = 0 WHERE id = ?").run(req.params.id);
  if (resultado.changes === 0) return res.status(404).json({ erro: "Fornecedor não encontrado." });
  res.json({ ok: true });
});

module.exports = router;