import type { OtpStore, ValidationResult } from '../types/auth';
import { logOtpGenerated, logOtpSuccess, logOtpFailure } from './analytics';

const STORE_KEY = 'otp_store';
export const OTP_EXPIRY_MS = 60_000; 
export const OTP_LENGTH = 6;
export const MAX_ATTEMPTS = 3;

function getStore(): OtpStore {
  try {
    return JSON.parse(sessionStorage.getItem(STORE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveStore(store: OtpStore): void {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch (e) {
    console.warn('[OTP] Failed to save store:', e);
  }
}


export function generateOtp(email: string): void {
  const code = String(Math.floor(100000 + Math.random() * 900000));

  const store = getStore();
  store[email] = {
    code,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    attempts: 0,
    createdAt: Date.now(),
  };
  saveStore(store);

  if (import.meta.env?.MODE === 'development') {
    console.log(`[DEV] OTP for ${email}: ${code}`);
  }

  
  logOtpGenerated(email, code);
}

export function validateOtp(email: string, inputCode: string): ValidationResult {
  const store = getStore();
  const record = store[email];

  if (!record) {
    return { success: false, reason: 'no_otp' };
  }

  if (Date.now() > record.expiresAt) {
    delete store[email];
    saveStore(store);
    logOtpFailure(email, 'expired');
    return { success: false, reason: 'expired' };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    logOtpFailure(email, 'max_attempts', record.attempts);
    return { success: false, reason: 'max_attempts' };
  }

  record.attempts += 1;
  saveStore(store);

  if (record.code === inputCode) {
    logOtpSuccess(email);
    delete store[email];
    saveStore(store);
    return { success: true };
  }

  const remaining = MAX_ATTEMPTS - record.attempts;
  logOtpFailure(email, 'wrong_code', record.attempts);
  return { success: false, reason: 'wrong_code', remaining };
}


export function getRemainingSeconds(email: string): number {
  const store = getStore();
  const record = store[email];
  if (!record) return 0;
  return Math.max(0, Math.ceil((record.expiresAt - Date.now()) / 1000));
}

export function invalidateOtp(email: string): void {
  const store = getStore();
  delete store[email];
  saveStore(store);
}
