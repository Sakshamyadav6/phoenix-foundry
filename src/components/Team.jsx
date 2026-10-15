import { advisor, team } from '../config.js';
import { Filled, Placeholder, Reveal } from './shared.jsx';

function Photo({ member }) {
  if (member.photo) {
    return <img className="photo" src={member.photo} alt={`${member.name || member.title}, ${member.title}`} loading="lazy" />;
  }
  return (
    <div className="photo-slot" role="img" aria-label={`Photo placeholder for the ${member.title}`}>
      <Placeholder>[PHOTO]</Placeholder>
      <svg viewBox="0 0 120 110" fill="currentColor" aria-hidden="true">
        <circle cx="60" cy="40" r="24" />
        <path d="M12 110c0-28 21-46 48-46s48 18 48 46z" />
      </svg>
    </div>
  );
}

export default function Team() {
  return (
    <section className="section" id="team" aria-labelledby="team-title">
      <div className="wrap">
        <Reveal className="section-head">
          <h2 id="team-title">The students running the Foundry.</h2>
        </Reveal>

        <ul className="team">
          {team.map((m, i) => (
            <Reveal as="li" className="member" delay={i * 80} key={m.title}>
              <Photo member={m} />
              <div>
                <h3><Filled value={m.name} label="[NAME]" /></h3>
                <p>{m.title}</p>
              </div>
            </Reveal>
          ))}
        </ul>

        <Reveal as="aside" className="advisor" aria-labelledby="advisor-title">
          <div>
            <span className="advisor-label">Advisor</span>
            <h3 id="advisor-title">
              {advisor.firstName} <Filled value={advisor.lastName} label="[LAST NAME]" />
            </h3>
            <p>{advisor.title}</p>
          </div>
          <p className="advisor-note">
            Phoenix Foundry is advised by UW-Green Bay staff, supporting our student leadership team as a registered
            student organization.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
