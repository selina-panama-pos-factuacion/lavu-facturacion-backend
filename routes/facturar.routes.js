import express from 'express'
import { cierreDeDiaHandler, facturarHandler, fechaCierreDeDiaHandler } from '../handlers/facturar.handlers.js'
import { validateBearerToken } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/facturar', validateBearerToken, facturarHandler)
router.get('/facturarCierreDeDia', cierreDeDiaHandler)
router.get('/fechaCierreDeDia', validateBearerToken, fechaCierreDeDiaHandler)

export default router
