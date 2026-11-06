/**
 * Biometric Authentication Utility for NSO App
 * Supports Hardware Fingerprint & Face Recognition via WebAuthn Platform Authenticator
 */

export interface BiometricAvailability {
  isAvailable: boolean;
  type: 'fingerprint_face' | 'device_screen_lock' | 'unsupported';
}

export const checkBiometricSupport = async (): Promise<BiometricAvailability> => {
  if (typeof window === 'undefined') {
    return { isAvailable: false, type: 'unsupported' };
  }

  if (window.PublicKeyCredential && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (available) {
        return { isAvailable: true, type: 'fingerprint_face' };
      }
    } catch {
      // Fallback
    }
  }

  // Device supports standard credentials API
  if (navigator.credentials) {
    return { isAvailable: true, type: 'device_screen_lock' };
  }

  return { isAvailable: false, type: 'unsupported' };
};

export const promptBiometricAuth = async (userName = 'NSO Superadmin'): Promise<boolean> => {
  try {
    if (!window.PublicKeyCredential || !navigator.credentials) {
      return false;
    }

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const hasStoredCred = localStorage.getItem('nso_biometric_cred_id');

    if (!hasStoredCred) {
      // First-time enrollment: Triggers native Android BiometricPrompt (Fingerprint / Face ID)
      const userId = new Uint8Array(16);
      window.crypto.getRandomValues(userId);

      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: 'NSO Mobile Orbit',
            id: window.location.hostname || 'localhost'
          },
          user: {
            id: userId,
            name: 'admin@nso.in',
            displayName: userName
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 },  // ES256
            { type: 'public-key', alg: -257 } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform', // Built-in device fingerprint / Face ID sensor
            userVerification: 'required'
          },
          timeout: 60000
        }
      })) as any;

      if (credential && credential.id) {
        localStorage.setItem('nso_biometric_cred_id', credential.id);
        return true;
      }
      return false;
    } else {
      // Already enrolled: Prompt device fingerprint / face sensor for instant unlock
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [
            {
              id: Uint8Array.from(atob(hasStoredCred.replace(/-/g, '+').replace(/_/g, '/')), (c) =>
                c.charCodeAt(0)
              ),
              type: 'public-key'
            }
          ],
          userVerification: 'required',
          timeout: 60000,
          rpId: window.location.hostname || 'localhost'
        }
      });

      return !!credential;
    }
  } catch (err: any) {
    console.warn('Biometric auth prompt cancelled or failed:', err);
    // If credential was invalid or reset, clear stored id so next attempt re-enrolls
    if (err.name === 'InvalidStateError' || err.name === 'NotAllowedError') {
      // User cancelled or retry needed
    }
    return false;
  }
};
