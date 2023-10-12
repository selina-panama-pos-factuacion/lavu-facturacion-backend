import Usuarios from '../models/usuarios.js'

export async function userInfoHandler(req, res) {
  try {
    const userObj = await Usuarios.findOne({ where: { id: req.userId } })
    res.json({ id: userObj.id, nombre: userObj.nombre })
  } catch (error) {
    const errorData = {
      message: 'Internal Server Error',
      error: error.message,
    }
    res.status(500).json(errorData)
  }
}
