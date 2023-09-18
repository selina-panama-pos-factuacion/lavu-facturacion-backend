import express from 'express'
import { loginHandler } from '../handlers/login.handlers.js'

const router = express.Router()

router.post('/login', loginHandler)

export default router
