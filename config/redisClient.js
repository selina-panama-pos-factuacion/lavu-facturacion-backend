import { createClient } from 'redis'

const redisHost = process.env.REDIS_HOST
const redisPort = process.env.REDIS_PORT
const redisUser = process.env.REDIS_USER
const redisPass = process.env.REDIS_PASS

const client = createClient({
  url: `redis://${redisUser}:${redisPass}@${redisHost}:${redisPort}`,
})

client.connect()

client
  .on('connect', function () {
    console.log('redis connected')
  })
  .on('error', function (error) {
    console.log(error)
  })

export default client
