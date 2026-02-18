import { useState, useEffect, useRef, useCallback, ClipboardEvent, KeyboardEvent } from 'react';
import { validateOtp, getRemainingSeconds, generateOtp, invalidateOtp, MAX_ATTEMPTS } from '../services/otpManager';

interface Props {
  email: string;
  onSuccess: (email: string) => void;
  onBack: () => void;
  onResend: (email: string) => void;
}

const OTP_EXPIRY_SECONDS = 60;

function useCountdown(email: string, active: boolean, resetSignal: number) {
  const [seconds, setSeconds] = useState(OTP_EXPIRY_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSeconds(getRemainingSeconds(email) || OTP_EXPIRY_SECONDS);

    if (!active) return;

    timerRef.current = setInterval(() => {
      const rem = getRemainingSeconds(email);
      setSeconds(rem);
      if (rem <= 0 && timerRef.current) {
        clearInterval(timerRef.current);
      }
    }, 500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [email, active, resetSignal]);

  return seconds;
}

export default function OtpScreen({ email, onSuccess, onBack, onResend }: Props) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendToken, setResendToken] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const countdown = useCountdown(email, !locked && !verified, resendToken);
  const expired = countdown <= 0 && !verified && !locked;
  const full = digits.every(d => d !== '');

  const handleChange = useCallback((idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;

    setDigits(prev => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
    setError('');

    if (val && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  }, []);

  const handleKeyDown = useCallback((idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  }, [digits]);

  const handlePaste = useCallback((e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  }, []);

  const handleVerify = useCallback(async () => {
    const code = digits.join('');
    if (code.length < 6 || loading) return;

    setLoading(true);
    setError('');

    // simulate delay for UX
    await new Promise(r => setTimeout(r, 400));

    const result = validateOtp(email, code);

    if (result.success) {
      setVerified(true);
      setTimeout(() => onSuccess(email), 700);
      return;
    }

    setDigits(['', '', '', '', '', '']);
    setTimeout(() => inputRefs.current[0]?.focus(), 0);

    if (result.reason === 'expired') {
      setError('This OTP has expired. Please request a new one.');
    } else if (result.reason === 'max_attempts') {
      setLocked(true);
      setError(`Maximum ${MAX_ATTEMPTS} attempts reached.`);
    } else if (result.reason === 'wrong_code') {
      setError(`Incorrect code. ${result.remaining} attempt${result.remaining !== 1 ? 's' : ''} remaining.`);
    } else {
      setError('Verification failed. Please try again.');
    }

    setLoading(false);
  }, [digits, email, loading, onSuccess]);

  const handleResend = useCallback(async () => {
    setLoading(true);
    setError('');

    await new Promise(r => setTimeout(r, 400));

    invalidateOtp(email);
    generateOtp(email); // generates OTP, logs in console if DEV

    setDigits(['', '', '', '', '', '']);
    setLocked(false);
    setResendToken(t => t + 1);
    setLoading(false);

    onResend(email); // notify parent, no OTP passed
    setTimeout(() => inputRefs.current[0]?.focus(), 0);
  }, [email, onResend]);

  return (
    <div className="screen">
      <div className="card">
        <div className="brand">
          <div className="brand-dot" />
          <span>LOKAL</span>
        </div>

        <h1 className="heading">Enter code</h1>
        <p className="subtext">
          A 6-digit code was sent to <strong>{email}</strong>
        </p>

        <div className="otp-row" onPaste={handlePaste}>
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={el => (inputRefs.current[idx] = el)}
              className={`otp-cell${verified ? ' otp-cell--verified' : ''}${error && !verified ? ' otp-cell--error' : ''}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(idx, e.target.value)}
              onKeyDown={e => handleKeyDown(idx, e)}
              disabled={locked || expired || verified || loading}
            />
          ))}
        </div>

        {!expired && !locked && !verified && (
          <div className="countdown">
            <div className="countdown__bar">
              <div
                className="countdown__fill"
                style={{
                  width: `${(countdown / OTP_EXPIRY_SECONDS) * 100}%`,
                  background: countdown < 15 ? 'var(--danger)' : 'var(--accent)',
                }}
              />
            </div>
            <span className="countdown__text">{countdown}s remaining</span>
          </div>
        )}

        {(expired || locked) && !verified && (
          <div className="alert alert--danger">
            {locked ? 'Too many failed attempts.' : 'Code expired.'}
            {' '}Click <strong>Resend OTP</strong> below.
          </div>
        )}

        {error && !locked && !expired && (
          <span className="field-error center">{error}</span>
        )}

        {verified && (
          <div className="alert alert--success">✓ Verified! Signing you in…</div>
        )}

        <button
          className={`btn-primary${(!full || locked || expired || verified || loading) ? ' disabled' : ''}${loading ? ' loading' : ''}`}
          onClick={handleVerify}
          disabled={!full || locked || expired || verified || loading}
        >
          {loading ? <span className="spinner" /> : 'Verify'}
        </button>

        <div className="link-row">
          <button
            className={`btn-link${!expired && !locked ? ' btn-link--dimmed' : ''}`}
            onClick={handleResend}
            disabled={loading}
          >
            Resend OTP
          </button>
          <button className="btn-link" onClick={onBack} disabled={loading}>
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
