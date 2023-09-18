import Consecutivos from '../models/consecutivos.js'
import { getProductos, getRowValue } from './LavuOrderUtils.js'
import jsonTemplate from './InvoiceTemplate.js'
import LavuService from '../services/LavuService.js'

export async function getJsonForGuruSoft(body) {
  const jsonToGuruSoft = { ...jsonTemplate }
  const {
    orderId,
    esConsumidorFinal,
    // codigoTipoDocumentoIdentidad,
    // nombreRazonSocial,
    // numeroDocumento,
    // emailCliente,
    // telefonoCliente,
  } = body

  const consecutivoObj = await Consecutivos.findOne({ where: { locacion: 'BolaDeOro' } }) // TODO: Hacer dinamico a cada locacion
  const orderInfo = await LavuService.getOrderGeneralInfo(orderId)
  const pagoTarjeta = getRowValue(orderInfo.elements[0], 'card_paid')
  let total = getRowValue(orderInfo.elements[0], 'total')
  const tips = getRowValue(orderInfo.elements[0], 'gratuity')
  if (tips) total = (parseFloat(total) - parseFloat(tips)).toFixed(7)
  const impuesto = getRowValue(orderInfo.elements[0], 'tax')
  const exentoImpuesto = getRowValue(orderInfo.elements[0], 'tax_exempt') === '1'
  const subtotal = (parseFloat(total) - parseFloat(impuesto)).toFixed(7)
  const currentDateTime = new Date()
  const formattedDateTime = `${currentDateTime.getFullYear()}-${padNumberWithZerosDate(currentDateTime.getMonth() + 1, 2)}-${padNumberWithZerosDate(
    currentDateTime.getDate(),
    2
  )}T${padNumberWithZerosDate(currentDateTime.getHours(), 2)}:${padNumberWithZerosDate(currentDateTime.getMinutes(), 2)}:${padNumberWithZerosDate(
    currentDateTime.getSeconds(),
    2
  )}-05:00`

  jsonToGuruSoft.dFechaEm = formattedDateTime
  if (!esConsumidorFinal) {
    // Llenar datos de receptor
  }

  const orderContents = await LavuService.getOrderContents(orderId)
  const productos = getProductos(orderContents, exentoImpuesto)

  jsonToGuruSoft.dNroDF = padNumberWithZeros(consecutivoObj.consecutivo, 10)
  jsonToGuruSoft.Detalle = productos
  jsonToGuruSoft.FormaPago[0].iFormaPago = pagoTarjeta === '0.00' ? '02' : '03'
  jsonToGuruSoft.FormaPago[0].dVlrCuota = total

  jsonToGuruSoft.Total.dNroItems = productos.length
  jsonToGuruSoft.Total.dTotNeto = subtotal
  jsonToGuruSoft.Total.dTotITBMS = impuesto
  jsonToGuruSoft.Total.dTotGravado = impuesto
  jsonToGuruSoft.Total.dVTotItems = total
  jsonToGuruSoft.Total.dTotRec = total
  jsonToGuruSoft.Total.dVTot = total

  jsonToGuruSoft.SecuencialERP = orderId

  return { jsonToGuruSoft, consecutivoObj }
}

function padNumberWithZeros(numberString, desiredLength) {
  return numberString.padStart(desiredLength, '0')
}

function padNumberWithZerosDate(number, desiredLength) {
  return number.toString().padStart(desiredLength, '0')
}
