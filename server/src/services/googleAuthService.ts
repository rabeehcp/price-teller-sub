import { OAuth2Client } from 'google-auth-library';

function sanitizeGoogleClientId(val?: string | null): string {
  if (!val || typeof val !== 'string') return '';
  const match = val.match(/(\d+-[a-z0-9_.-]+\.apps\.googleusercontent\.com)/i);
  if (match) return match[1].trim();
  return val.replace(/^[=\s]+|[=\s]+$/g, '').replace(/[\[\]\(\)'"]/g, '').trim();
}

const DEFAULT_GOOGLE_CLIENT_ID = '234261379378-olh1p5e38f28molcqlc7l9kpskvrq7f2.apps.googleusercontent.com';

export function getBackendGoogleClientId(): string {
  const envId = sanitizeGoogleClientId(process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID);
  return envId || DEFAULT_GOOGLE_CLIENT_ID;
}


export interface VerifiedGoogleUser {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
  givenName?: string;
  familyName?: string;
}

/**
 * Backend validation for Google ID Token using Google Identity Services.
 * Verifies signature with Google's public keys, audience (client ID), expiration, and issuer.
 */
export async function verifyGoogleIdToken(idToken: string): Promise<VerifiedGoogleUser> {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('Google ID token is required');
  }

  const cleanToken = idToken.replace(/^Bearer\s+/i, '').trim();
  if (!cleanToken) {
    throw new Error('Google ID token is empty or malformed');
  }

  const clientId = getBackendGoogleClientId();
  const client = new OAuth2Client(clientId);

  const ticket = await client.verifyIdToken({
    idToken: cleanToken,
    audience: clientId,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error('Invalid token: No payload received from Google verification');
  }

  // Verify Issuer
  const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
  if (!payload.iss || !validIssuers.includes(payload.iss)) {
    throw new Error(`Invalid token issuer: ${payload.iss}`);
  }

  // Verify Expiration (exp is in seconds)
  const currentTimeInSeconds = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < currentTimeInSeconds) {
    throw new Error('Google ID token has expired');
  }

  // Verify Email Presence and Verification Status
  if (!payload.email) {
    throw new Error('Google account email is missing');
  }

  if (!payload.email_verified) {
    throw new Error('Google account email is not verified');
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase().trim(),
    name: payload.name || payload.email.split('@')[0],
    picture: payload.picture,
    givenName: payload.given_name,
    familyName: payload.family_name,
  };
}
