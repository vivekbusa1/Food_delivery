const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../utils/logger');

let transporter = null;
let transporterReady = false;

const PLACEHOLDER_SMTP = /^(your_smtp_|changeme|replace|example|todo|xxx)/i;

const isSmtpConfigured = () => {
  const { host, user, password } = config.smtp;
  if (!host || !user || !password) return false;
  if (PLACEHOLDER_SMTP.test(String(user)) || PLACEHOLDER_SMTP.test(String(password))) {
    return false;
  }
  return true;
};

const getTransporter = () => {
  if (transporterReady) return transporter;

  transporterReady = true;

  if (!isSmtpConfigured()) {
    logger.warn('SMTP is not configured (or uses placeholder credentials). Emails will be logged instead of sent.');
    transporter = null;
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.password,
    },
  });

  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  const mailer = getTransporter();

  if (!mailer) {
    logger.info(`[EMAIL:SKIPPED] To: ${to} | Subject: ${subject}${text ? ` | ${text}` : ''}`);
    return { skipped: true };
  }

  try {
    const info = await mailer.sendMail({
      from: config.smtp.from,
      to,
      subject,
      html,
      text,
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    // Local/dev must not hard-fail auth flows when Gmail rejects credentials.
    if (config.env !== 'production') {
      logger.warn(`[EMAIL:FAILED] To: ${to} | Subject: ${subject} | ${error.message}`);
      logger.info(`[EMAIL:FALLBACK] ${text || subject}`);
      return { skipped: true, error: error.message };
    }
    throw error;
  }
};

const sendOtpEmail = async (to, otp, purpose = 'verification') => {
  const subject = `Your OTP code for ${purpose}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
      <h2>Food Delivery App</h2>
      <p>Your OTP code for ${purpose} is:</p>
      <h1 style="letter-spacing: 6px;">${otp}</h1>
      <p>This code will expire in ${config.otpExpireMinutes} minutes. If you did not request this, please ignore this email.</p>
    </div>
  `;
  return sendEmail({ to, subject, html, text: `Your OTP is ${otp}` });
};

const sendPasswordResetEmail = async (to, resetToken) => {
  const resetUrl = `${config.clientUrl}/reset-password?token=${resetToken}`;
  const subject = 'Reset your password';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password. This link is valid for a limited time.</p>
      <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#ff4d4f;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a>
      <p>If the button doesn't work, copy this link: ${resetUrl}</p>
    </div>
  `;
  return sendEmail({ to, subject, html, text: `Reset your password: ${resetUrl}` });
};

const sendWelcomeEmail = async (to, name) => {
  const subject = 'Welcome to Food Delivery App!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
      <h2>Welcome, ${name}!</h2>
      <p>Thanks for signing up. Explore restaurants near you and enjoy delicious food delivered to your door.</p>
    </div>
  `;
  return sendEmail({ to, subject, html, text: `Welcome, ${name}!` });
};

const sendOrderConfirmationEmail = async (to, order) => {
  const subject = `Order Confirmed - ${order.orderNumber}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
      <h2>Order Confirmed</h2>
      <p>Your order <strong>${order.orderNumber}</strong> has been placed successfully.</p>
      <p>Total: ₹${order.total}</p>
      <p>We'll notify you as your order progresses.</p>
    </div>
  `;
  return sendEmail({ to, subject, html, text: `Order ${order.orderNumber} confirmed. Total: ${order.total}` });
};

module.exports = {
  sendEmail,
  sendOtpEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
};
