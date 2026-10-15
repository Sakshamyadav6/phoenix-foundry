import { Reveal } from './shared.jsx';

const PILLARS = [
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

export default function WhoWeAre() {
  return (
    <section className="section mist" id="who-we-are" aria-labelledby="about-title">
      <div className="wrap">
        <div className="about-grid">
          <Reveal className="section-head">
            <h2 id="about-title">A place to forge ideas into ventures.</h2>
            <div className="about-copy">
              <p>
                Phoenix Foundry is UW-Green Bay's student founder incubator. We give students of every major the
                skills, structure, and people they need to turn an idea into a real venture, and we're building a
                community of founders on campus along the way.
              </p>
            </div>
          </Reveal>
          <Reveal as="aside" className="name-note" delay={120} aria-labelledby="name-title">
            <h3 id="name-title">About the name</h3>
            <dl>
              <div><dt>Phoenix</dt><dd>UWGB's mascot, and a symbol of rising and rebirth.</dd></div>
              <div><dt>Foundry</dt><dd>A place where raw material is forged into something real.</dd></div>
            </dl>
          </Reveal>
        </div>

        <div className="pillars">
          {PILLARS.map((p, i) => (
            <Reveal as="article" className="pillar heat" delay={i * 100} key={p.title}>
              <h3>{p.title}</h3>
              <p><strong>{p.lead}</strong> {p.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
