function requireAdmin(req, res, next) {
  if (!req.session.usuario || req.session.usuario.perfil !== "Administrador") {
    return res.status(403).json({ erro: "Acesso restrito a administradores." });
  }
  next();
}

module.exports = requireAdmin;