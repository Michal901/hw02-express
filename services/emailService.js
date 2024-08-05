const mailgun = require("mailgun-js");
const { MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_FROM_EMAIL } = process.env;

const mg = mailgun({ apiKey: MAILGUN_API_KEY, domain: MAILGUN_DOMAIN });

const sendVerificationEmail = async (email, token) => {
  const data = {
    from: MAILGUN_FROM_EMAIL,
    to: email,
    subject: "Email Verification",
    text: `Please verify your email by clicking on the following link: http://localhost:3000/users/verify/${token}`,
    html: `<strong>Please verify your email by clicking on the following link: <a href="http://localhost:3000/users/verify/${token}">Verify Email</a></strong>`,
  };

  await mg.messages().send(data);
};

module.exports = { sendVerificationEmail };
