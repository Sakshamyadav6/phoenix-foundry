import { useEffect, useRef, useState } from 'react';
import { advisor, team } from '../config.js';
import { Filled, Placeholder, Reveal, SectionHead } from './shared.jsx';
import Foal from './Foal.jsx';

const initials = (name) => (name || '').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
const pad = (n) => String(n).padStart(2, '0');

/** Photo (or initials until one is added) in an arched frame with an outline set behind it. */
function Photo({ member, className = '' }) {
  return (
    <div className={`member-photo ${className}`.trim()}>
      <div className="arch">
        {member.photo ? (
          <img className="photo" src={member.photo} alt={`${member.name || member.title}, ${member.title}`} />
        ) : (
          <div className="photo-slot" role="img" aria-label={`Photo placeholder for ${member.name || `the ${member.title}`}`}>
            <span className="monogram" aria-hidden="true">{initials(member.name) || '?'}</span>
            <Placeholder>[PHOTO]</Placeholder>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * The team, one person at a time. The section pins while the page scrolls through it and each
 * officer's card takes over in turn; the roster beside it (below on phones) shows who is up and
 * jumps to anyone on click. On screens too short to pin, the roster simply switches cards.
 */
function Crew() {
  const [p, setP] = useState(0);
  const ref = useRef(null);
  const rosterRef = useRef(null);
  const count = team.length;

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
      if (range <= 0) return;
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

  const active = Math.min(count - 1, Math.floor(p * count));

  // Keep the current name in view in the horizontal roster on phones
  useEffect(() => {
    const list = rosterRef.current;
    const item = list?.children[active];
    if (!list || !item || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({ left: item.offsetLeft - (list.clientWidth - item.offsetWidth) / 2, behavior: 'smooth' });
  }, [active]);

  const go = (i) => {
    const target = (i + 0.5) / count;
    const { wrap, range, top } = measure();
    if (range <= 0) { setP(target); return; }
    window.scrollTo({ top: wrap.getBoundingClientRect().top + window.scrollY - top + range * target, behavior: 'smooth' });
  };

  return (
    <div className="crew-scroll" ref={ref} style={{ '--n': count }}>
      <div className="crew">
        <div className="crew-stage">
          {team.map((m, i) => (
            <article
              key={m.title}
              className={`crew-card${i === active ? ' is-on' : i < active ? ' is-past' : ''}`}
              aria-hidden={i !== active}
            >
              <Photo member={m} />
              <div className="crew-info">
                <p className="crew-num"><strong>{pad(i + 1)}</strong> / {pad(count)}</p>
                <h3><Filled value={m.name} label="[NAME]" /></h3>
                <p className="crew-role">{m.title}</p>
                {m.bio && <p className="crew-bio">{m.bio}</p>}
                {i < count - 1 && <p className="crew-hint" aria-hidden="true">Keep scrolling to meet the team</p>}
              </div>
            </article>
          ))}
        </div>

        <ol className="crew-roster" ref={rosterRef} aria-label="Phoenix Foundry officers">
          {team.map((m, i) => (
            <li key={m.title}>
              <button
                type="button"
                className={`roster-item${i === active ? ' is-on' : ''}${i < active ? ' is-done' : ''}`}
                aria-current={i === active ? 'true' : undefined}
                onClick={() => go(i)}
              >
                <span className="roster-num">{pad(i + 1)}</span>
                <span className="roster-text">
                  <span className="roster-name">{m.name || '[NAME]'}</span>
                  <span className="roster-role">{m.title}</span>
                </span>
                <span className="roster-bar" aria-hidden="true">
                  <i style={{ transform: `scaleX(${Math.min(1, Math.max(0, p * count - i)).toFixed(3)})` }} />
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default function Team() {
  return (
    <section className="section canvas" id="team" aria-labelledby="team-title">
      <div className="wrap">
        <SectionHead index="05" label="Team" id="team-title" title="The students running the Foundry.">
          <p>Student founders running a student incubator. Say hi at any event.</p>
        </SectionHead>

        <Crew />

        <Reveal as="aside" className="advisor" aria-labelledby="advisor-title">
          <Foal id="advisor" className="foal-advisor" />
          <div className="advisor-who">
            <Photo
              className="advisor-photo"
              member={{ name: `${advisor.firstName} ${advisor.lastName || ''}`.trim(), title: 'Advisor', photo: advisor.photo }}
            />
            <div>
              <span className="advisor-label">Advisor</span>
              <h3 id="advisor-title">
                {advisor.firstName} <Filled value={advisor.lastName} label="[LAST NAME]" />
              </h3>
              <p>{advisor.title}</p>
            </div>
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
