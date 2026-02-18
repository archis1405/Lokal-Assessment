export interface OtpRecord {
  code: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
}

export interface OtpStore {
  [email: string]: OtpRecord;
}

export type ValidationResult =
  | { success: true }
  | { success: false; reason: 'no_otp' | 'expired' | 'max_attempts' | 'wrong_code'; remaining?: number };

export type Screen = 'login' | 'otp' | 'session';

export interface AuthState {
  screen: Screen;
  email: string | null;
}
