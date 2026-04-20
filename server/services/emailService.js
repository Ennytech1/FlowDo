const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendWelcomeEmail = async (email, fullName) => {
  try {
    await transporter.sendMail({
      from: `"ToDo Champ" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to ToDo Champ! 🚀',
      html: `
        <h1>Welcome, ${fullName}!</h1>
        <p>Your journey to peak productivity starts now.</p>
        <p>We are excited to have you as a Champ.</p>
        <br/>
        <p>Best regards,</p>
        <p>The ToDo Champ Team</p>
      `,
    });
    console.log(`📧 Welcome email sent to: ${email}`);
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
  }
};

module.exports = {
  sendWelcomeEmail,
};
