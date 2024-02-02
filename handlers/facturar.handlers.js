import { getJsonForGuruSoft, padNumberWithZeros } from '../util/LavuToGuruSoft.js'
import { getRowValue } from '../util/LavuOrderUtils.js'
import { enviarFactura } from '../services/GuruSoftService.js'
import { sendMail } from '../mailer/mailer.js'
import LavuService from '../services/LavuService.js'
import Cierres from '../models/cierres.js'
import FacturasContribuyentes from '../models/facturas_contribuyentes.js'
import moment from 'moment'
import fs from 'fs'

const logStream = fs.createWriteStream('log.txt', { flags: 'a' })
const log = message => {
  logStream.write(message + '\n')
}

export async function facturarHandler(req, res) {
  try {
    const { locacion, locacionData } = req
    console.log('🚀 ~ file: facturar.handlers.js:13 ~ facturarHandler ~ locacion:', locacion)
    console.log('🚀 ~ file: facturar.handlers.js:13 ~ facturarHandler ~ locacionData:', locacionData)
    const { orderId } = req.body

    if (!orderId) {
      return res.status(400).json({ message: 'No hay numero de orden' })
    }

    const { jsonToGuruSoft, consecutivoObj } = await getJsonForGuruSoft(req.body, locacion, locacionData)
    console.log('🚀 ~ file: facturar.handlers.js:17 ~ facturarHandler ~ jsonToGuruSoft:', JSON.stringify(jsonToGuruSoft))
    let resultadoFactura = await enviarFactura(jsonToGuruSoft, locacionData)
    console.log('Respuesta de GS: ', JSON.stringify(resultadoFactura))

    if (resultadoFactura.Estado === '15') {
      // Documento duplicado, se actualiza consecutivo y se intenta de nuevo
      const newConsecutivo = Number(consecutivoObj.consecutivo) + 1
      await consecutivoObj.update({ consecutivo: newConsecutivo })
      jsonToGuruSoft.dNroDF = padNumberWithZeros(newConsecutivo.toString(), 10)
      console.log('🚀 ~ file: facturar.handlers.js:17 ~ facturarHandler ~ jsonToGuruSoft:', JSON.stringify(jsonToGuruSoft))
      resultadoFactura = await enviarFactura(jsonToGuruSoft)
      console.log('Respuesta de GS: ', JSON.stringify(resultadoFactura))
    }

    if (resultadoFactura.Estado === '2' || resultadoFactura.Estado === '20') {
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
  console.log('🚀 ~ file: facturar.handlers.js:298 ~ cierreDeDiaPostHandler ~ locacionData:', locacionData)
  const { envPrefix } = locacionData

  try {
    let orderCount = 0
    let lastDate = ''

    const cierreObj = await Cierres.findOne({ where: { locacion } })
    // const endDate = moment().subtract(5, 'hours').format('YYYY-MM-DD HH:mm:ss')
    const endDate = moment(cierreObj.ultimo).add(1, 'days').format('YYYY-MM-DD HH:mm:ss')
    console.log('🚀 ~ file: facturar.handlers.js:184 ~ cierreDeDiaPostHandler ~ endDate:', endDate)

    let orders = await LavuService.getEndOfDayOrders(cierreObj.ultimo, endDate, envPrefix)
    res.json({ result: 'Cierre de día iniciado exitosamente!' })

    const ordenesExito = []
    const ordenesPorConfirmar = []
    const ordenesError = []
    const ordenesEnCero = []

    while (!!orders.elements && orders.elements.length > 1) {
      orderCount += orders.elements.length

      for (const order of orders.elements) {
        console.log('------ INICIA PROCESO -------')

        const orderId = getRowValue(order, 'order_id')
        console.log(`|-- EN PROCESO: ${orderId} --|`)
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
            let resultadoFactura = await enviarFactura(jsonToGuruSoft, locacionData)
            // let resultadoFactura = { Estado: '2' }
            console.log('Respuesta de GS: ', JSON.stringify(resultadoFactura))

            if (resultadoFactura && resultadoFactura.Estado !== '2' && resultadoFactura.Estado !== '20') {
              // Si fallo la factura
              if (resultadoFactura.Estado === '15') {
                // Documento duplicado, se actualiza consecutivo y se intenta de nuevo
                const newConsecutivo = Number(consecutivoObj.consecutivo) + 1
                await consecutivoObj.update({ consecutivo: newConsecutivo })
                jsonToGuruSoft.dNroDF = padNumberWithZeros(newConsecutivo.toString(), 10)
              }
              console.log('🚀 ~ file: facturar.handlers.js:17 ~ facturarHandler ~ jsonToGuruSoft:', JSON.stringify(jsonToGuruSoft))
              resultadoFactura = await enviarFactura(jsonToGuruSoft, locacionData)
              // resultadoFactura = { Estado: '2' }
              console.log('Respuesta de GS: ', JSON.stringify(resultadoFactura))
            }

            if (resultadoFactura && resultadoFactura.Estado === '2') {
              // Si se emitió exitosamente la factura
              ordenesExito.push(orderId)
              console.log('FACTURA CON EXITO: ', orderId)
            } else if (resultadoFactura && resultadoFactura.Estado === '20') {
              // Factura por confirmar
              ordenesPorConfirmar.push(orderId)
              console.log('FACTURA POR CONFIRMAR: ', orderId)
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
        console.log('ORDENES POR CONFIRMAR: ', ordenesPorConfirmar.length)
        console.log('ORDENES EN CERO: ', ordenesEnCero.length)
        console.log('ORDENES ERROR: ', ordenesError.length)

        const tmpLastDate = getRowValue(order, 'closed')
        log(`ORDER: ${orderId} --- CLOSED: ${tmpLastDate}`)

        if (!lastDate || moment(tmpLastDate).isAfter(moment(lastDate))) {
          lastDate = tmpLastDate
        }
      }
      orders = await LavuService.getEndOfDayOrders(lastDate, endDate, envPrefix)
      log(`Last Date: ${lastDate}`)
      log(`End Date: ${endDate}`)
    }

    console.log('----- FINALIZA PROCESO ------')

    // Enviar Email
    sendMail(
      {
        ordenesExito: { ordenes: ordenesExito, count: ordenesExito.length },
        ordenesPorConfirmar: { ordenes: ordenesPorConfirmar, count: ordenesPorConfirmar.length },
        ordenesError: { ordenes: ordenesError, count: ordenesError.length },
      },
      locacion
      // locacionData.mailReceivers
    )
  } catch (error) {
    const errorData = {
      message: 'Internal Server Error',
      error: error.message,
    }
    console.log('🚀 ~ file: facturar.handlers.js:287 ~ cierreDeDiaPostHandler ~ errorData:', errorData)
    sendMail(errorData, locacion)
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
