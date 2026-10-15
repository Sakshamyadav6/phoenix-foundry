import { useEffect, useRef, useState } from 'react';
import { Reveal, SectionHead } from './shared.jsx';
import Foal from './Foal.jsx';

const TRACKS = [
  {
    title: 'Community',
    pill: 'Open to everyone',
    body: 'Show up, meet other builders, and learn by doing. Come to one event or all of them.',
    items: ['Founder talks', 'Hands-on workshops', 'Pitch nights', 'Idea jams'],
    glance: [['Who', 'Every UWGB student'], ['When', 'Anytime, all year'], ['Commitment', 'One event, or all of them']],
  },
  {
    title: 'Foundry Cohort',
    pill: 'By application · each semester',
    body: 'A focused semester for teams ready to build, with real milestones and a stage at the end.',
    items: ['A small group of teams', 'Weekly sessions with milestones', 'A matched mentor', 'A final Demo Day'],
    glance: [['Who', 'Teams, by application'], ['When', 'Each semester'], ['Commitment', 'Weekly sessions']],
  },
];

const STEPS = [
  { title: 'Validate the problem', body: 'Make sure the problem is real and worth solving.' },
  { title: 'Talk to customers', body: 'Get out of the building and learn from the people you serve.' },
  { title: 'Build the MVP', body: 'Ship the smallest version that proves your idea works.' },
  { title: 'Shape the business', body: 'Figure out who pays, how, and what it takes to grow.' },
  { title: 'Pitch at Demo Day', body: 'Present your venture to judges and investors.' },
];

// Mini growth chart for the tracker: one point per stage, flat then up
const SPARK = [[8, 52], [58, 48], [108, 50], [158, 30], [208, 8]];

function Tracks() {
  const [t, setT] = useState(1);
  const track = TRACKS[t];
  const onKey = (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = t === 0 ? 1 : 0;
    setT(next);
    e.currentTarget.querySelectorAll('[role="tab"]')[next].focus();
  };

  return (
    <Reveal className="tracks">
      <div className="switch" role="tablist" aria-label="Two ways in" onKeyDown={onKey} style={{ '--t': t }}>
        <span className="switch-thumb" aria-hidden="true" />
        {TRACKS.map((tr, i) => (
          <button
            key={tr.title}
            type="button"
            role="tab"
            id={`track-tab-${i}`}
            aria-selected={i === t}
            aria-controls="track-panel"
            tabIndex={i === t ? 0 : -1}
            onClick={() => setT(i)}
          >
            {tr.title}
          </button>
        ))}
      </div>

      <div className="track-panel" role="tabpanel" id="track-panel" aria-labelledby={`track-tab-${t}`} key={t}>
        <div className="track-main">
          <p className="track-pill">{track.pill}</p>
          <h3>{track.title}</h3>
          <p className="track-body">{track.body}</p>
          <ul className="track-items">
            {track.items.map((item) => (
              <li key={item}>
                <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 10.5 3 3 7-7" /></svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <dl className="glance">
          {track.glance.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
      </div>
    </Reveal>
  );
}

/** The cohort journey: stage cards scroll past a sticky tracker that follows the one in view. */
function Journey() {
  const [active, setActive] = useState(0);
  const listRef = useRef(null);

  useEffect(() => {
    const cards = [...listRef.current.querySelectorAll('.stage')];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(cards.indexOf(e.target))),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  const [x, y] = SPARK[active];
  const line = SPARK.map((p) => p.join(',')).join(' ');
  const done = SPARK.slice(0, active + 1).map((p) => p.join(',')).join(' ');

  return (
    <div className="journey">
      <Reveal className="journey-head">
        <h3>The cohort journey</h3>
        <p>From raw idea to finished venture in one semester.</p>
      </Reveal>

      <div className="journey-grid">
        <div className="tracker" aria-hidden="true">
          <p className="tracker-label">Stage</p>
          <p className="tracker-num"><strong key={active}>0{active + 1}</strong><span>/05</span></p>
          <p className="tracker-title" key={STEPS[active].title}>{STEPS[active].title}</p>
          <svg className="tracker-chart" viewBox="0 0 216 60">
            <polyline className="spark-ghost" points={line} />
            <polyline className="spark-done" points={done} />
            {SPARK.map(([px, py], i) => (
              <circle key={i} cx={px} cy={py} r={i === active ? 5 : 3} className={i <= active ? 'on' : ''} />
            ))}
            <circle className="spark-halo" cx={x} cy={y} r="10" />
          </svg>
          <div className="tracker-bar"><span style={{ transform: `scaleX(${(active + 1) / STEPS.length})` }} /></div>
        </div>

        <ol className="stages" ref={listRef}>
          {STEPS.map((s, i) => (
            <li className={`stage${i === active ? ' is-active' : ''}${i < active ? ' is-done' : ''}`} key={s.title}>
              {i === STEPS.length - 1 && <Foal id="demo-day" className="foal-stage" />}
              <span className="stage-num">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h4>{s.title}</h4>
                <p>{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default function WhatToExpect() {
  return (
    <section className="section canvas" id="what-to-expect" aria-labelledby="expect-title">
      <div className="wrap">
        <SectionHead index="03" label="What to expect" id="expect-title" title="Two ways in. One community.">
          <p>Start with open events anytime. When you're ready to build, apply to the cohort.</p>
        </SectionHead>
        <Tracks />
        <Journey />
      </div>
    </section>
  );
}
