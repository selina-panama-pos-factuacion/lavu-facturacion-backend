import { getJsonForGuruSoft, padNumberWithZeros } from '../util/LavuToGuruSoft.js'
import { getRowValue } from '../util/LavuOrderUtils.js'
import { enviarFactura } from '../services/GuruSoftService.js'
import { sendMail } from '../mailer/mailer.js'
import LavuService from '../services/LavuService.js'
import Cierres from '../models/cierres.js'
import FacturasContribuyentes from '../models/facturas_contribuyentes.js'
import moment from 'moment'

export async function facturarHandler(req, res) {
  try {
    const { locacion, locacionData } = req
    const { orderId } = req.body

    if (!orderId) {
      return res.status(400).json({ message: 'No hay numero de orden' })
    }

    const { jsonToGuruSoft, consecutivoObj } = await getJsonForGuruSoft(req.body, locacion, locacionData)
    console.log('🚀 ~ file: facturar.handlers.js:17 ~ facturarHandler ~ jsonToGuruSoft:', JSON.stringify(jsonToGuruSoft))
    let resultadoFactura = await enviarFactura(jsonToGuruSoft, locacionData)

    if (resultadoFactura.Estado === '15') {
      // Documento duplicado, se actualiza consecutivo y se intenta de nuevo
      const newConsecutivo = Number(consecutivoObj.consecutivo) + 1
      await consecutivoObj.update({ consecutivo: newConsecutivo })
      jsonToGuruSoft.dNroDF = padNumberWithZeros(consecutivoObj.consecutivo, 10)
      console.log('🚀 ~ file: facturar.handlers.js:17 ~ facturarHandler ~ jsonToGuruSoft:', JSON.stringify(jsonToGuruSoft))
      resultadoFactura = await enviarFactura(jsonToGuruSoft)
    }

    if (resultadoFactura.Estado === '2') {
      // Se emitió exitosamente la factura
      const newConsecutivo = Number(consecutivoObj.consecutivo) + 1
      await consecutivoObj.update({ consecutivo: newConsecutivo })

      // Se agrega a la tabla para que se ignore en le cierre de dia
      FacturasContribuyentes.create({
        order: orderId,
        locacion,
      })

      return res.json(resultadoFactura)
    } else {
      return res.status(500).json(resultadoFactura)
    }
  } catch (e) {
    console.log('🚀 ~ file: facturar.handlers.js:48 ~ facturarHandler ~ e:', e)
    const axiosResponse = {
      status: e.response.status,
      statusText: e.response.statusText,
      data: e.response.data,
    }
    console.log('Error: ', axiosResponse)
    return res.status(500).json(axiosResponse)
  }
}

export async function cierreDeDiaHandler(req, res) {
  const { locacion, locacionData } = req
  const { envPrefix } = locacionData
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  let isConnectionOpen = true

  req.on('close', () => {
    console.log('--- CONEXION CERRADA POR CLIENTE ---')
    res.end()
    isConnectionOpen = false
  })

  try {
    let orderCount = 0
    let lastDate = ''

    const cierreObj = await Cierres.findOne({ where: { locacion } })
    const endDate = moment().subtract(5, 'hours').format('YYYY-MM-DD HH:mm:ss')

    let orders = await LavuService.getEndOfDayOrders(cierreObj.ultimo, endDate, envPrefix)
    let totalOrders = []

    while (!!orders.elements && orders.elements.length > 1 && isConnectionOpen) {
      totalOrders.push(...orders.elements)
      orderCount += orders.elements.length
      lastDate = getRowValue(orders.elements[orders.elements.length - 1], 'closed')
      orders = await LavuService.getEndOfDayOrders(lastDate, endDate, envPrefix)
    }

    const ordenesExito = []
    const ordenesError = []
    const ordenesEnCero = []

    let progress = 0
    const progressIncrement = 100 / totalOrders.length

    for (const order of totalOrders) {
      if (!isConnectionOpen) break

      const orderId = getRowValue(order, 'order_id')
      console.log(`|-- EN PROCESO: ${orderId} --|`)
      const facturada = await FacturasContribuyentes.findOne({ where: { order: orderId, locacion } })
      if (facturada) {
        console.log('---- YA FUE FACTURADA COMO CONTRIBUYENTE ----')
        continue
      }

      console.log('----- INICIA FACTURA ------')
      const total = getRowValue(order, 'total')
      const orderStatus = getRowValue(order, 'ordder_status')

      if (total === '0.00' || orderStatus === 'voided') {
        ordenesEnCero.push(orderId)
        console.log('ORDEN EN CERO: ', orderId)
      } else {
        try {
          const { jsonToGuruSoft, consecutivoObj } = await getJsonForGuruSoft({ orderId, esConsumidorFinal: true }, locacion, locacionData)
          console.log('JSON hacia GS: ', JSON.stringify(jsonToGuruSoft))
          const resultadoFactura = await enviarFactura(jsonToGuruSoft, locacionData)
          console.log('Respuesta de GS: ', JSON.stringify(resultadoFactura))

          if (resultadoFactura && resultadoFactura.Estado === '2') {
            // Se emitió exitosamente la factura
            ordenesExito.push(orderId)
            console.log('FACTURA CON EXITO: ', orderId)
          } else {
            console.log('---FACTURA CON ERROR: ', orderId)
            ordenesError.push(orderId)
          }
          const newConsecutivo = Number(consecutivoObj.consecutivo) + 1
          await consecutivoObj.update({ consecutivo: newConsecutivo })
        } catch (error) {
          console.log('--ERROR--', error.message)
          console.log('---FACTURA CON ERROR: ', orderId)
          ordenesError.push(orderId)
        }

        console.log('----- FINALIZA FACTURA ------')
      }

      const orderClosed = getRowValue(order, 'closed')
      await cierreObj.update({ ultimo: orderClosed })

      console.log('ORDENES EXITO: ', ordenesExito.length)
      console.log('ORDENES EN CERO: ', ordenesEnCero.length)
      console.log('ORDENES ERROR: ', ordenesError.length)
      progress += progressIncrement
      const progressRoundUp = Math.ceil(progress)
      res.write(`data: {"progress": ${progressRoundUp > 100 ? 100 : progressRoundUp}}\n\n`)
    }

    console.log('----- FINALIZA PROCESO ------')
    res.write(
      `data: ${JSON.stringify({
        progress: 100,
        completed: true,
        ordenesExito: { ordenes: ordenesExito, count: ordenesExito.length },
        ordenesError: { ordenes: ordenesError, count: ordenesError.length },
      })}\n\n`
    )
    res.end()
  } catch (error) {
    const errorData = {
      message: 'Internal Server Error',
      error: error.message,
    }
    res.write(`data: ${JSON.stringify(errorData)}\n\n`)
    res.end()
  }
}

export async function cierreDeDiaPostHandler(req, res) {
  const { locacion, locacionData } = req
  const { envPrefix } = locacionData

  try {
    let orderCount = 0
    let lastDate = ''

    const cierreObj = await Cierres.findOne({ where: { locacion } })
    // const endDate = moment().subtract(5, 'hours').format('YYYY-MM-DD HH:mm:ss')
    const endDate = moment().format('YYYY-MM-DD HH:mm:ss')

    let orders = await LavuService.getEndOfDayOrders(cierreObj.ultimo, endDate, envPrefix)
    let totalOrders = []

    while (!!orders.elements && orders.elements.length > 1) {
      totalOrders.push(...orders.elements)
      orderCount += orders.elements.length
      lastDate = getRowValue(orders.elements[orders.elements.length - 1], 'closed')
      orders = await LavuService.getEndOfDayOrders(lastDate, endDate, envPrefix)
    }

    const ordenesExito = []
    const ordenesError = []
    const ordenesEnCero = []

    let currentOrder = 1
    res.json({ result: 'Cierre de día iniciado exitosamente!' })

    for (const order of totalOrders) {
      console.log('------ INICIA PROCESO -------')
      const orderId = getRowValue(order, 'order_id')
      console.log(`|-- EN PROCESO: ${orderId} --|`)
      console.log(`|-- ORDEN ${currentOrder} DE ${totalOrders.length} --|`)
      currentOrder++
      const facturada = await FacturasContribuyentes.findOne({ where: { order: orderId, locacion } })
      if (facturada) {
        console.log('---- YA FUE FACTURADA COMO CONTRIBUYENTE ----')
        continue
      }

      console.log('----- INICIA FACTURA ------')
      const total = getRowValue(order, 'total')
      const orderStatus = getRowValue(order, 'order_status')

      if (total === '0.00' || orderStatus === 'voided') {
        ordenesEnCero.push(orderId)
        console.log('ORDEN EN CERO: ', orderId)
      } else {
        try {
          const { jsonToGuruSoft, consecutivoObj } = await getJsonForGuruSoft({ orderId, esConsumidorFinal: true }, locacion, locacionData)
          console.log('JSON hacia GS: ', JSON.stringify(jsonToGuruSoft))
          const resultadoFactura = await enviarFactura(jsonToGuruSoft, locacionData)
          console.log('Respuesta de GS: ', JSON.stringify(resultadoFactura))

          if (resultadoFactura && resultadoFactura.Estado === '2') {
            // Se emitió exitosamente la factura
            ordenesExito.push(orderId)
            console.log('FACTURA CON EXITO: ', orderId)
          } else {
            console.log('---FACTURA CON ERROR: ', orderId)
            ordenesError.push(orderId)
          }
          const newConsecutivo = Number(consecutivoObj.consecutivo) + 1
          await consecutivoObj.update({ consecutivo: newConsecutivo })
        } catch (error) {
          console.log('--ERROR--', error.message)
          console.log('---FACTURA CON ERROR: ', orderId)
          ordenesError.push(orderId)
        }

        console.log('----- FINALIZA FACTURA ------')
      }

      const orderClosed = getRowValue(order, 'closed')
      await cierreObj.update({ ultimo: orderClosed })

      console.log('ORDENES EXITO: ', ordenesExito.length)
      console.log('ORDENES EN CERO: ', ordenesEnCero.length)
      console.log('ORDENES ERROR: ', ordenesError.length)
    }

    console.log('----- FINALIZA PROCESO ------')

    // Enviar Email
    sendMail(
      {
        ordenesExito: { ordenes: ordenesExito, count: ordenesExito.length },
        ordenesError: { ordenes: ordenesError, count: ordenesError.length },
      },
      locacion,
      locacionData.mailReceivers
    )
  } catch (error) {
    const errorData = {
      message: 'Internal Server Error',
      error: error.message,
    }
    sendMail(errorData, locacionData.mailReceivers)
  }
}

export async function fechaCierreDeDiaHandler(req, res) {
  try {
    const cierreObj = await Cierres.findOne({ where: { locacion: req.locacion } })
    res.json({
      fecha: moment(cierreObj.ultimo).format('DD-MM-YYYY'),
      hora: moment(cierreObj.ultimo).format('HH:mm:ss'),
    })
  } catch (error) {
    const errorData = {
      message: 'Internal Server Error',
      error: error.message,
    }
    res.status(500).json(errorData)
  }
}
