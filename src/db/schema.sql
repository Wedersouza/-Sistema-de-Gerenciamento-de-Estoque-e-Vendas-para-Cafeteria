-- Schema do banco de dados (SQLite) — Torra Cafeteria
-- Etapa 2 do projeto. Reflete o desenho de tabelas fechado com o usuário.

PRAGMA foreign_keys = ON;

CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  login TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  perfil TEXT NOT NULL CHECK (perfil IN ('Administrador', 'Funcionario')),
  ativo INTEGER NOT NULL DEFAULT 1,
  ultimo_acesso DATETIME
);

CREATE TABLE fornecedores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome_fantasia TEXT NOT NULL,
  razao_social TEXT,
  cnpj TEXT,
  telefone TEXT,
  endereco TEXT,
  ativo INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  ativo INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE produtos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sku TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  categoria TEXT,
  fornecedor_id INTEGER REFERENCES fornecedores(id),
  preco REAL NOT NULL DEFAULT 0,
  estoque INTEGER NOT NULL DEFAULT 0,
  estoque_minimo INTEGER NOT NULL DEFAULT 0,
  ativo INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE vendas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER REFERENCES clientes(id),   -- NULL = venda avulsa
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  desconto REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE itens_venda (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  venda_id INTEGER NOT NULL REFERENCES vendas(id),
  produto_id INTEGER NOT NULL REFERENCES produtos(id),
  quantidade INTEGER NOT NULL,
  preco_unitario REAL NOT NULL  -- preço do produto no momento da venda (não muda se o produto mudar de preço depois)
);
