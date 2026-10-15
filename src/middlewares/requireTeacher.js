function requireTeacher(req, res, next) {
  if (req.user?.role !== 'teacher') {
    return res.status(403).json({
      error: 'Apenas professores podem realizar esta operação.',
    });
  }

  return next();
}

module.exports = requireTeacher;