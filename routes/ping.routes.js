import express from 'express'
import { healthHandler, pingHandler } from '../handlers/ping.handlers.js'

const router = express.Router()

router.get('/ping', pingHandler)
router.get('/ping/health', healthHandler)

export default router
