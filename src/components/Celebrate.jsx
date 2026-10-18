import { useEffect, useRef } from 'react';
import { PHOENIX, PHOENIX_VIEWBOX } from './Hero.jsx';
import { prefersReducedMotion, throwSparks } from './shared.jsx';

/*
 * The "you applied!" moment. The phoenix streaks in from the bottom-left at speed (blur + speed lines,
 * along the site's rising slat angle), overshoots into the centre and lands with a squash-and-bounce,
 * a flash, a shock ring, sparks and confetti; hovers flapping its wing; then shrinks and flies into the
 * thank-you card's circle, where `onLand` draws the check mark.
 */
const CONFETTI = ['#0B3D2A', '#0A5A47', '#E7B864', '#C29B5F', '#E4EBE5', '#1A6C4E'];
const LAND = 600;   // ms: reaches the centre
const LEAVE = 1900; // ms: flies to the card
const END = 2500;   // ms: done

function confetti(x, y, count) {
  if (!document.body.animate) return;
  for (let i = 0; i < count; i++) {
    const bit = document.createElement('span');
    bit.className = 'confetti';
    bit.style.left = `${x}px`;
    bit.style.top = `${y}px`;
    bit.style.background = CONFETTI[i % CONFETTI.length];
    if (i % 3 === 0) bit.style.borderRadius = '50%';
    document.body.appendChild(bit);
    const angle = Math.random() * Math.PI * 2;
    const power = 120 + Math.random() * 260;
    const dx = Math.cos(angle) * power;
    const dy = Math.sin(angle) * power * 0.7 - 120;
    const spin = (Math.random() - 0.5) * 900;
    bit
      .animate(
        [
          { transform: 'translate(-50%, -50%) rotate(0deg)', opacity: 1 },
          { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${spin / 2}deg)`, opacity: 1, offset: 0.45 },
          { transform: `translate(calc(-50% + ${dx * 1.25}px), calc(-50% + ${dy + 380}px)) rotate(${spin}deg)`, opacity: 0 },
        ],
        { duration: 1500 + Math.random() * 900, easing: 'cubic-bezier(.15,.7,.4,1)' }
      )
      .finished.then(() => bit.remove(), () => bit.remove());
  }
}

export default function Celebrate({ target, onLand, onDone }) {
  const rootRef = useRef(null);
  const flyRef = useRef(null);
  const markRef = useRef(null);

  useEffect(() => {
    const finish = () => { onLand?.(); onDone?.(); };
    if (prefersReducedMotion()) { finish(); return undefined; }
    const root = rootRef.current;
    const fly = flyRef.current;
    const mark = markRef.current;
    const W = window.innerWidth;
    const H = window.innerHeight;
    // Line of travel: from beyond the bottom-left corner up to the centre
    const fromX = -0.62 * W;
    const fromY = 0.62 * H;
    root.style.setProperty('--a', `${Math.atan2(-fromY, -fromX)}rad`);

    const timers = [];
    const later = (ms, fn) => timers.push(setTimeout(fn, ms));

    // 1. Streak in, blurred, overshoot and settle
    fly.animate(
      [
        { transform: `translate(${fromX}px, ${fromY}px) rotate(-38deg) scale(0.35)`, filter: 'blur(8px)', opacity: 0 },
        { opacity: 1, offset: 0.15 },
        { transform: 'translate(0, 0) rotate(10deg) scale(1.15)', filter: 'blur(0px)', opacity: 1, offset: 0.82 },
        { transform: 'translate(0, 0) rotate(0deg) scale(1)', filter: 'blur(0px)', opacity: 1 },
      ],
      { duration: LAND + 150, easing: 'cubic-bezier(.2, .9, .25, 1)', fill: 'forwards' }
    );

    // 2. Impact: squash and bounce, flash, ring, sparks, confetti
    later(LAND, () => {
      root.classList.add('is-landed');
      mark.animate(
        [
          { transform: 'scale(1, 1)' },
          { transform: 'scale(1.2, 0.8)' },
          { transform: 'scale(0.9, 1.12)' },
          { transform: 'scale(1.04, 0.97)' },
          { transform: 'scale(1, 1)' },
        ],
        { duration: 520, easing: 'ease-out' }
      );
      const r = mark.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      throwSparks(cx, cy, 26, 140);
      setTimeout(() => throwSparks(cx, cy, 18, 90), 120);
      confetti(cx, cy - r.height * 0.1, 70);
    });

    // 3. Fly into the thank-you circle
    later(LEAVE, () => {
      const t = target?.current?.getBoundingClientRect();
      if (!t) return;
      const m = fly.getBoundingClientRect();
      const dx = t.left + t.width / 2 - (m.left + m.width / 2);
      const dy = t.top + t.height / 2 - (m.top + m.height / 2);
      const s = (t.width * 0.55) / m.width;
      root.classList.add('is-leaving');
      fly.animate(
        [
          { transform: 'translate(0, 0) rotate(0deg) scale(1)', opacity: 1 },
          { transform: `translate(${dx * 0.15}px, ${dy * 0.15 - 40}px) rotate(-8deg) scale(1.08)`, opacity: 1, offset: 0.25 },
          { transform: `translate(${dx}px, ${dy}px) rotate(0deg) scale(${s})`, opacity: 0 },
        ],
        { duration: END - LEAVE - 50, easing: 'cubic-bezier(.6, 0, .3, 1)', fill: 'forwards' }
      );
    });
    later(END - 120, () => onLand?.());
    later(END, () => onDone?.());
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="celebrate" ref={rootRef} aria-hidden="true">
      <span className="celebrate-flash" />
      {[0, 1, 2, 3, 4, 5].map((i) => <span className="speed-line" style={{ '--i': i }} key={i} />)}
      <div className="celebrate-fly" ref={flyRef}>
        <span className="celebrate-ring" />
        <svg className="celebrate-mark" ref={markRef} viewBox={PHOENIX_VIEWBOX}>
          {PHOENIX.map((p, i) => <path d={p.d} key={i} className={i === 1 ? 'flap' : undefined} />)}
        </svg>
      </div>
    </div>
  );
}
