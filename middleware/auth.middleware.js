import { secret } from '../handlers/login.handlers.js'
import { locacionesConfig } from '../config/locacionesConfig.js'
import jwt from 'jsonwebtoken'

export function validateBearerToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization']
    let token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      token = req.query.token
      if (!token) {
        return res.status(401).json({ error: 'Bearer token inválido' })
      }
    } else {
      token = authHeader.slice(7) // Se le quita el 'Bearer '
    }

    const { userId, locacion } = validateJwtToken(token)

    req.userId = userId
    req.locacion = locacion
    req.locacionData = locacionesConfig[locacion]
    next()
  } catch (error) {
    return res.status(401).json({ error })
  }
}

function validateJwtToken(token) {
  try {
    const decodedToken = jwt.verify(token, secret)

    const isTokenExpired = Date.now() >= decodedToken.exp * 1000
    if (isTokenExpired) {
      throw new Error('el token ya expiró')
    }

    const { userId, locacion } = decodedToken

    return { userId, locacion }
  } catch (error) {
    throw new Error(`Error validando el token: ${error.message}`)
  }
}
