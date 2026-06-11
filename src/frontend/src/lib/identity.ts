import { Ed25519KeyIdentity } from "@dfinity/identity";

const ID_KEY_PREFIX = "kf_identity_";

/**
 * Gets the stored identity for the given email on this device,
 * or generates a new one if it doesn't exist.
 */
export function getOrGenerateIdentity(email: string): Ed25519KeyIdentity {
  const key = `${ID_KEY_PREFIX}${email}`;
  const storedStr = localStorage.getItem(key);

  if (storedStr) {
    try {
      return Ed25519KeyIdentity.fromJSON(storedStr);
    } catch (e) {
      console.warn("Failed to parse stored identity, generating a new one.", e);
    }
  }

  // Generate new identity and save it
  const newIdentity = Ed25519KeyIdentity.generate();
  localStorage.setItem(key, JSON.stringify(newIdentity.toJSON()));
  return newIdentity;
}

export function clearIdentity(email: string): void {
  const key = `${ID_KEY_PREFIX}${email}`;
  localStorage.removeItem(key);
}
