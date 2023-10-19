import Consecutivos from '../models/consecutivos.js'
import { getProductos, getRowValue } from './LavuOrderUtils.js'
import getTemplate from './InvoiceTemplate.js'
import LavuService from '../services/LavuService.js'

export async function getJsonForGuruSoft(body) {
  const jsonToGuruSoft = getTemplate()
  const {
    orderId,
    esContribuyente,
    labelUbicacion,
    codigoTipoContribuyente,
    digitoVerificador,
    nombreRazonSocial,
    numeroDocumento,
    emailCliente,
    tipoRuc,
    paisSeleccionado,
    codigoCorregimiento,
    codigoDistrito,
    codigoProvincia,
    direccionCliente,
  } = body

  const consecutivoObj = await Consecutivos.findOne({ where: { locacion: 'BolaDeOro' } }) // TODO: Hacer dinamico a cada locacion
  const orderInfo = await LavuService.getOrderGeneralInfo(orderId)
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

  if (esContribuyente) {
    // Llenar datos de receptor
    jsonToGuruSoft.Receptor.iTipoRec = `0${codigoTipoContribuyente}`
    if (codigoTipoContribuyente === 4) {
      //  Extranjero
      jsonToGuruSoft.Receptor.dPaisExt = paisSeleccionado.nombre
      jsonToGuruSoft.Receptor.dIdExt = numeroDocumento
    } else {
      jsonToGuruSoft.Receptor.dTipoRuc = `0${tipoRuc}`
      jsonToGuruSoft.Receptor.dDV = digitoVerificador
      jsonToGuruSoft.Receptor.dRuc = numeroDocumento
      jsonToGuruSoft.Receptor.dCodUbi = `${codigoProvincia}-${codigoDistrito}-${codigoCorregimiento}`
      jsonToGuruSoft.Receptor.dProv = labelUbicacion.split('-')[0].trim()
      jsonToGuruSoft.Receptor.dDistr = labelUbicacion.split('-')[1].trim()
      jsonToGuruSoft.Receptor.dCorreg = labelUbicacion.split('-')[2].trim()
      jsonToGuruSoft.Receptor.dNombRec = nombreRazonSocial
      jsonToGuruSoft.Receptor.dDirecRec = direccionCliente
      jsonToGuruSoft.Receptor.dCorElectRec1 = emailCliente
    }
  }

  const orderContents = await LavuService.getOrderContents(orderId)
  const productos = getProductos(orderContents, exentoImpuesto)

  jsonToGuruSoft.dNroDF = padNumberWithZeros(consecutivoObj.consecutivo, 10)
  jsonToGuruSoft.Detalle = productos

  // Forma de pago
  const orderPaymentInfo = await LavuService.getOrderPayments(orderId)
  const metodoPago = getRowValue(orderPaymentInfo.elements[0], 'pay_type')
  let codigoMetodoPago = '02' // Pago en efectivo
  switch (metodoPago) {
    case 'Uber':
    case 'Pedidos Ya':
    case 'Asap':
    case 'ACH':
    case 'YaPPI':
      codigoMetodoPago = '08' // Transferencia bancaria
      break
    case 'Card':
      codigoMetodoPago = '03' // Tarjeta credito
      break
    case 'Cxc':
      codigoMetodoPago = '01' // Credito (cuenta por cobrar)
      break
  }
  jsonToGuruSoft.FormaPago[0].iFormaPago = codigoMetodoPago
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

export function padNumberWithZeros(numberString, desiredLength) {
  return numberString.padStart(desiredLength, '0')
}

function padNumberWithZerosDate(number, desiredLength) {
  return number.toString().padStart(desiredLength, '0')
}
