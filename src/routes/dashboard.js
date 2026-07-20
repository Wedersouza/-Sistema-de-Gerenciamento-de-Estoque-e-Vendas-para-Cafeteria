const express = require("express");
const db = require("../db/connection");
const requireAuth = require("../middlewares/requireAuth");

const router = express.Router();
router.use(requireAuth);

router.get("/dashboard", (req, res) => {
  const hoje = db
    .prepare(
      `SELECT COALESCE(SUM(total), 0) AS totalHoje, COUNT(*) AS pedidosHoje
       FROM vendas WHERE date(criado_em) = date('now')`
    )
    .get();

  const semana = db
    .prepare(
      `SELECT date(criado_em) AS dia, SUM(total) AS total
       FROM vendas
       WHERE criado_em >= date('now', '-6 days')
       GROUP BY dia`
    )
    .all();

  const vendasRecentes = db
    .prepare(
      `SELECT v.id, v.total, v.criado_em, c.nome AS cliente_nome,
              (SELECT COUNT(*) FROM itens_venda WHERE venda_id = v.id) AS qtd_itens
       FROM vendas v
       LEFT JOIN clientes c ON c.id = v.cliente_id
       ORDER BY v.criado_em DESC
       LIMIT 5`
    )
    .all();

  const estoqueBaixo = db
    .prepare(
      `SELECT sku, nome, estoque, estoque_minimo
       FROM produtos
       WHERE ativo = 1 AND estoque < estoque_minimo
       ORDER BY estoque ASC`
    )
    .all();

  const ticketMedio = hoje.pedidosHoje > 0 ? hoje.totalHoje / hoje.pedidosHoje : 0;

  res.json({
    vendasHoje: hoje.totalHoje,
    pedidosHoje: hoje.pedidosHoje,
    ticketMedio,
    semana,
    vendasRecentes,
    estoqueBaixo,
  });
});

module.exports = router;