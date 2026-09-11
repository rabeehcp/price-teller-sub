// Google Identity Services (GIS) & OAuth Helper Service

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string; select_by?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: string | number;
              locale?: string;
            }
          ) => void;
          prompt: (notification?: (notification: any) => void) => void;
          disableAutoSelect: () => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string; error_description?: string }) => void;
            error_callback?: (err: any) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

export interface GoogleUserPayload {
  iss?: string;
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
}

// Helper to decode Base64Url JWT token payload from Google
export function decodeGoogleJwt(token: string): GoogleUserPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Failed to parse Google JWT credential:', err);
    return null;
  }
}

// Check if real Google OAuth Client ID is configured
export function isGoogleOAuthConfigured(): boolean {
  const id = getGoogleClientId();
  return Boolean(
    id &&
      id.length > 20 &&
      id.includes('.apps.googleusercontent.com') &&
      !id.includes('priceteller.apps.googleusercontent.com')
  );
}

// Get Google Client ID from environment or saved localStorage
export function getGoogleClientId(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('price_teller_google_client_id');
    if (saved && saved.trim() && saved.includes('.apps.googleusercontent.com') && !saved.includes('priceteller.apps.googleusercontent.com')) {
      return saved.trim();
    }
  }
  const rawEnvId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
  const envId = typeof rawEnvId === 'string'
    ? rawEnvId.replace(/^VITE_GOOGLE_CLIENT_ID\s*=\s*/i, '').trim()
    : rawEnvId;
  if (envId && typeof envId === 'string' && envId.trim() && !envId.includes('priceteller.apps.googleusercontent.com')) {
    return envId.trim();
  }
  return '234261379378-olh1p5e38f28molcqlc7l9kpskvrq7f2.apps.googleusercontent.com';
}

// Save custom Google Client ID
export function setCustomGoogleClientId(clientId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('price_teller_google_client_id', clientId.trim());
  }
}

// Dynamically load Google Identity Services script
export function loadGoogleScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      resolve(true);
      return;
    }
    const existingScript = document.getElementById('google-gsi-client');
    if (existingScript) {
      if (window.google?.accounts?.id) {
        resolve(true);
      } else {
        existingScript.addEventListener('load', () => resolve(true));
      }
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

/**
 * Initialize and render the official Google Identity Services sign-in button
 */
export async function renderGoogleSignInButton(
  container: HTMLElement,
  onSuccess: (credential: string) => void,
  options?: {
    theme?: 'outline' | 'filled_blue' | 'filled_black';
    size?: 'large' | 'medium' | 'small';
    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
    width?: number;
  }
): Promise<boolean> {
  const clientId = getGoogleClientId();
  if (!clientId) return false;

  const loaded = await loadGoogleScript();
  if (!loaded || !window.google?.accounts?.id) return false;

  try {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response.credential) {
          onSuccess(response.credential);
        }
      },
    });

    container.innerHTML = '';
    window.google.accounts.id.renderButton(container, {
      type: 'standard',
      theme: options?.theme || 'outline',
      size: options?.size || 'large',
      text: options?.text || 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: options?.width || (container.clientWidth > 100 ? container.clientWidth : 280),
    });
    return true;
  } catch (err) {
    console.error('Error rendering Google Sign-In button:', err);
    return false;
  }
}
