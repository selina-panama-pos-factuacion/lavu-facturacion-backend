import cors from 'cors'
import express from 'express'
import facturarRoutes from './routes/facturar.routes.js'
import pingRoutes from './routes/ping.routes.js'
import loginRoutes from './routes/login.routes.js'
import userRoutes from './routes/user.routes.js'
import orderRoutes from './routes/order.routes.js'

const app = express()

app.use(cors())

// Middleware
app.use(express.json())

app.use(loginRoutes)
app.use(userRoutes)
app.use(facturarRoutes)
app.use(pingRoutes)
app.use(orderRoutes)

app.use((req, res) => {
  res.status(404).json({
    message: '404 not found',
  })
})

export default app
