import express from 'express'
import { cierreDeDiaHandler, facturarHandler } from '../handlers/facturar.handlers.js'
import { validateBearerToken } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/facturar', validateBearerToken, facturarHandler)
router.get('/facturarCierreDeDia', validateBearerToken, cierreDeDiaHandler)

export default router
