const express = require("express");
const path = require("path");
const sessionMiddleware = require("./src/middlewares/session");
const authRoutes = require("./src/routes/auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(sessionMiddleware);

app.use("/api", authRoutes);

const PAGINAS_PROTEGIDAS = [
  "/dashboard.html",
  "/produtos.html",
  "/vendas.html",
  "/clientes.html",
  "/fornecedores.html",
  "/usuarios.html",
  "/meu-perfil.html",
];

app.use((req, res, next) => {
  if (PAGINAS_PROTEGIDAS.includes(req.path) && !req.session.usuario) {
    return res.redirect("/login.html");
  }
  next();
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`Torra Cafeteria rodando em http://localhost:${PORT}`);
});