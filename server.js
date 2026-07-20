const express = require("express");
const path = require("path");
const sessionMiddleware = require("./src/middlewares/session");
const produtosRoutes = require("./src/routes/produtos");
const vendasRoutes = require("./src/routes/vendas");
const dashboardRoutes = require("./src/routes/dashboard");
const clientesRoutes = require("./src/routes/clientes");
const fornecedoresRoutes = require("./src/routes/fornecedores");
const usuariosRoutes = require("./src/routes/usuarios");
const meRoutes = require("./src/routes/me");
const authRoutes = require("./src/routes/auth");


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(sessionMiddleware);

app.use("/api", authRoutes);
app.use("/api", produtosRoutes);
app.use("/api", vendasRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", clientesRoutes);
app.use("/api", fornecedoresRoutes);
app.use("/api", usuariosRoutes);
app.use("/api", meRoutes);

const PAGINAS_PROTEGIDAS = [
  "/dashboard.html",
  "/produtos.html",
  "/vendas.html",
  "/clientes.html",
  "/fornecedores.html",
  "/usuarios.html",
  "/meu-perfil.html",
];

const PAGINAS_SO_ADMIN = ["/fornecedores.html", "/usuarios.html"];

app.use((req, res, next) => {
  if (PAGINAS_PROTEGIDAS.includes(req.path) && !req.session.usuario) {
    return res.redirect("/login.html");
  }
  if (PAGINAS_SO_ADMIN.includes(req.path) && req.session.usuario?.perfil !== "Administrador") {
    return res.redirect("/dashboard.html");
  }
  next();
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`Torra Cafeteria rodando em http://localhost:${PORT}`);
});