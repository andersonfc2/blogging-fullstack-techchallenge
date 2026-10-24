const teacherRepository = require('../repositories/teacherRepository');

async function requireTeacher(req, res, next) {
  if (req.user?.role !== 'teacher') {
    return res.status(403).json({
      error: 'Apenas professores podem realizar esta operação.',
    });
  }

  try {
    const teacher = await teacherRepository.findById(req.user.id);
    if (!teacher) {
      return res.status(401).json({ error: 'Professor não está mais cadastrado. Faça login novamente.' });
    }
  } catch {
    return res.status(500).json({ error: 'Erro ao validar professor.' });
  }

  return next();
}

module.exports = requireTeacher;
