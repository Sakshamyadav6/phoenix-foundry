import { Arrow, Reveal } from './shared.jsx';

const PATHS = [
  {
    tag: 'Idea in hand',
    title: 'You have an idea',
    body: 'Apply to the Foundry Cohort for structure, mentors, and a deadline to build it.',
    cta: 'Apply to the cohort',
    featured: true,
  },
  {
    tag: 'No idea yet',
    title: "You don't have one yet",
    body: 'Join a team that needs your skills, or pick a real campus problem and start solving it.',
    cta: 'Find a team',
  },
  {
    tag: 'Just curious',
    title: "You're just curious",
    body: 'Come to open workshops and pitch nights. No commitment, no application.',
    cta: 'Come to an event',
  },
];

export default function WhoCanJoin() {
  return (
    <section className="section" id="who-can-join" aria-labelledby="join-title">
      <div className="wrap">
        <div className="join-head">
          <Reveal className="section-head">
            <h2 id="join-title">Every Phoenix. Every major.</h2>
            <p>
              Membership is free and open to all enrolled UWGB students. Nursing, art, computer science, business,
              or undecided: there is a place for you here, whether or not you have an idea yet.
            </p>
          </Reveal>
          <Reveal as="span" className="free-badge">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="m5 10.5 3 3 7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Free for all UWGB students
          </Reveal>
        </div>

        <div className="paths">
          {PATHS.map((p, i) => (
            <Reveal as="article" className="path heat" delay={i * 100} key={p.title}>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
              <a href="#join">{p.cta} <Arrow /></a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
