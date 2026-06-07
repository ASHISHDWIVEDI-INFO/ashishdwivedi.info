const nodemailer = require('nodemailer');

// ── Create transporter ────────────────────────
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
    port:   parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

  return transporter;
};

// ── Verify connection (called at startup) ─────
const verifyEmailConfig = async () => {
  try {
    await getTransporter().verify();
    console.log('✅ Email (SMTP) configured successfully');
    return true;
  } catch (err) {
    console.warn('⚠️  Email config warning:', err.message);
    return false;
  }
};

// ── Shared send helper ────────────────────────
const sendMail = async (options) => {
  const transport = getTransporter();
  return transport.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || 'Ashish Dwivedi'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    ...options,
  });
};

// ========================
// Admin notification email
// ========================
const sendContactNotification = async ({ name, email, subject, message }) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body        { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                      background:#0d0d28; margin:0; padding:0; }
        .container  { max-width:600px; margin:40px auto; background:#141435;
                      border-radius:16px; overflow:hidden; border:1px solid rgba(124,58,237,.25); }
        .header     { background:linear-gradient(135deg,#7C3AED,#06b6d4);
                      padding:28px 32px; }
        .header h1  { color:#fff; font-size:20px; margin:0; font-weight:700; }
        .header p   { color:rgba(255,255,255,.75); font-size:13px; margin:4px 0 0; }
        .body       { padding:28px 32px; }
        .field      { margin-bottom:20px; }
        .label      { font-size:11px; color:#7C3AED; font-weight:600;
                      text-transform:uppercase; letter-spacing:.08em; margin-bottom:6px; }
        .value      { font-size:14px; color:#e0e0f0; line-height:1.6; }
        .message-box{ background:#0d0d28; border:1px solid rgba(124,58,237,.2);
                      border-radius:10px; padding:16px; }
        .reply-btn  { display:inline-block; margin-top:20px; padding:12px 24px;
                      background:linear-gradient(135deg,#7C3AED,#6d28d9);
                      color:#fff; text-decoration:none; border-radius:10px;
                      font-size:14px; font-weight:600; }
        .footer     { padding:16px 32px; border-top:1px solid rgba(124,58,237,.1);
                      font-size:12px; color:rgba(255,255,255,.3); text-align:center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📬 New Contact Message</h1>
          <p>Someone reached out via ashishdwivedi.info</p>
        </div>
        <div class="body">
          <div class="field">
            <div class="label">From</div>
            <div class="value">${name} &lt;${email}&gt;</div>
          </div>
          <div class="field">
            <div class="label">Subject</div>
            <div class="value">${subject}</div>
          </div>
          <div class="field">
            <div class="label">Message</div>
            <div class="message-box value">${message.replace(/\n/g, '<br>')}</div>
          </div>
          <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" class="reply-btn">
            ↩ Reply to ${name}
          </a>
        </div>
        <div class="footer">
          Received via Portfolio Contact Form · ashishdwivedi.info
        </div>
      </div>
    </body>
    </html>
  `;

  return sendMail({
    to:      process.env.CONTACT_RECIPIENT_EMAIL || process.env.SMTP_USER,
    subject: `[Portfolio] ${subject} — from ${name}`,
    html,
    replyTo: email,
  });
};

// ========================
// Auto-reply to sender
// ========================
const sendAutoReply = async ({ name, email, subject }) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body        { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                      background:#f8f9ff; margin:0; padding:0; }
        .container  { max-width:560px; margin:40px auto; background:#fff;
                      border-radius:16px; overflow:hidden;
                      box-shadow:0 4px 30px rgba(0,0,0,.08); }
        .header     { background:linear-gradient(135deg,#7C3AED,#06b6d4); padding:32px; }
        .header h1  { color:#fff; font-size:22px; margin:0; font-weight:700; }
        .body       { padding:32px; }
        .body p     { font-size:15px; color:#444; line-height:1.7; margin:0 0 16px; }
        .highlight  { color:#7C3AED; font-weight:600; }
        .social     { display:flex; gap:12px; margin-top:24px; }
        .social a   { font-size:13px; color:#7C3AED; text-decoration:none;
                      padding:6px 14px; border:1px solid rgba(124,58,237,.3);
                      border-radius:8px; }
        .footer     { padding:16px 32px; background:#f0f0f8; font-size:12px;
                      color:#999; text-align:center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Hey ${name}! 👋</h1>
        </div>
        <div class="body">
          <p>Thank you for reaching out. I've received your message regarding
            <span class="highlight">"${subject}"</span> and will get back to you
            as soon as possible — usually within 24–48 hours.</p>
          <p>In the meantime, feel free to explore my work or connect with me on social media.</p>
          <div class="social">
            <a href="https://ashishdwivedi.info" target="_blank">🌐 Portfolio</a>
            <a href="https://github.com/ashishdwivedi" target="_blank">💻 GitHub</a>
            <a href="https://linkedin.com/in/ashishdwivedi" target="_blank">💼 LinkedIn</a>
          </div>
        </div>
        <div class="footer">
          This is an automated reply · ashishdwivedi.info
        </div>
      </div>
    </body>
    </html>
  `;

  return sendMail({
    to:      email,
    subject: `Re: ${subject} — Got your message!`,
    html,
  });
};

module.exports = { verifyEmailConfig, sendContactNotification, sendAutoReply };