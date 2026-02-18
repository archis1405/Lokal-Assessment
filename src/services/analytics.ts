import { logEvent as firebaseLogEvent } from 'firebase/analytics';
import { analytics } from '../config/firebase';

export const AnalyticsEvents = {
  OTP_GENERATED: 'otp_generated',
  OTP_VALIDATION_SUCCESS: 'otp_validation_success',
  OTP_VALIDATION_FAILURE: 'otp_validation_failure',
  LOGOUT: 'logout',
} as const;

/**
 * Log an event to Firebase Analytics (if configured) + browser console
 */
function logEvent(eventName: string, params: Record<string, any> = {}) {
  // Always log to console for dev visibility
  console.log(`[Analytics] ${eventName}`, params);

  // Send to Firebase if configured
  if (analytics) {
    try {
      firebaseLogEvent(analytics, eventName, params);
    } catch (error) {
      console.warn('[Analytics] Failed to send to Firebase:', error);
    }
  }

  // Persist to localStorage for debugging
  try {
    const log = JSON.parse(localStorage.getItem('analytics_log') || '[]');
    log.push({ event: eventName, params, timestamp: new Date().toISOString() });
    localStorage.setItem('analytics_log', JSON.stringify(log.slice(-50)));
  } catch (e) {
    // Ignore storage errors
  }
}

export const logOtpGenerated = (email: string, code: string) => {
  logEvent(AnalyticsEvents.OTP_GENERATED, { email, code_length: code.length });
};

export const logOtpSuccess = (email: string) => {
  logEvent(AnalyticsEvents.OTP_VALIDATION_SUCCESS, { email });
};

export const logOtpFailure = (email: string, reason: string, attempts?: number) => {
  logEvent(AnalyticsEvents.OTP_VALIDATION_FAILURE, { email, reason, attempts });
};

export const logLogout = (email: string, sessionDuration: number) => {
  logEvent(AnalyticsEvents.LOGOUT, { email, session_duration_seconds: sessionDuration });
};
