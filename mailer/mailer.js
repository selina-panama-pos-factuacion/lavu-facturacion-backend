import nodemailer from 'nodemailer'

export async function sendMail(data) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'selina.facturacion.panama@gmail.com', // your email
      pass: 'SelinaFacturas@23', // your email password
    },
  })

  let info = await transporter.sendMail({
    from: '"Facturacion Lavu" <selina.facturacion.panama@gmail.com>', // sender address
    to: 'gbermudezmora@gmail.com', // list of receivers
    subject: 'Hello ✔', // subject line
    text: JSON.stringify(data), // plain text body
    html: '<b>Hello world?</b>', // html body
  })

  console.log('Message sent: %s', info.messageId)
}
