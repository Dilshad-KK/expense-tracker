// Utility to convert ArrayBuffer to Base64 String
function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (const charCode of bytes) {
    str += String.fromCharCode(charCode);
  }
  const base64String = btoa(str);
  return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Utility to convert Base64url String to ArrayBuffer
function base64urlToBuffer(base64url: string): ArrayBuffer {
  const padding = '='.repeat((4 - base64url.length % 4) % 4);
  const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const buffer = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    buffer[i] = rawData.charCodeAt(i);
  }
  return buffer.buffer;
}

/**
 * Registers a new local passkey/biometric credential.
 * Saves the credential ID in localStorage so it can be verified later.
 */
export async function registerBiometric(user: string): Promise<boolean> {
  if (!window.PublicKeyCredential) {
    alert("Biometrics not supported on this device/browser.");
    return false;
  }

  try {
    const randomChallenge = new Uint8Array(32);
    window.crypto.getRandomValues(randomChallenge);

    const randomUserId = new Uint8Array(16);
    window.crypto.getRandomValues(randomUserId);

    const publicKey: PublicKeyCredentialCreationOptions = {
      challenge: randomChallenge,
      rp: {
        name: "Expense Tracker PWA",
        // Using window.location.hostname works for localhost and production domains
        id: window.location.hostname
      },
      user: {
        id: randomUserId,
        name: user,
        displayName: user
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" },  // ES256
        { alg: -257, type: "public-key" } // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform", // Force on-device (Face ID / Touch ID)
        userVerification: "required"
      },
      timeout: 60000,
      attestation: "none"
    };

    const credential = await navigator.credentials.create({ publicKey }) as PublicKeyCredential;
    
    if (credential) {
      const credentialIdStr = bufferToBase64url(credential.rawId);
      localStorage.setItem(`webauthn_cred_${user}`, credentialIdStr);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error registering biometric:", error);
    alert("Registration failed or was cancelled.");
    return false;
  }
}

/**
 * Prompts the user to authenticate using the previously registered biometric credential.
 */
export async function verifyBiometric(user: string): Promise<boolean> {
  if (!window.PublicKeyCredential) {
    return false;
  }

  const savedCredIdStr = localStorage.getItem(`webauthn_cred_${user}`);
  if (!savedCredIdStr) {
    console.warn("No biometric credential found for this user.");
    return false;
  }

  try {
    const randomChallenge = new Uint8Array(32);
    window.crypto.getRandomValues(randomChallenge);

    const credentialIdBuffer = base64urlToBuffer(savedCredIdStr);

    const publicKey: PublicKeyCredentialRequestOptions = {
      challenge: randomChallenge,
      rpId: window.location.hostname,
      allowCredentials: [{
        id: credentialIdBuffer,
        type: "public-key",
        transports: ["internal"]
      }],
      userVerification: "required",
      timeout: 60000
    };

    const assertion = await navigator.credentials.get({ publicKey }) as PublicKeyCredential;
    
    // For a local-only lock, successfully retrieving the assertion means Face ID / Touch ID passed.
    if (assertion) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error verifying biometric:", error);
    return false;
  }
}

export function isBiometricRegistered(user: string): boolean {
  return !!localStorage.getItem(`webauthn_cred_${user}`);
}

export function removeBiometric(user: string): void {
  localStorage.removeItem(`webauthn_cred_${user}`);
}
