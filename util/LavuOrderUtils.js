export function getRowValue(row, key) {
  const field = row.elements.find(e => e.name === key)
  // console.log(JSON.stringify(field));
  if (!field || !field.elements) return false
  return field.elements[0].text
}

export function getProductos(data, exentoImpuesto) {
  if (!data.elements || data.elements.length === 0) return false

  let items = []
  const productos = data.elements

  productos.forEach((producto, index) => {
    const dCantCodInt = getRowValue(producto, 'quantity')
    const dPrUnit = getRowValue(producto, 'price')
    let precioUnitario = parseFloat(dPrUnit)
    const modificacionPrecio1 = getRowValue(producto, 'modify_price')
    const modificacionPrecio2 = getRowValue(producto, 'forced_modifiers_price')
    if (modificacionPrecio1) precioUnitario += parseFloat(modificacionPrecio1)
    if (modificacionPrecio2) precioUnitario += parseFloat(modificacionPrecio2)
    if (parseInt(dCantCodInt) > 0 && precioUnitario > 0) {
      const dCodProd = getRowValue(producto, 'item_id')
      const dDescProd = getRowValue(producto, 'item')
      const dPrItem = getRowValue(producto, 'after_discount')
      const descuento1 = getRowValue(producto, 'discount_amount')
      const descuento2 = getRowValue(producto, 'idiscount_amount')
      let dPrUnitDesc = 0
      if (descuento1) dPrUnitDesc += parseFloat(descuento1)
      if (descuento2) dPrUnitDesc += parseFloat(descuento2)
      const dValITBMS = exentoImpuesto ? '0.00 ' : (parseFloat(dPrItem) * 0.07).toFixed(7)
      const dValTotItem = exentoImpuesto ? dPrItem : (parseFloat(dPrItem) + parseFloat(dValITBMS)).toFixed(7)
      const dTasaITBMS = exentoImpuesto ? '00' : '01'

      items.push({
        dSecItem: index + 1,
        dDescProd,
        dCodProd,
        cUnidad: 'und',
        dCantCodInt,
        dCodCPBScmp: '9010',
        DetPrecio: {
          dPrUnitDesc: parseFloat(dPrUnitDesc) / parseFloat(dCantCodInt),
          dPrUnit: precioUnitario,
          dPrItem,
          dValTotItem,
        },
        DetITBMS: {
          dTasaITBMS,
          dValITBMS,
        },
      })
    }
  })

  return items
}

export function getOrderData(orders, id) {
  let orderToFind
  orders.forEach(order => {
    const orderId = getRowValue(order, 'order_id')
    if (orderId === id) {
      orderToFind = order
      return
    }
  })
  return orderToFind
}

export function getCustomerField(customer, key) {
  const field = customer.find(e => e.fields_db_name === key)
  if (!field) return false
  return field.info
}

export function roundAmount(value, decimals = 5) {
  return +(Math.round(`${value}e+${decimals}`) + `e-${decimals}`)
}
