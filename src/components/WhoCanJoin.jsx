import { useEffect, useState } from 'react';
import { Arrow, Reveal, SectionHead, prefersReducedMotion } from './shared.jsx';
import Foal from './Foal.jsx';

const MAJORS = ['Nursing', 'Art', 'Computer Science', 'Business', 'Psychology', 'Biology', 'Communication', 'Accounting', 'Undecided'];

// "Where are you right now?" Each answer shows what to do next.
const PATHS = [
  {
    key: 'idea',
    label: 'I have an idea',
    title: 'Bring it to the Foundry Cohort.',
    body: 'Apply to the Foundry Cohort for structure, mentors, and a deadline to build it.',
    next: ['Join us on Phoenix Connect', 'Apply when the cohort window opens', 'Build it, and pitch it at Demo Day'],
    cta: 'Apply to the cohort',
  },
  {
    key: 'none',
    label: "I don't have one yet",
    title: 'Join a team, or find a problem.',
    body: 'Join a team that needs your skills, or pick a real campus problem and start solving it.',
    next: ['Join us on Phoenix Connect', 'Come to an idea jam', 'Meet teams looking for your skills'],
    cta: 'Find a team',
  },
  {
    key: 'curious',
    label: "I'm just curious",
    title: 'Come to an event. That is it.',
    body: 'Come to open workshops and pitch nights. No commitment, no application.',
    next: ['Pick a workshop or pitch night', 'Just show up, no application', 'Join Phoenix Connect to hear about the next one'],
    cta: 'Come to an event',
  },
];

/** "Founders who study ___": cycles through majors; click to spin it yourself. */
function MajorSlot() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || prefersReducedMotion()) return;
    const t = setInterval(() => setI((n) => (n + 1) % MAJORS.length), 2000);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <Reveal className="slot">
      <span className="slot-lead">Founders who study</span>
      <button
        type="button"
        className="slot-word"
        onClick={() => { setPaused(true); setI((n) => (n + 1) % MAJORS.length); }}
        aria-label="Show another major"
      >
        <span key={MAJORS[i]} aria-hidden="true">{MAJORS[i]}</span>
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10a6 6 0 0 1 10.4-4M16 10a6 6 0 0 1-10.4 4M14 2.5V6h-3.5M6 17.5V14h3.5" /></svg>
      </button>
      <span className="sr-only">Every major is welcome, including {MAJORS.join(', ')}.</span>
    </Reveal>
  );
}

export default function WhoCanJoin() {
  const [pick, setPick] = useState(0);
  const path = PATHS[pick];

  const onKey = (e) => {
    const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = (pick + d + PATHS.length) % PATHS.length;
    setPick(next);
    e.currentTarget.querySelectorAll('[role="radio"]')[next].focus();
  };

  return (
    <section className="section paper" id="who-can-join" aria-labelledby="join-title">
      <div className="wrap">
        <div className="wcj-head">
          <SectionHead index="02" label="Who can join" id="join-title" title="Every Phoenix. Every major.">
            <p>
              Membership is free and open to all enrolled UWGB students. Nursing, art, computer science, business,
              or undecided: there is a place for you here, whether or not you have an idea yet.
            </p>
          </SectionHead>
          <MajorSlot />
        </div>

        <Reveal className="finder">
          <Foal id="finder" className="foal-finder" />
          <div className="finder-q">
            <p className="finder-label" id="finder-label">Where are you right now?</p>
            <div className="finder-opts" role="radiogroup" aria-labelledby="finder-label" onKeyDown={onKey}>
              {PATHS.map((p, i) => (
                <button
                  key={p.key}
                  type="button"
                  role="radio"
                  aria-checked={i === pick}
                  tabIndex={i === pick ? 0 : -1}
                  className="finder-opt"
                  onClick={() => setPick(i)}
                >
                  <span className="finder-radio" aria-hidden="true" />
                  {p.label}
                </button>
              ))}
            </div>
            <p className="free-badge">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="m5 10.5 3 3 7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Free for all UWGB students
            </p>
          </div>

          <div className="finder-a" aria-live="polite" key={path.key}>
            <h3>{path.title}</h3>
            <p>{path.body}</p>
            <p className="finder-next-label">Your next steps</p>
            <ol className="finder-next">
              {path.next.map((n) => <li key={n}>{n}</li>)}
            </ol>
            <a className="btn btn-primary" href="#join">{path.cta} <Arrow /></a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
