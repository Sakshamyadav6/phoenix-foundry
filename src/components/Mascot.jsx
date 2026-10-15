import { useCallback, useEffect, useRef, useState } from 'react';
import { prefersReducedMotion, throwSparks } from './shared.jsx';
import { FOALS, foundFoals } from './Foal.jsx';

// What Uni says in each part of the page. Keys match section ids (hero and footer use their own keys).
const TIPS = {
  hero: "Hi, I'm Uni. Five baby unicorns are hiding on this page. Scroll with me and see if you can find them all!",
  'who-we-are': "Learn, build, launch. That's the whole loop.",
  'who-can-join': 'Every unicorn starts as a rough idea. Or no idea yet. Curious counts.',
  'what-to-expect': 'Five stages, one semester. Demo Day is where it all lands.',
  join: 'Membership is free. No dues, ever. Even for unicorns.',
  team: 'These are the students running the Foundry. Say hi at an event!',
  footer: 'Thanks for the ride. Now go build a unicorn!',
};

// Leg geometry in the drawing (faces right). Joint = hip/shoulder, knee = hock/knee.
// Phase offsets (fraction of a stride) for a 4-beat walk and for a gallop.
const LEGS = [
  { id: 'farHind', joint: [76, 76], knee: [69, 112], hind: true, far: true, walk: 0, gallop: 0 },
  { id: 'farFore', joint: [118, 80], knee: [118, 113], hind: false, far: true, walk: 0.25, gallop: 0.5 },
  { id: 'nearHind', joint: [64, 76], knee: [57, 112], hind: true, far: false, walk: 0.5, gallop: 0.12 },
  { id: 'nearFore', joint: [128, 80], knee: [128, 113], hind: false, far: false, walk: 0.75, gallop: 0.62 },
];

/** Uni: a molten-gold unicorn that walks and gallops along the bottom of the screen as you scroll. */
export default function Mascot() {
  const ref = useRef(null);
  const parts = useRef({});
  const [section, setSection] = useState('hero');
  const [talking, setTalking] = useState(false);
  const [note, setNote] = useState(null); // overrides the section tip after a foal is found
  const [found, setFound] = useState(0);
  const [party, setParty] = useState(false);
  const [hidden, setHidden] = useState(false);
  const hideTimer = useRef(0);

  const say = useCallback((ms = 4500) => {
    setTalking(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setTalking(false), ms);
  }, []);

  // Greet (and mention the hidden foals) once the visitor has scrolled the hero's first chapter away,
  // so the bubble never sits on the hero's buttons. Large screens only; elsewhere, tap Uni.
  useEffect(() => {
    if (!window.matchMedia('(min-width: 1200px) and (min-height: 820px)').matches) return;
    const onScroll = () => {
      if (window.scrollY < window.innerHeight * 0.6) return;
      window.removeEventListener('scroll', onScroll);
      say(6000);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); clearTimeout(hideTimer.current); };
  }, [say]);

  // Track which section is in the middle of the screen
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const targets = [...document.querySelectorAll('.hero, main section[id], footer')];
    const keyOf = (el) => (el.classList.contains('hero') ? 'hero' : el.tagName === 'FOOTER' ? 'footer' : el.id);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setSection(keyOf(e.target))),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  // Tips follow the section in view but only open when Uni is tapped, so they never cover the page.
  // Moving to a new section closes any open tip.
  useEffect(() => {
    setTalking(false);
    setNote(null);
  }, [section]);

  // Keep score of the hidden foals
  useEffect(() => {
    setFound(foundFoals().size);
    const onFound = (e) => {
      const { count, again } = e.detail;
      setFound(count);
      setHidden(false);
      if (again) setNote(`Already found that one. ${count} of ${FOALS} so far.`);
      else if (count >= FOALS) {
        setNote(`All ${FOALS} found! You've got an eye for unicorns. Now go build a real one.`);
        setParty(true);
        setTimeout(() => setParty(false), 1600);
        const r = ref.current?.getBoundingClientRect();
        if (r) [0, 250, 500].forEach((d) => setTimeout(() => throwSparks(r.left + r.width / 2, r.top + r.height / 3, 18, 70), d));
      } else setNote(`You found a baby unicorn! ${count} of ${FOALS}. ${FOALS - count} still hiding.`);
      say(5200);
    };
    window.addEventListener('foal-found', onFound);
    return () => window.removeEventListener('foal-found', onFound);
  }, [say]);

  // Movement: position follows scroll progress; legs cycle in step with the distance travelled.
  useEffect(() => {
    const el = ref.current;
    if (!el || hidden) return;
    const p = parts.current;
    const margin = 8;

    const targetX = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      return margin + progress * (window.innerWidth - el.offsetWidth - margin * 2);
    };
    const setFacing = (dir) => {
      if (el.dataset.face !== dir) el.dataset.face = dir;
    };
    const setAnchor = (x) => {
      const anchor = x + el.offsetWidth / 2 > window.innerWidth / 2 ? 'right' : 'left';
      if (el.dataset.anchor !== anchor) el.dataset.anchor = anchor;
    };

    if (prefersReducedMotion()) {
      const x = window.innerWidth - el.offsetWidth - margin;
      el.style.transform = `translateX(${x}px)`;
      setFacing('left');
      setAnchor(x);
      return;
    }

    let x = targetX();
    let phase = 0;
    let speed = 0; // 0 = standing, ~1 = full gallop
    let last = performance.now();
    let raf = 0;
    const t0 = last;
    setFacing('right');

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const w = el.offsetWidth;

      // Glide toward the scroll-linked target; velocity drives the gait
      const prev = x;
      x += (targetX() - x) * (1 - Math.exp(-dt * 5));
      const vx = dt > 0 ? (x - prev) / dt : 0;
      if (vx > 4) setFacing('right');
      else if (vx < -4) setFacing('left');

      const targetSpeed = Math.min(1, Math.abs(vx) / (w * 2.2));
      speed += (targetSpeed - speed) * (1 - Math.exp(-dt * 6));
      const stride = w * 0.42; // px covered per full leg cycle
      const freq = Math.min(3.2, Math.abs(vx) / stride + speed * 0.4);
      phase += freq * dt;

      const g = Math.min(1, Math.max(0, (speed - 0.35) / 0.4)); // walk → gallop blend
      const swing = Math.min(1, speed * 2.2); // legs settle to standing as speed drops

      LEGS.forEach((leg) => {
        const off = leg.walk * (1 - g) + leg.gallop * g;
        const a = (phase + off) * Math.PI * 2;
        const upperAmp = (16 + 18 * g) * swing;
        const kneeAmp = (34 + 46 * g) * swing;
        const upper = -upperAmp * Math.sin(a) * (leg.hind ? 0.85 : 1);
        const flex = kneeAmp * Math.max(0, Math.cos(a));
        const knee = leg.hind ? -flex * 0.8 : flex;
        p[leg.id + 'U']?.setAttribute('transform', `rotate(${upper.toFixed(2)} ${leg.joint[0]} ${leg.joint[1]})`);
        p[leg.id + 'L']?.setAttribute('transform', `rotate(${knee.toFixed(2)} ${leg.knee[0]} ${leg.knee[1]})`);
      });

      // Body bounce and pitch, head nod, tail flow
      const a = phase * Math.PI * 2;
      const t = (now - t0) / 1000;
      const bob = -swing * (1.5 + 4 * g) * Math.abs(Math.sin(a * (g > 0.5 ? 1 : 2)));
      const pitch = swing * 3 * g * Math.sin(a);
      p.body?.setAttribute('transform', `translate(0 ${bob.toFixed(2)}) rotate(${pitch.toFixed(2)} 96 72)`);
      const nod = -swing * (3 + 4 * g) * Math.sin(a + 1) + Math.sin(t * 1.4) * 1.2 * (1 - swing);
      p.neck?.setAttribute('transform', `rotate(${nod.toFixed(2)} 122 56)`);
      const tail = Math.sin(t * 2.2) * 6 * (1 - swing) + swing * (10 + 14 * g) * Math.sin(a + 0.6) - swing * 12 * g;
      p.tail?.setAttribute('transform', `rotate(${tail.toFixed(2)} 50 56)`);

      el.style.transform = `translateX(${x.toFixed(1)}px)`;
      setAnchor(x);
      raf = requestAnimationFrame(frame);
    };

    const start = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const onVisibility = () => (document.hidden ? stop() : start());
    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [hidden]);

  if (hidden) return null;

  return (
    <div className={`founder${party ? ' is-party' : ''}`} ref={ref}>
      <div className={`founder-bubble${talking ? ' is-on' : ''}`}>
        <p aria-live="polite">{note || TIPS[section] || TIPS.hero}</p>
        <button type="button" className="founder-hide" onClick={() => setHidden(true)}>Hide Uni</button>
      </div>
      <button
        type="button"
        className="founder-btn"
        aria-label="Uni, the Phoenix Foundry unicorn mascot. Tap for a tip."
        onClick={() => say()}
      >
        <UnicornSvg parts={parts} />
      </button>
      {found > 0 && <span className="founder-count">{found}/{FOALS} found</span>}
    </div>
  );
}

/** Molten-gold unicorn silhouette, facing right, with jointed legs driven from Mascot. */
/** Molten-gold unicorn silhouette, facing right, with jointed legs driven from Mascot. */
function UnicornSvg({ parts }) {
  const set = (key) => (node) => { parts.current[key] = node; };

  const leg = (l) => {
    const [jx, jy] = l.joint;
    const [kx, ky] = l.knee;
    const fill = l.far ? 'url(#uni-far)' : 'url(#uni-coat)';
    const hx = kx + (l.hind ? 1.5 : 0);
    return (
      <g key={l.id} ref={set(l.id + 'U')}>
        {/* upper leg: thick at the body, tapering to the knee/hock */}
        <path
          d={`M${jx - 8} ${jy - 6} L${jx + 8} ${jy - 6} L${kx + 3.6} ${ky} L${kx - 3.6} ${ky} Z`}
          fill={fill}
          stroke={fill}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <circle cx={kx} cy={ky} r="4.2" fill={fill} />
        {/* lower leg + hoof */}
        <g ref={set(l.id + 'L')}>
          <path d={`M${kx - 3} ${ky} L${kx + 3} ${ky} L${hx + 2.6} ${ky + 26} L${hx - 2.6} ${ky + 26} Z`} fill={fill} />
          <path
            d={`M${hx - 3.2} ${ky + 25} h6.4 l1.6 6.5 a1 1 0 0 1 -1 1.2 h-7.6 a1 1 0 0 1 -1 -1.2 z`}
            fill={l.far ? '#3B2416' : '#4A2E1C'}
          />
        </g>
      </g>
    );
  };

  return (
    <svg className="founder-svg" viewBox="0 0 200 150" aria-hidden="true">
      <defs>
        {/* Gradients span the whole drawing so body and legs blend with no seams */}
        <linearGradient id="uni-coat" gradientUnits="userSpaceOnUse" x1="0" y1="10" x2="0" y2="146">
          <stop offset="0" stopColor="#FFE09A" />
          <stop offset="0.45" stopColor="#F7A850" />
          <stop offset="1" stopColor="#D9592A" />
        </linearGradient>
        <linearGradient id="uni-far" gradientUnits="userSpaceOnUse" x1="0" y1="60" x2="0" y2="146">
          <stop offset="0" stopColor="#D27A36" />
          <stop offset="1" stopColor="#A63F17" />
        </linearGradient>
        <linearGradient id="uni-mane" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F2763A" />
          <stop offset="1" stopColor="#C2361A" />
        </linearGradient>
        <linearGradient id="uni-horn" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#FFE7B0" />
          <stop offset="1" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>

      <ellipse className="uni-shadow" cx="96" cy="147" rx="52" ry="3" />

      <g className="uni-flip">
        <g ref={set('body')}>
          {/* far-side legs (darker, behind the body) */}
          {LEGS.filter((l) => l.far).map(leg)}

          {/* flame tail */}
          <g ref={set('tail')}>
            <path
              d="M52 54c-12-4-22 2-26 14-3 10-8 18-16 22 10 2 20-2 26-10-2 8-1 15 4 20 1-10 6-18 12-24 4-5 6-12 4-18z"
              fill="url(#uni-mane)"
            />
            <path d="M46 60c-8 0-14 6-15 14" stroke="#FFC680" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
          </g>

          {/* barrel */}
          <path
            d="M48 60c4-12 22-17 44-13 12 2 22-3 32-1 12 3 18 14 16 27-2 12-12 18-26 20-18 3-38 3-52-2-12-4-17-17-14-31z"
            fill="url(#uni-coat)"
          />
          {/* sheen along the back */}
          <path d="M60 52c12-4 26-4 38-1" stroke="#FFF1CF" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.7" />

          {/* near-side legs */}
          {LEGS.filter((l) => !l.far).map(leg)}

          {/* neck, head, mane, horn: nods as one piece */}
          <g ref={set('neck')}>
            <path
              d="M112 50c4-12 14-26 28-34l16 8c-6 8-10 18-11 30-1 10-4 18-10 22-8 2-16-2-20-10z"
              fill="url(#uni-coat)"
            />
            {/* head */}
            <path
              d="M138 18c6-8 18-8 24-1l18 21c4 5 2 12-5 13-5 1-9-1-13-5l-10-9c-6-1-12-4-14-10z"
              fill="url(#uni-coat)"
            />
            <path d="M144 15l1-12 7 11z" fill="url(#uni-coat)" />
            {/* nostril, mouth, eye */}
            <ellipse cx="175.5" cy="44" rx="1.5" ry="1.1" fill="#7A3414" />
            <path d="M172.5 48.5c-2 .6-4 .4-6-.6" stroke="#7A3414" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M154 25.5c2-2 5-2.2 7-.4-2 2.2-5 2.4-7 .4z" fill="#3A1A0A" />
            <path d="M152.5 22.6c2.6-1.6 6-1.6 8.8.2" stroke="#9C4A1C" strokeWidth="1.3" fill="none" strokeLinecap="round" />
            {/* horn: long, sharp, spiralled */}
            <path d="M152 15.5 172 -12 157.5 17.5z" fill="url(#uni-horn)" />
            <path d="M156.5 11l3.6.8M160.5 5l3 .7M164.5 -1l2.4.6M168 -6.5l1.8.4" stroke="#E8B860" strokeWidth="1.1" strokeLinecap="round" />
            {/* flame mane down the crest */}
            <path
              d="M140 14c-8 2-14 8-18 16-4 7-10 12-16 14 7 2 13 0 17-4-2 6-1 11 2 15 2-7 6-12 10-15-1 5 0 9 3 12 1-8 5-14 9-18 3-3 4-7 3-11 4 0 8-3 9-7-6 1-12 0-19-2z"
              fill="url(#uni-mane)"
            />
            <path d="M139 20c-6 3-10 8-12 14" stroke="#FFC680" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.85" />
          </g>
        </g>
      </g>
    </svg>
  );
}
