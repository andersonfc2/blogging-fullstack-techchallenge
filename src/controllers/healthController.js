function getHealth(req, res) {
  return res.status(200).json({
    status: 'ok',
    message: 'API funcionando corretamente',
  });
}

module.exports = {
  getHealth,
};