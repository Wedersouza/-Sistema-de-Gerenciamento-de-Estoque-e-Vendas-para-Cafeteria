const express = require("express");
const db = require("../db/connection");
const requireAuth = require("../middlewares/requireAuth");

const router = express.Router();
router.use(requireAuth);

router.get("/vendas", (req, res) => {
  const vendas = db
    .prepare(
      `SELECT v.*, c.nome AS cliente_nome, u.nome AS usuario_nome
       FROM vendas v
       LEFT JOIN clientes c ON c.id = v.cliente_id
       JOIN usuarios u ON u.id = v.usuario_id
       ORDER BY v.criado_em DESC`
    )
    .all();
  res.json(vendas);
});

const finalizarVenda = db.transaction((itens, clienteId, usuarioId, desconto) => {
  const buscarProduto = db.prepare("SELECT * FROM produtos WHERE id = ? AND ativo = 1");
  const atualizarEstoque = db.prepare("UPDATE produtos SET estoque = estoque - ? WHERE id = ?");
  const inserirItem = db.prepare(
    "INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)"
  );

  let total = 0;

  for (const item of itens) {
    const produto = buscarProduto.get(item.produto_id);
    if (!produto) throw new Error(`Produto ${item.produto_id} não encontrado.`);
    if (produto.estoque < item.quantidade) {
      throw new Error(`Estoque insuficiente para "${produto.nome}" (disponível: ${produto.estoque}).`);
    }
    total += produto.preco * item.quantidade;
  }

  total = Math.max(0, total - desconto);

  const venda = db
    .prepare("INSERT INTO vendas (cliente_id, usuario_id, desconto, total) VALUES (?, ?, ?, ?)")
    .run(clienteId, usuarioId, desconto, total);

  for (const item of itens) {
    const produto = buscarProduto.get(item.produto_id);
    inserirItem.run(venda.lastInsertRowid, item.produto_id, item.quantidade, produto.preco);
    atualizarEstoque.run(item.quantidade, item.produto_id);
  }

  return venda.lastInsertRowid;
});

router.post("/vendas", (req, res) => {
  const { itens, cliente_id, desconto } = req.body;

  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ erro: "A venda precisa ter ao menos um item." });
  }

  try {
    const vendaId = finalizarVenda(itens, cliente_id || null, req.session.usuario.id, desconto || 0);
    res.status(201).json({ id: vendaId });
  } catch (erro) {
    res.status(400).json({ erro: erro.message });
  }
});

module.exports = router;