import nodemailer from 'nodemailer'

export async function sendMail(data, locacion, receivers = []) {
  console.log('🚀 ~ file: mailer.js:4 ~ sendMail ~ receivers:', receivers)
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'selina.facturacion.panama@gmail.com', // your email
      pass: 'zjgu iots wszn efmh', // your email password
    },
  })

  let info = await transporter.sendMail({
    from: '"Facturación Lavu" <selina.facturacion.panama@gmail.com>', // sender address
    to: ['gbermudezmora@gmail.com', ...receivers], // list of receivers
    subject: `Resultado Cierre de Día - ${locacion}🧾 ✅`, // subject line
    html: isValidOrdenesResponse(data) ? jsonToHtml(data) : JSON.stringify(data), // plain text body
  })

  console.log('Message sent: %s', info.messageId)
}

function jsonToHtml(data) {
  let html = '<h2>Resumen de Órdenes</h2>'

  // For ordenesExito
  html += '<h4>ÓRDENES FACTURADAS CON ÉXITO (' + data.ordenesExito.count + ') ✅</h4>'
  if (data.ordenesExito.count > 0) {
    html += '<ul>'
    data.ordenesExito.ordenes.forEach(order => {
      html += '<li>' + order + '</li>'
    })
    html += '</ul>'
  } else {
    html += '<p>No hay órdenes de éxito.</p>'
  }

  // For ordenesPorConfirmar
  html += '<h4>ÓRDENES POR CONFIRMAR (' + data.ordenesPorConfirmar.count + ') 🧐</h4>'
  if (data.ordenesPorConfirmar.count > 0) {
    html += '<ul>'
    data.ordenesPorConfirmar.ordenes.forEach(order => {
      html += '<li>' + order + '</li>'
    })
    html += '</ul>'
  } else {
    html += '<p>No hay órdenes por confirmar.</p>'
  }

  // For ordenesError
  html += '<h4>ÓRDENES CON ERROR (' + data.ordenesError.count + ') ❌</h4>'
  if (data.ordenesError.count > 0) {
    html += '<ul>'
    data.ordenesError.ordenes.forEach(order => {
      html += '<li>' + order + '</li>'
    })
    html += '</ul>'
  } else {
    html += '<p>No hay órdenes con error.</p>'
  }

  return html
}

function isValidOrdenesResponse(data) {
  if (typeof data !== 'object' || data === null) {
    return false
  }

  const keys = ['ordenesExito', 'ordenesError']

  for (const key of keys) {
    if (!data[key] || typeof data[key] !== 'object') {
      return false
    }

    if (!Array.isArray(data[key].ordenes)) {
      return false
    }

    if (data[key].count !== data[key].ordenes.length) {
      return false
    }
  }

  return true
}
