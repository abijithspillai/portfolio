const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

function isRateLimited(ip) {
  if (!ip) return false;
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  entry.count += 1;
  return false;
}

function sanitize(text) {
  if (typeof text !== 'string') return '';
  return text.trim().replace(/[<>]/g, '');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';

    if (isRateLimited(ip)) {
      return res.status(429).json({ error: 'Too many requests. Please try again in a few minutes.' });
    }

    const { name, email, subject, message, _gotcha } = req.body || {};

    if (_gotcha) {
      return res.status(200).json({ success: true, message: 'Message sent successfully' });
    }

    const cleanName = sanitize(name);
    const cleanEmail = sanitize(email);
    const cleanSubject = sanitize(subject) || 'New Portfolio Contact Form Message';
    const cleanMessage = sanitize(message);

    if (!cleanName || cleanName.length > 100) {
      return res.status(400).json({ error: 'Please provide a valid name (up to 100 characters).' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail) || cleanEmail.length > 254) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    if (!cleanMessage || cleanMessage.length < 5 || cleanMessage.length > 3000) {
      return res.status(400).json({ error: 'Message must be between 5 and 3000 characters.' });
    }

    const serviceId = process.env.EMAILJS_SERVICE_ID || process.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID || process.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY || process.env.VITE_EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    if (!serviceId || !templateId || !publicKey) {
      return res.status(500).json({ error: 'Email service is currently unconfigured on the server.' });
    }

    const emailJsPayload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        from_name: cleanName,
        reply_to: cleanEmail,
        subject: cleanSubject,
        message: cleanMessage,
      },
    };

    if (privateKey) {
      emailJsPayload.accessToken = privateKey;
    }

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailJsPayload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      return res.status(502).json({ error: `Provider error: ${errorText || 'Failed to dispatch email'}` });
    }

    return res.status(200).json({ success: true, message: 'Message sent successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error while sending email: ' + err.message });
  }
}
