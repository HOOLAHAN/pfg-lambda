const sgMail = require('@sendgrid/mail');

const allowedOrigins = [
  'http://www.pfgeomatics.com',
  'http://localhost:3000'
];

exports.handler = async (event) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const { name, email, message } = JSON.parse(event.body);

  const senderEmail = process.env.EMAIL_TO;
  if (!senderEmail) {
    console.error('Sender email is not defined in environment variables.');
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ message: "Configuration error: Sender email not set." })
    };
  }

  const content = {
    to: senderEmail,
    from: senderEmail,
    subject: `New Contact Message from ${name}`,
    text: `Message from ${name} (${email}): ${message}`,
    html: `<p><strong>From:</strong> ${name} (${email})</p><p><strong>Message:</strong> ${message}</p>`,
    reply_to: {
      email: email,
      name: name
    }
  };

  try {
    await sgMail.send(content);

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
      body: JSON.stringify({ message: "Email sent successfully!" })
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
        message: "Failed to send email",
        error: error.message || 'Unknown error'
      })
    };
  }
};
