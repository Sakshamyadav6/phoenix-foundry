import { useEffect, useRef, useState } from 'react';
import { Reveal, SectionHead, prefersReducedMotion } from './shared.jsx';
import Foal from './Foal.jsx';

const STATEMENT =
  "Phoenix Foundry is UW-Green Bay's student founder incubator. We give students of every major the skills, " +
  "structure, and people they need to turn an idea into a real venture, and we're building a community of " +
  'founders on campus along the way.';

const LOOP = [
  {
    title: 'Learn',
    lead: 'Hands-on startup skills, not theory.',
    body: 'Workshops built around doing the work, from finding a problem to talking with customers.',
  },
  {
    title: 'Build',
    lead: 'Turn your idea into something real.',
    body: 'Work with a team and a mentor to get from a rough concept to a working first version.',
  },
  {
    title: 'Launch',
    lead: 'Pitch to real judges and investors.',
    body: 'Take what you built to the Demo Day stage at the end of the cohort.',
  },
];

const NAME = [
  { word: 'Phoe·nix', ipa: '/ˈfiː.nɪks/', def: "UWGB's mascot, and a symbol of rising and rebirth." },
  { word: 'Foun·dry', ipa: '/ˈfaʊn.dri/', def: 'A place where raw material is forged into something real.' },
];

/** Words of the statement go from faint to full ink as it scrolls up the screen. */
function useInkOnScroll() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = [...el.querySelectorAll('.ink-word')];
    if (prefersReducedMotion()) { words.forEach((w) => w.classList.add('is-inked')); return; }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Starts when the paragraph's top reaches 85% down the screen, done when its bottom reaches 55%
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.3)));
      const k = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('is-inked', i < k));
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);
  return ref;
}

/**
 * Learn → Build → Launch, driven by scroll. The loop pins in place while the page scrolls through it:
 * the ring draws around and each stage takes over in turn. Clicking a stage scrolls to it.
 */
function Loop() {
  const [p, setP] = useState(0);
  const ref = useRef(null);

  // Scroll distance the pinned loop travels, and where it pins (under the nav)
  const measure = () => {
    const wrap = ref.current;
    const stage = wrap.firstElementChild;
    return { wrap, range: wrap.offsetHeight - stage.offsetHeight, top: parseFloat(getComputedStyle(stage).top) || 0 };
  };

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const { wrap, range, top } = measure();
      if (range <= 0) return; // not pinned (very short screens): stages change on click instead
      setP(Math.min(1, Math.max(0, (top - wrap.getBoundingClientRect().top) / range)));
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  const active = Math.min(LOOP.length - 1, Math.floor(p * LOOP.length));
  const go = (i) => {
    const target = (i + 0.5) / LOOP.length;
    const { wrap, range, top } = measure();
    if (range <= 0) { setP(target); return; }
    window.scrollTo({ top: wrap.getBoundingClientRect().top + window.scrollY - top + range * target, behavior: 'smooth' });
  };
  const onKey = (e) => {
    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = Math.min(LOOP.length - 1, Math.max(0, active + d));
    go(next);
    ref.current.querySelectorAll('[role="tab"]')[next].focus();
  };

  const stage = LOOP[active];
  return (
    <div className="loop-scroll" ref={ref}>
      <div className="loop">
        <div className="loop-ring">
          <svg viewBox="0 0 200 200" aria-hidden="true">
            <circle className="loop-track" cx="100" cy="100" r="84" />
            <circle className="loop-arc" cx="100" cy="100" r="84" pathLength="300" style={{ strokeDasharray: `${(p * 300).toFixed(1)} 300` }} />
          </svg>
          <div className="loop-center" aria-hidden="true">
            <span>The loop</span>
            <strong key={active}>0{active + 1}</strong>
          </div>
          <div role="tablist" aria-label="The Phoenix Foundry loop" onKeyDown={onKey}>
            {LOOP.map((s, i) => (
              <button
                key={s.title}
                type="button"
                role="tab"
                id={`loop-tab-${i}`}
                aria-selected={i === active}
                aria-controls="loop-panel"
                tabIndex={i === active ? 0 : -1}
                className={`loop-node node-${i}${i < active ? ' is-done' : ''}`}
                onClick={() => go(i)}
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>

        <div className="loop-panel" role="tabpanel" id="loop-panel" aria-labelledby={`loop-tab-${active}`}>
          <p className="loop-step">
            Step {active + 1} of 3
            {active < LOOP.length - 1 && <span className="loop-hint"> · keep scrolling</span>}
          </p>
          <h3 key={stage.title}>{stage.title}</h3>
          <p className="loop-lead" key={stage.lead}>{stage.lead}</p>
          <p className="loop-body" key={stage.body}>{stage.body}</p>
          <div className="loop-dots" aria-hidden="true">
            {LOOP.map((s, i) => (
              <span key={s.title}>
                <i style={{ transform: `scaleX(${Math.min(1, Math.max(0, p * LOOP.length - i)).toFixed(3)})` }} />
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WhoWeAre() {
  const inkRef = useInkOnScroll();

  return (
    <section className="section canvas" id="who-we-are" aria-labelledby="about-title">
      <div className="wrap">
        <SectionHead index="01" label="Who we are" id="about-title" title="A place to forge ideas into ventures." />

        <p className="statement" ref={inkRef}>
          {STATEMENT.split(' ').map((w, i) => <span className="ink-word" key={i}>{w} </span>)}
        </p>

        <Loop />

        <Reveal className="lexicon" aria-label="About the name">
          <Foal id="name" className="foal-lex" />
          {NAME.map((n) => (
            <div className="lex" key={n.word}>
              <p className="lex-word">{n.word}</p>
              <p className="lex-meta"><span>{n.ipa}</span> noun</p>
              <p className="lex-def">{n.def}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
