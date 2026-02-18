import { useRef, useMemo, useCallback } from 'react';
import { useSessionTimer } from '../hooks/useSessionTimer';
import { logLogout } from '../services/analytics';

interface Props {
  email: string;
  onLogout: () => void;
}

export default function SessionScreen({ email, onLogout }: Props) {
  const startTimeRef = useRef(Date.now());
  
  const { elapsed, formatted } = useSessionTimer(startTimeRef.current);

  const startTimeDisplay = useMemo(
    () => new Date(startTimeRef.current).toLocaleTimeString(),
    []
  );

  const handleLogout = useCallback(() => {
    logLogout(email, elapsed);
    onLogout();
  }, [email, elapsed, onLogout]);

  return (
    <div className="screen session-screen">
      <div className="card card--wide">
        <div className="brand">
          <div className="brand-dot brand-dot--active" />
          <span>LOKAL</span>
          <span className="live-badge">LIVE</span>
        </div>

        <div className="user-card">
          <div className="user-avatar">{email[0].toUpperCase()}</div>
          <div className="user-email">{email}</div>
          <div className="user-meta">Session started at {startTimeDisplay}</div>
        </div>

        <div className="digital-clock">
          <div className="clock-display">
            <span className="clock-digit">{formatted[0]}</span>
            <span className="clock-digit">{formatted[1]}</span>
            <span className="clock-separator">:</span>
            <span className="clock-digit">{formatted[3]}</span>
            <span className="clock-digit">{formatted[4]}</span>
          </div>
          <div className="clock-label">SESSION DURATION</div>
        </div>

        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
