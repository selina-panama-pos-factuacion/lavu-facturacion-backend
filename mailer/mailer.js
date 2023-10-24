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
    from: '"Facturacion Lavu" <selina.facturacion.panama@gmail.com>', // sender address
    to: 'gbermudezmora@gmail.com', // list of receivers
    subject: 'Hello ✔', // subject line
    html: jsonToHtml(data), // plain text body
  })

  console.log('Message sent: %s', info.messageId)
}

function jsonToHtml(data) {
  let html = '<h2>Resumen de Órdenes</h2>'

  // For ordenesExito
  html += '<h3>Órdenes de Éxito (' + data.ordenesExito.count + ')</h3>'
  if (data.ordenesExito.count > 0) {
    html += '<ul>'
    data.ordenesExito.ordenes.forEach(order => {
      html += '<li>' + order + '</li>'
    })
    html += '</ul>'
  } else {
    html += '<p>No hay órdenes de éxito.</p>'
  }

  // For ordenesError
  html += '<h3>Órdenes con Error (' + data.ordenesError.count + ')</h3>'
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
