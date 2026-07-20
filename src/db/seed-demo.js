const db = require("./connection");

const admin = db.prepare("SELECT id, nome FROM usuarios WHERE login = ?").get("admin");
if (!admin) {
  console.log("Rode 'node src/db/seed.js' primeiro, para criar o usuário admin.");
  process.exit(1);
}

const fornecedores = [
  { nome_fantasia: "Torrefação Serra Alta", razao_social: "Serra Alta Comércio de Café Ltda.", cnpj: "12.345.678/0001-90", telefone: "(11) 3222-4400", endereco: "Rod. dos Cafezais, km 12" },
  { nome_fantasia: "Laticínios Vale Verde", razao_social: "Vale Verde Laticínios S.A.", cnpj: "23.456.789/0001-11", telefone: "(11) 3344-5566", endereco: "Estrada do Leite, 800" },
  { nome_fantasia: "Padaria Boa Hora", razao_social: "Boa Hora Panificados Ltda.", cnpj: "34.567.890/0001-22", telefone: "(11) 3455-6677", endereco: "Rua do Trigo, 210" },
];

const inserirFornecedor = db.prepare(
  "INSERT INTO fornecedores (nome_fantasia, razao_social, cnpj, telefone, endereco, ativo) VALUES (?, ?, ?, ?, ?, 1)"
);
const idsFornecedores = fornecedores.map(f =>
  inserirFornecedor.run(f.nome_fantasia, f.razao_social, f.cnpj, f.telefone, f.endereco).lastInsertRowid
);

const produtos = [
  { sku: "P001", nome: "Café expresso", categoria: "Bebidas", fornecedor_id: idsFornecedores[0], preco: 6.5, estoque: 42, estoque_minimo: 10 },
  { sku: "P002", nome: "Cappuccino 300ml", categoria: "Bebidas", fornecedor_id: idsFornecedores[0], preco: 11.9, estoque: 30, estoque_minimo: 8 },
  { sku: "P003", nome: "Leite integral 1L", categoria: "Insumos", fornecedor_id: idsFornecedores[1], preco: 6.0, estoque: 4, estoque_minimo: 10 },
  { sku: "P004", nome: "Pão de queijo (un.)", categoria: "Salgados", fornecedor_id: idsFornecedores[2], preco: 5.0, estoque: 25, estoque_minimo: 15 },
  { sku: "P005", nome: "Bolo de cenoura (fatia)", categoria: "Sobremesas", fornecedor_id: idsFornecedores[2], preco: 9.5, estoque: 18, estoque_minimo: 6 },
];

const inserirProduto = db.prepare(
  "INSERT INTO produtos (sku, nome, categoria, fornecedor_id, preco, estoque, estoque_minimo, ativo) VALUES (?, ?, ?, ?, ?, ?, ?, 1)"
);
const idsProdutos = produtos.map(p =>
  inserirProduto.run(p.sku, p.nome, p.categoria, p.fornecedor_id, p.preco, p.estoque, p.estoque_minimo).lastInsertRowid
);

const clientes = [
  { nome: "Marina Costa", telefone: "(11) 98211-4432", email: "marina.costa@email.com", endereco: "Rua das Acácias, 120" },
  { nome: "Pedro Nogueira", telefone: "(11) 97744-2210", email: "pedro.n@email.com", endereco: "Av. Brasil, 900" },
];

const inserirCliente = db.prepare(
  "INSERT INTO clientes (nome, telefone, email, endereco, ativo) VALUES (?, ?, ?, ?, 1)"
);
const idsClientes = clientes.map(c =>
  inserirCliente.run(c.nome, c.telefone, c.email, c.endereco).lastInsertRowid
);

// Gera uma data/hora no formato que o SQLite espera, X dias atrás.
function dataAtras(diasAtras, hora) {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  const dataStr = d.toISOString().slice(0, 10);
  return `${dataStr} ${hora}`;
}

const finalizarVendaDemo = db.transaction((clienteId, itens, desconto, dataHora) => {
  let total = 0;
  const precos = itens.map(i => {
    const produto = db.prepare("SELECT preco FROM produtos WHERE id = ?").get(i.produto_id);
    total += produto.preco * i.quantidade;
    return produto.preco;
  });
  total = Math.max(0, total - desconto);

  const venda = db
    .prepare("INSERT INTO vendas (cliente_id, usuario_id, usuario_nome, desconto, total, criado_em) VALUES (?, ?, ?, ?, ?, ?)")
    .run(clienteId, admin.id, admin.nome, desconto, total, dataHora);

  itens.forEach((item, i) => {
    db.prepare("INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)")
      .run(venda.lastInsertRowid, item.produto_id, item.quantidade, precos[i]);
    db.prepare("UPDATE produtos SET estoque = estoque - ? WHERE id = ?").run(item.quantidade, item.produto_id);
  });
});

// Vendas espalhadas pelos últimos 6 dias + hoje, para o gráfico semanal variar.
finalizarVendaDemo(idsClientes[0], [{ produto_id: idsProdutos[0], quantidade: 2 }, { produto_id: idsProdutos[3], quantidade: 1 }], 0, dataAtras(6, "09:15:00"));
finalizarVendaDemo(null,          [{ produto_id: idsProdutos[1], quantidade: 1 }], 0,                                      dataAtras(5, "14:40:00"));
finalizarVendaDemo(idsClientes[1],[{ produto_id: idsProdutos[4], quantidade: 2 }], 0,                                      dataAtras(4, "11:20:00"));
finalizarVendaDemo(null,          [{ produto_id: idsProdutos[0], quantidade: 3 }], 0,                                      dataAtras(3, "16:05:00"));
finalizarVendaDemo(idsClientes[0],[{ produto_id: idsProdutos[3], quantidade: 4 }], 1.5,                                    dataAtras(2, "10:30:00"));
finalizarVendaDemo(null,          [{ produto_id: idsProdutos[1], quantidade: 2 }], 0,                                      dataAtras(1, "13:50:00"));
finalizarVendaDemo(idsClientes[1],[{ produto_id: idsProdutos[0], quantidade: 1 }, { produto_id: idsProdutos[4], quantidade: 1 }], 0, dataAtras(0, "09:05:00"));
finalizarVendaDemo(null,          [{ produto_id: idsProdutos[1], quantidade: 1 }], 0,                                      dataAtras(0, "14:32:00"));

console.log("Dados de exemplo inseridos: 3 fornecedores, 5 produtos, 2 clientes, 8 vendas espalhadas pela semana.");