const sgMail = require('@sendgrid/mail');

exports.handler = async (event) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const { name, email, message } = JSON.parse(event.body);

  const senderEmail = process.env.EMAIL_TO;
  if (!senderEmail) {
    console.error('Sender email is not defined in environment variables.');
    return {
      statusCode: 500,
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
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email sent successfully!" })
    };
  } catch (error) {
    console.error("Email send error: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to send email",
        error: error.message || 'Unknown error'
      })
    };
  }
};
