const express = require("express");
const db = require("../db/connection");
const requireAuth = require("../middlewares/requireAuth");

const router = express.Router();
router.use(requireAuth);

router.get("/produtos", (req, res) => {
  const produtos = db
    .prepare(
      `SELECT p.*, f.nome_fantasia AS fornecedor_nome
       FROM produtos p
       LEFT JOIN fornecedores f ON f.id = p.fornecedor_id
       ORDER BY p.nome`
    )
    .all();
  res.json(produtos);
});

router.post("/produtos", (req, res) => {
  const { sku, nome, categoria, fornecedor_id, preco, estoque, estoque_minimo } = req.body;

  if (!sku || !nome) {
    return res.status(400).json({ erro: "SKU e nome são obrigatórios." });
  }

  try {
    const resultado = db
      .prepare(
        `INSERT INTO produtos (sku, nome, categoria, fornecedor_id, preco, estoque, estoque_minimo)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(sku, nome, categoria || null, fornecedor_id || null, preco || 0, estoque || 0, estoque_minimo || 0);

    res.status(201).json({ id: resultado.lastInsertRowid });
  } catch (erro) {
    if (erro.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ erro: "Já existe um produto com esse SKU." });
    }
    throw erro;
  }
});

router.put("/produtos/:id", (req, res) => {
  const { nome, categoria, fornecedor_id, preco, estoque, estoque_minimo } = req.body;

  const resultado = db
    .prepare(
      `UPDATE produtos
       SET nome = ?, categoria = ?, fornecedor_id = ?, preco = ?, estoque = ?, estoque_minimo = ?
       WHERE id = ?`
    )
    .run(nome, categoria || null, fornecedor_id || null, preco, estoque, estoque_minimo, req.params.id);

  if (resultado.changes === 0) {
    return res.status(404).json({ erro: "Produto não encontrado." });
  }
  res.json({ ok: true });
});

router.patch("/produtos/:id/inativar", (req, res) => {
  const resultado = db.prepare("UPDATE produtos SET ativo = 0 WHERE id = ?").run(req.params.id);

  if (resultado.changes === 0) {
    return res.status(404).json({ erro: "Produto não encontrado." });
  }
  res.json({ ok: true });
});

router.patch("/produtos/:id/reativar", (req, res) => {
  db.prepare("UPDATE produtos SET ativo = 1 WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
