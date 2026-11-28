import crypto from 'crypto';

async function verifyFirebaseToken(token) {
  if (!token) return false;

  const firebaseApiKey = process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY;

  if (firebaseApiKey) {
    try {
      const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: token }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data.users) && data.users.length > 0;
      }
    } catch {}
  }

  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`);
    if (res.ok) {
      const data = await res.json();
      const expectedAud = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
      if (expectedAud && data.aud !== expectedAud) {
        return false;
      }
      return Boolean(data.user_id || data.sub);
    }
  } catch {
    return false;
  }

  return false;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Missing authentication token' });
    }

    const isValidUser = await verifyFirebaseToken(token);
    if (!isValidUser) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired authentication token' });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(500).json({ error: 'Cloudinary server credentials are not properly configured' });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = req.body?.folder || 'portfolio';

    const paramsToSign = {
      folder,
      timestamp,
    };

    const sortedParams = Object.keys(paramsToSign)
      .sort()
      .map((key) => `${key}=${paramsToSign[key]}`)
      .join('&');

    const signature = crypto
      .createHash('sha1')
      .update(sortedParams + apiSecret)
      .digest('hex');

    return res.status(200).json({
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate upload signature: ' + err.message });
  }
}
