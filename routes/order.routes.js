import express from 'express'
import { orderInfoHandler } from '../handlers/order.handlers.js'
import { validateBearerToken } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/order/:id', validateBearerToken, orderInfoHandler)

export default router
