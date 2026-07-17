function requireAuth(req, res, next) {
  if (!req.session.usuario) {
    return res.status(401).json({ erro: "Não autenticado." });
  }
  next();
}

module.exports = requireAuth;
