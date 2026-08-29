const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não informado.' })
  }

  const [, token] = authHeader.split(' ')

  if (!token) {
    return res.status(401).json({ error: 'Token inválido.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    return next()
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' })
  }
}

module.exports = authMiddleware