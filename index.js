import './config/config.js'
import app from './app.js'

const PORT = 8080

app.listen(PORT, () => {
  console.log(`listening on port: ${PORT}`)
})
