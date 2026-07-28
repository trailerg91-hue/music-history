import nodemailer from 'nodemailer';

const NODE_ENV = (process.env.NODE_ENV || 'development').toLowerCase();
const IS_DEV_LIKE = NODE_ENV === 'development' || NODE_ENV === 'test';

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return {
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass: String(pass).replace(/\s+/g, ''),
    },
  };
}

function createTransport() {
  const config = getSmtpConfig();
  if (!config) return null;
  return nodemailer.createTransport(config);
}

/** სატესტო რეჟიმი: SMTP/2FA არ სჭირდება */
export function isTestMailMode() {
  const mode = (process.env.EMAIL_MODE || (IS_DEV_LIKE ? 'test' : 'smtp')).toLowerCase();
  if (mode === 'test') return true;
  if (mode === 'smtp') return false;
  return IS_DEV_LIKE && !getSmtpConfig();
}

/**
 * ვერიფიკაციის კოდის მიწოდება.
 * test რეჟიმში კოდს აბრუნებს API-ში (UI-ში გამოჩნდება), SMTP არ სჭირდება.
 */
export async function sendVerificationEmail({ to, verifyUrl, code }) {
  if (isTestMailMode()) {
    console.log(`[test-mail] to=${to} code=${code}`);
    console.log(`[test-mail] link=${verifyUrl}`);
    return { mode: 'test', sent: false, code };
  }

  const transport = createTransport();
  if (!transport) {
    const err = new Error('SMTP_NOT_CONFIGURED');
    err.code = 'SMTP_NOT_CONFIGURED';
    throw err;
  }

  const fromName = process.env.SMTP_FROM_NAME || 'History of Music';
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
  const from = `"${fromName}" <${fromEmail}>`;

  const subject = 'შენი ვერიფიკაციის კოდი — History of Music';
  const text = [
    'გამარჯობა!',
    '',
    `შენი ვერიფიკაციის კოდი: ${code}`,
    '',
    'ან გახსენი ეს ლინკი:',
    verifyUrl,
    '',
    'კოდი მოქმედებს 24 საათი.',
  ].join('\n');

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:520px">
      <h2 style="color:#d97706">ვერიფიკაციის კოდი</h2>
      <p>შეიყვანე ეს კოდი საიტზე:</p>
      <p style="font-size:28px;letter-spacing:6px;font-weight:700;background:#111;color:#fbbf24;display:inline-block;padding:10px 16px;border-radius:10px">${code}</p>
      <p><a href="${verifyUrl}" style="display:inline-block;padding:12px 18px;background:#d97706;color:#fff;text-decoration:none;border-radius:8px">მეილის დადასტურება</a></p>
    </div>
  `;

  try {
    await transport.sendMail({ from, to, subject, text, html });
    return { mode: 'smtp', sent: true, code };
  } catch (error) {
    console.error('[mailer] send failed:', error?.message || error);
    const err = new Error('SMTP_SEND_FAILED');
    err.code = 'SMTP_SEND_FAILED';
    throw err;
  }
}
