const sgMail = require('@sendgrid/mail');

const allowedOrigins = [
  'https://www.pfgeomatics.com',
  'http://localhost:3000'
];

exports.handler = async (event) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const { name, email, message } = JSON.parse(event.body);

  const senderEmail1 = process.env.EMAIL_TO_1;
  const senderEmail2 = process.env.EMAIL_TO_2;
  if (!senderEmail1 || !senderEmail2) {
    console.error('One or both sender emails are not defined in environment variables.');
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ message: "Configuration error: One or both sender emails not set." })
    };
  }

  const content1 = {
    to: senderEmail1,
    from: senderEmail1,
    subject: `New Contact Message from ${name}`,
    text: `Message from ${name} (${email}): ${message}`,
    html: `<p><strong>From:</strong> ${name} (${email})</p><p><strong>Message:</strong> ${message}</p>`,
    reply_to: {
      email: email,
      name: name
    }
  };

  const content2 = {
    to: senderEmail2,
    from: senderEmail2,
    subject: `New Contact Message from ${name}`,
    text: `Message from ${name} (${email}): ${message}`,
    html: `<p><strong>From:</strong> ${name} (${email})</p><p><strong>Message:</strong> ${message}</p>`,
    reply_to: {
      email: email,
      name: name
    }
  };

  try {
    await sgMail.send(content1);
    await sgMail.send(content2);

    // Determine the origin of the request
    const origin = event.headers.origin || event.headers.Origin;

    // Check if the origin is allowed
    const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": allowOrigin,
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ message: "Emails sent successfully!" })
    };
  } catch (error) {
    console.error("Email send error: ", error);

    const origin = event.headers.origin || event.headers.Origin;
    const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

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
