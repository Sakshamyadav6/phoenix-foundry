import { useEffect, useRef, useState } from 'react';
import { PHOENIX, PHOENIX_VIEWBOX } from './Hero.jsx';
import { prefersReducedMotion, throwSparks } from './shared.jsx';

/*
 * Opening sequence, once per browser session:
 * the two halves of the phoenix mark fly in from opposite sides and smash together (shake, shock ring,
 * sparks), "Phoenix Foundry" rises letter by letter, a gold seam draws down the middle, and the screen
 * splits into two gate doors that swing open onto the site. Skipped for reduced motion.
 */
const KEY = 'pf-intro-seen';
const IMPACT = 850;  // ms: halves meet
const OPEN = 2400;   // ms: gates start opening
const DONE = 3350;   // ms: overlay removed
const WORD = 'Phoenix Foundry';

function shouldPlay() {
  if (typeof window === 'undefined' || prefersReducedMotion()) return false;
  try { return !sessionStorage.getItem(KEY); } catch { return true; }
}

/** The centered mark + wordmark. Rendered once inside each gate door, each clipped to its half. */
function Stage({ markRef }) {
  const half = (side) => (
    <svg className={`intro-half intro-half-${side}`} viewBox={PHOENIX_VIEWBOX} aria-hidden="true">
      {PHOENIX.map((p, i) => <path d={p.d} key={i} />)}
    </svg>
  );
  return (
    <div className="intro-stage">
      <div className="intro-mark" ref={markRef}>
        <span className="intro-ring" />
        {half('l')}
        {half('r')}
      </div>
      <p className="intro-word" aria-hidden="true">
        {[...WORD].map((ch, i) => (
          <span key={i} style={{ '--i': i }}>{ch === ' ' ? ' ' : ch}</span>
        ))}
      </p>
      <p className="intro-tag" aria-hidden="true">Where Phoenix Founders Rise.</p>
    </div>
  );
}

export default function Intro() {
  const [phase, setPhase] = useState(() => (shouldPlay() ? 'play' : 'off'));
  const markRef = useRef(null);
  const timers = useRef([]);

  const finish = () => {
    timers.current.forEach(clearTimeout);
    document.documentElement.classList.remove('intro-playing');
    document.documentElement.style.overflow = '';
    try { sessionStorage.setItem(KEY, '1'); } catch { /* fine: it just plays again next visit */ }
    setPhase('off');
  };

  const open = () => {
    timers.current.forEach(clearTimeout);
    setPhase('open');
    timers.current = [setTimeout(finish, DONE - OPEN)];
  };

  useEffect(() => {
    if (phase !== 'play') return undefined;
    const root = document.documentElement;
    root.classList.add('intro-playing'); // holds the hero's own entrance until the gates open
    root.style.overflow = 'hidden';
    timers.current = [
      setTimeout(() => {
        const r = markRef.current?.getBoundingClientRect();
        if (!r) return;
        const x = r.left + r.width / 2;
        const y = r.top + r.height * 0.55;
        throwSparks(x, y, 22, 110);
        setTimeout(() => throwSparks(x, y, 14, 70), 90);
      }, IMPACT),
      setTimeout(open, OPEN),
    ];
    const onKey = (e) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') open(); };
    window.addEventListener('keydown', onKey);
    return () => {
      timers.current.forEach(clearTimeout);
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === 'off') return null;

  return (
    <div className={`intro${phase === 'open' ? ' is-open' : ''}`} role="status" aria-label="Loading Phoenix Foundry">
      <div className="intro-door intro-door-l" aria-hidden="true"><Stage markRef={markRef} /></div>
      <div className="intro-door intro-door-r" aria-hidden="true"><Stage /></div>
      <span className="intro-seam" aria-hidden="true" />
      <button type="button" className="intro-skip" onClick={open}>Skip intro</button>
    </div>
  );
}
