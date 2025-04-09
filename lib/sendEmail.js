const sgMail = require('@sendgrid/mail');

const allowedOrigins = [
  'https://www.pfgeomatics.com',
  'http://localhost:3000'
];

exports.handler = async (event) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const { name, email, message } = JSON.parse(event.body);

  const senderEmail1 = process.env.SENDGRID_VERIFIED_EMAIL;
  const senderEmail2 = process.env.SENDGRID_VERIFIED_EMAIL2;

  const origin = event.headers.origin || event.headers.Origin;
  const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  const isTestMode = origin === 'http://localhost:3000';

  if (!senderEmail1 || (!senderEmail2 && !isTestMode)) {
    console.error('Missing one or more sender emails in environment variables.');
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": allowOrigin,
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ message: "Configuration error: Sender email(s) not set." })
    };
  }

  const baseEmailContent = {
    subject: `New Contact Message from ${name}`,
    text: `Message from ${name} (${email}): ${message}`,
    html: `<p><strong>From:</strong> ${name} (${email})</p><p><strong>Message:</strong> ${message}</p>`,
    reply_to: {
      email: email,
      name: name
    }
  };

  const emailsToSend = [
    {
      to: senderEmail1,
      from: senderEmail1,
      ...baseEmailContent
    }
  ];

  if (!isTestMode) {
    emailsToSend.push({
      to: senderEmail2,
      from: senderEmail2,
      ...baseEmailContent
    });
  }

  console.log("Preparing to send emails to:", emailsToSend.map(email => email.to));

  try {
    for (const content of emailsToSend) {
      await sgMail.send(content);
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": allowOrigin,
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        message: "Emails sent successfully!",
        recipients: emailsToSend.map(e => e.to),
        testMode: isTestMode
      })
    };
  } catch (error) {
    console.error("Email send error: ", error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": allowOrigin,
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        message: "Failed to send emails",
        error: error.message || 'Unknown error'
      })
    };
  }
};
