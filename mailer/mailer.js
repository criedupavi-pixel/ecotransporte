const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid');

let mailConfig;

if (process.env.NODE_ENV === 'production') {
  const options = {
    apiKey: process.env.SENDGRID_API_KEY
  };
  mailConfig = sgTransport(options);
  console.log('[Mailer] Configurado en modo PRODUCCION con SendGrid.');
} else {
  if (process.env.ETHEREAL_USER && process.env.ETHEREAL_PASS) {
    mailConfig = {
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASS
      }
    };
  } else {
    mailConfig = {
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'etherealpass'
      }
    };
  }
  console.log('[Mailer] Configurado en modo DESARROLLO LOCAL con Ethereal.');
}

const transporter = nodemailer.createTransport(mailConfig);

async function sendMailWithPreview(mailOptions) {
  if (process.env.NODE_ENV !== 'production' && (!process.env.ETHEREAL_USER || !process.env.ETHEREAL_PASS)) {
    const testAccount = await nodemailer.createTestAccount();
    const dynamicTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    const info = await dynamicTransporter.sendMail(mailOptions);
    console.log('[Ethereal] Email enviado! Vista previa en:', nodemailer.getTestMessageUrl(info));
    return info;
  } else {
    const info = await transporter.sendMail(mailOptions);
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Ethereal] Email enviado! Vista previa en:', nodemailer.getTestMessageUrl(info));
    } else {
      console.log('[SendGrid] Email de verificacion/notificacion enviado a:', mailOptions.to);
    }
    return info;
  }
}

transporter.sendMailWithPreview = sendMailWithPreview;

module.exports = transporter;
