import nodemailer from 'nodemailer'

export async function sendMail(data) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'selina.facturacion.panama@gmail.com', // your email
      pass: 'zjgu iots wszn efmh', // your email password
    },
  })

  let info = await transporter.sendMail({
    from: '"Facturación Lavu" <selina.facturacion.panama@gmail.com>', // sender address
    to: 'gbermudezmora@gmail.com', // list of receivers casco@tacoslaneta.com
    subject: 'Resultado Cierre de Día 🧾 ✅', // subject line
    html: jsonToHtml(data), // plain text body
  })

  console.log('Message sent: %s', info.messageId)
}

function jsonToHtml(data) {
  const COLUMN_THRESHOLD = 50 // Adjust this to change when a new column is started

  function generateTableForOrders(orders) {
    let table = '<table><tbody><tr>'

    for (let i = 0; i < orders.length; i++) {
      if (i !== 0 && i % COLUMN_THRESHOLD === 0) {
        // Start a new column
        table += '</tr><tr>'
      }
      table += `<td>${orders[i]}</td>`
    }

    table += '</tr></tbody></table>'
    return table
  }

  let html = '<h2>Resumen de Órdenes</h2>'

  // For ordenesExito
  html += '<h4>ÓRDENES FACTURADAS CON ÉXITO (' + data.ordenesExito.count + ') ✅</h4>'
  if (data.ordenesExito.count > 0) {
    html += generateTableForOrders(data.ordenesExito.ordenes)
  } else {
    html += '<p>No hay órdenes de éxito.</p>'
  }

  // For ordenesError
  html += '<h4>ÓRDENES CON ERROR (' + data.ordenesError.count + ') ❌</h4>'
  if (data.ordenesError.count > 0) {
    html += generateTableForOrders(data.ordenesError.ordenes)
  } else {
    html += '<p>No hay órdenes con error.</p>'
  }

  return html
}
