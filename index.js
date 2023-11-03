import './config/config.js'
import './config/redisClient.js'
import app from './app.js'

const PORT = 8080

app.listen(process.env.PORT || PORT, () => {
  console.log(`listening on port: ${PORT}`)
})
