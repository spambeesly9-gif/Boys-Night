import { useEffect, useState } from 'react';

export default function CountdownTimer({ duration, onExpire, colorClass = 'text-brand-red' }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (timeLeft <= 0) { onExpire?.(); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, onExpire]);

  const pct = timeLeft / duration;
  const size = 64;
  const r = 26;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  const ringColor =
    pct > 0.5 ? '#10B981' : pct > 0.25 ? '#F59E0B' : '#E63946';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="5" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth="5"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="countdown-ring"
        />
      </svg>
      <span
        className={`absolute font-display font-semibold text-lg ${
          timeLeft <= 10 ? 'text-brand-red' : 'text-gray-700'
        }`}
      >
        {timeLeft}
      </span>
    </div>
  );
}
