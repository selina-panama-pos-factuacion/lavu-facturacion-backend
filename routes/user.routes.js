import express from 'express'
import { userInfoHandler } from '../handlers/user.handlers.js'
import { validateBearerToken } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/user', validateBearerToken, userInfoHandler)

export default router
