import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface UserAccount {
  userId: string;
  email: string;
  displayName: string;
}

const STORAGE_KEY = 'activebook_user_account_session';

// Simple fast hash for client pin protection
function hashPin(pin: string): string {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(36);
}

// Convert user email or username to safe Firestore Document ID
export function sanitizeUserId(input: string): string {
  const clean = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, '_');
  return `u_${clean}`;
}

export function getCurrentUserAccount(): UserAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserAccount;
  } catch {
    return null;
  }
}

export async function loginOrRegisterAccount(
  identifier: string,
  pin: string
): Promise<UserAccount> {
  const cleanIdentifier = identifier.trim();
  if (!cleanIdentifier) {
    throw new Error('Podaj swój adres e-mail lub nazwę konta.');
  }

  const userId = sanitizeUserId(cleanIdentifier);
  const pinHash = hashPin(pin || '0000');

  const userDocRef = doc(db, 'users', userId);
  const snap = await getDoc(userDocRef);

  if (snap.exists()) {
    const data = snap.data();
    if (data.pinHash && data.pinHash !== pinHash) {
      throw new Error('Niepoprawny PIN/Hasło dla tego konta.');
    }
  } else {
    // Register new cloud sync profile
    await setDoc(userDocRef, {
      userId,
      email: cleanIdentifier,
      pinHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  const account: UserAccount = {
    userId,
    email: cleanIdentifier,
    displayName: cleanIdentifier.includes('@')
      ? cleanIdentifier.split('@')[0]
      : cleanIdentifier,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
  return account;
}

export function logoutAccountSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}
