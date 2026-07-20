# Sistema de Gerenciamento de Estoque e Vendas para Cafeteria — Resumo

## 1. Tecnologias utilizadas

**Back-end**: Node.js + Express, SQLite (via `better-sqlite3`), `express-session` (autenticação/sessão), `bcryptjs` (hash de senha).
**Front-end**: HTML, CSS e JavaScript puro — sem framework, sem build step.

## 2. Funcionalidades implementadas

- Autenticação (login, logout, sessão, autocadastro sempre como Funcionário)
- Controle de acesso por perfil (Administrador x Funcionário), tanto nas telas quanto nas rotas de API
- CRUD completo de Produtos com controle de estoque (criar, listar, editar, inativar, reativar)
- Vendas com bloqueio automático por estoque insuficiente e baixa automática de estoque, usando transação (tudo-ou-nada) para garantir consistência
- Dashboard com indicadores reais (vendas do dia, pedidos, ticket médio, estoque baixo, vendas recentes, gráfico semanal)
- CRUD completo de Clientes e Fornecedores (criar, listar, editar, inativar, reativar)
- Gerenciamento de Usuários (restrito a Administrador): criar, editar, inativar, reativar, excluir
- Edição do próprio perfil e troca de senha (qualquer usuário autenticado)
- Soft delete em registros com histórico vinculado (produtos, clientes, fornecedores nunca são excluídos de fato, apenas inativados)
- Exclusão definitiva de usuários, preservando o histórico de vendas (o nome do vendedor é registrado na própria venda no momento da transação, independente da conta existir depois)

## 3. Funcionalidades previstas e não implementadas

- Promoção de um usuário já existente a Administrador (o perfil só é definido no momento da criação)
- Expiração ou regra de complexidade de senha (fora do escopo definido desde o início)

## 4. Outras funcionalidades implementadas

- Reativação de registros inativados
- Filtro de busca e por categoria nas listagens
- Exclusão definitiva de usuários com preservação de histórico

## 5. Principais desafios e dificuldades

- Os protótipos de tela vieram em um formato de ferramenta de design baseada em React, incompatível com a stack definida (JS puro). Foi necessário reescrever as nove telas preservando o visual original.
- Garantir que a baixa de estoque na venda fosse atômica (tudo-ou-nada), usando transação do SQLite, para não gerar inconsistência entre venda registrada e estoque não descontado.
- Um bug de controle de acesso: middlewares de proteção (`requireAdmin`) aplicados no nível errado do roteador acabaram bloqueando rotas que deveriam ser acessíveis a qualquer usuário logado. Identificado e corrigido durante os testes.
- Ajuste de modelagem para permitir excluir um usuário sem perder o histórico de vendas associado a ele, exigindo alteração da estrutura da tabela de vendas.

## 6. Instruções para instalação e execução

npm install
node src/db/seed.js        # cria um usuário administrador inicial
node src/db/seed-demo.js   # popula fornecedores, produtos, clientes e vendas de exemplo
npm start

Acesse `http://localhost:3000/login.html`. O banco de dados é criado a partir de `src/db/schema.sql` (executar em um cliente SQLite, como o DBeaver, antes do primeiro uso). Login padrão do administrador: `admin` / `admin123`.

## 7. Referências

- Documentação oficial do Express: https://expressjs.com
- Documentação oficial do SQLite: https://www.sqlite.org/docs.html
- Documentação do better-sqlite3: https://github.com/WiseLibs/better-sqlite3
- Documentação do express-session: https://github.com/expressjs/session
- MDN Web Docs: https://developer.mozilla.org