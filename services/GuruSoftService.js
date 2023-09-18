import axios from 'axios'
import { createClient } from 'redis'

const REDIS_PREFIX = 'bolaDeOro' // TODO: mover a un obj cuando se implemente para todas las locaciones
const BUFFER_DURATION = 5 * 60 * 1000
const baseUrl = 'https://labpa.guru-soft.com/EdocPanama/4.0' // Pruebas
const tokenUrl = `${baseUrl}/Autenticacion/Api/ServicioEDOC?Id=1`
const facutraUrl = `${baseUrl}/Emision/Api/Factura`

const redisHost = process.env.REDIS_HOST
const redisPort = process.env.REDIS_PORT
const redisUser = process.env.REDIS_USER
const redisPass = process.env.REDIS_PASS

const redisClient = createClient({
  url: `redis://${redisUser}:${redisPass}@${redisHost}:${redisPort}`,
})

redisClient
  .on('connect', function () {
    console.log('redis connected')
  })
  .on('error', function (error) {
    console.log(error)
  })

async function fetchBearerToken() {
  const username = process.env.BASIC_TOKEN_USERNAME
  const password = process.env.BASIC_TOKEN_PASSWORD
  const credentials = `${username}:${password}`
  const base64Credentials = Buffer.from(credentials).toString('base64')

  const headers = {
    Authorization: `Basic ${base64Credentials}`,
  }

  const response = await axios.get(tokenUrl, { headers })
  const { token, expira } = response.data

  await redisClient.connect()
  redisClient.set(redisKey('bearerToken'), token)
  const originalExpiryDate = new Date(expira)
  const bufferedExpiryDate = new Date(originalExpiryDate.getTime() - BUFFER_DURATION)
  redisClient.set(redisKey('expiryToken'), formatDateToCustomISO(bufferedExpiryDate))
  await redisClient.quit()

  return token
}

async function getBearerToken() {
  await redisClient.connect()
  const bearerToken = await redisClient.get(redisKey('bearerToken'))
  await redisClient.quit()
  return bearerToken
}
async function getExpiryToken() {
  await redisClient.connect()
  const bearerToken = await redisClient.get(redisKey('expiryToken'))
  await redisClient.quit()
  return bearerToken
}

async function checkTokenValidation() {
  const expiryString = await getExpiryToken()
  const expiryDate = new Date(expiryString)
  const currentDate = new Date()
  let token = ''

  if (!expiryDate || currentDate > expiryDate) {
    token = await fetchBearerToken()
  } else {
    token = await getBearerToken()
  }
  return token
}

function redisKey(key) {
  return `${REDIS_PREFIX}:${key}`
}

export async function enviarFactura(factura) {
  const bearerToken = await checkTokenValidation()
  const headers = { Authorization: `Bearer ${bearerToken}` }
  const result = await axios.post(facutraUrl, factura, { headers })

  return result.data
}

// -- Helper Functions --

function formatDateToCustomISO(date) {
  const tzo = -date.getTimezoneOffset()
  const dif = tzo >= 0 ? '+' : '-'
  const pad = function (num) {
    const norm = Math.floor(Math.abs(num))
    return (norm < 10 ? '0' : '') + norm
  }
  const milliseconds = `000${date.getMilliseconds()}`.slice(-3)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )}.${milliseconds}0000${dif}${pad(tzo / 60)}:${pad(tzo % 60)}`
}
