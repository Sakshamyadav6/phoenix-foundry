import { useEffect, useRef } from 'react';
import { Reveal, prefersReducedMotion } from './shared.jsx';

const TRACKS = [
  {
    title: 'Community',
    pill: 'Open to everyone',
    body: 'Show up, meet other builders, and learn by doing. Come to one event or all of them.',
    items: ['Founder talks', 'Hands-on workshops', 'Pitch nights', 'Idea jams'],
  },
  {
    title: 'Foundry Cohort',
    pill: 'By application · each semester',
    body: 'A focused semester for teams ready to build, with real milestones and a stage at the end.',
    items: ['A small group of teams', 'Weekly sessions with milestones', 'A matched mentor', 'A final Demo Day'],
    cohort: true,
  },
];

const STEPS = [
  { title: 'Validate the problem', body: 'Make sure the problem is real and worth solving.' },
  { title: 'Talk to customers', body: 'Get out of the building and learn from the people you serve.' },
  { title: 'Build the MVP', body: 'Ship the smallest version that proves your idea works.' },
  { title: 'Shape the business', body: 'Figure out who pays, how, and what it takes to grow.' },
  { title: 'Pitch at Demo Day', body: 'Present your venture to judges and investors.' },
];

/**
 * Molten pour through the cohort stages, tied to scroll.
 * Sets --progress (0..1) and line geometry on the list, and marks each stage
 * cold (not reached), hot (metal just arrived) or cooled (already passed).
 */
function useMoltenTimeline() {
  const ref = useRef(null);

  useEffect(() => {
    const list = ref.current;
    if (!list || prefersReducedMotion()) return;
    const steps = [...list.querySelectorAll('.step')];
    const wide = window.matchMedia('(min-width: 900px)');
    let stops = [];
    let raf = 0;

    // Line runs from the first stage marker to the last; stops are each marker's position along it.
    const measure = () => {
      const box = list.getBoundingClientRect();
      const centers = steps.map((s) => {
        const r = s.querySelector('.step-dot').getBoundingClientRect();
        return wide.matches ? r.left + r.width / 2 - box.left : r.top + r.height / 2 - box.top;
      });
      const start = centers[0];
      const len = Math.max(1, centers[centers.length - 1] - start);
      list.style.setProperty('--ls', `${start}px`);
      list.style.setProperty('--ll', `${len}px`);
      stops = centers.map((c) => (c - start) / len);
    };

    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const r = list.getBoundingClientRect();
      // Pour starts when the timeline is 85% down the screen; on phones it follows the list's height
      const range = vh * 0.45 + (wide.matches ? 0 : r.height * 0.6);
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / range));
      list.style.setProperty('--progress', p.toFixed(4));
      steps.forEach((s, i) => {
        const t = stops[i] ?? 0;
        const last = i === steps.length - 1;
        const state = p < t - 0.01 ? 'cold' : p < t + 0.22 || (last && p >= 1) ? 'hot' : 'cooled';
        if (s.dataset.state !== state) s.dataset.state = state;
      });
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
    const onResize = () => { measure(); schedule(); };

    measure();
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return ref;
}

export default function WhatToExpect() {
  const stepsRef = useMoltenTimeline();

  return (
    <section className="section on-dark" id="what-to-expect" aria-labelledby="expect-title">
      <div className="wrap">
        <Reveal className="section-head">
          <h2 id="expect-title">Two ways in. One community.</h2>
          <p>Start with open events anytime. When you're ready to build, apply to the cohort.</p>
        </Reveal>

        <div className="tracks">
          {TRACKS.map((t, i) => (
            <Reveal as="article" className={`track heat${t.cohort ? ' cohort' : ''}`} delay={i * 120} key={t.title}>
              <div className="track-top">
                <h3>{t.title}</h3>
                <span className="pill">{t.pill}</span>
              </div>
              <p>{t.body}</p>
              <ul>
                {t.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </Reveal>
          ))}
        </div>

        <div className="journey">
          <Reveal className="journey-head">
            <h3>The cohort journey</h3>
            <p>From raw idea to finished venture in one semester.</p>
          </Reveal>
          <ol className="steps" ref={stepsRef}>
            {STEPS.map((s, i) => (
              <Reveal as="li" className="step" delay={i * 90} key={s.title}>
                <span className="step-dot" aria-hidden="true">{i + 1}</span>
                <div className="step-body">
                  <h4>{s.title}</h4>
                  <p>{s.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
