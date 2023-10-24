import express from 'express'
import { cierreDeDiaHandler, facturarHandler, fechaCierreDeDiaHandler, cierreDeDiaPostHandler } from '../handlers/facturar.handlers.js'
import { validateBearerToken } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/facturar', validateBearerToken, facturarHandler)
router.get('/fechaCierreDeDia', validateBearerToken, fechaCierreDeDiaHandler)
router.post('/facturarCierreDeDia', validateBearerToken, cierreDeDiaPostHandler)
router.get('/facturarCierreDeDia', cierreDeDiaHandler)

export default router
