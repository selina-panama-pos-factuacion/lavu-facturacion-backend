import Usuarios from '../models/usuarios.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export const secret = process.env.SECRET

export async function loginHandler(req, res) {
  try {
    const { username, password } = req.body
    const usuario = await Usuarios.findOne({ where: { username } })

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidos' })
    }

    const isPasswordValid = bcrypt.compareSync(password, usuario.password)

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidos' })
    }

    const payload = { userId: usuario.id }
    const expiresInOneYear = 60 * 60 * 24 * 365

    const token = jwt.sign(payload, secret, { expiresIn: expiresInOneYear })

    res.json({ userId: usuario.id, nombre: usuario.nombre, token: token })
  } catch (error) {
    console.error('Error iniciando sesión:', error)
    return res.status(500).json({ error: 'Falló inicio de sesión' })
  }
}
