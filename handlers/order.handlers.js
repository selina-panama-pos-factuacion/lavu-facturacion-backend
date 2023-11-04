import LavuService from '../services/LavuService.js'
import { getRowValue } from '../util/LavuOrderUtils.js'

export async function orderInfoHandler(req, res) {
  const { id } = req.params

  console.log(`--- ORDEN A CONSULTAR: ${id} ---`)
  const orderData = await LavuService.getOrderGeneralInfo(id, req.locacionData.envPrefix)
  if (!orderData || !orderData.elements || orderData.elements.length === 0) {
    console.log('ORDEN NO EXISTE')
    res.status(400).json({
      error: 'Order ID no existe.',
    })
  } else {
    const total = getRowValue(orderData.elements[0], 'total')
    const cerrada = getRowValue(orderData.elements[0], 'closed')

    const result = {
      orderId: id,
      total,
      cerrada,
    }

    console.log('DATOS DE ORDEN', result)

    res.json(result)
  }
}
