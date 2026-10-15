import { useEffect, useState } from 'react';
import { site } from '../config.js';
import { Arrow, ExternalLink, Filled, Reveal, SectionHead } from './shared.jsx';
import Foal from './Foal.jsx';

const KEY = 'pf-launch-checklist';
const STATUS = ['Pre-launch', 'Warming up', 'Almost there', 'Ready for liftoff'];

export default function HowToJoin() {
  const { nextEvent, links } = site;
  const [done, setDone] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || [false, false, false]; } catch { return [false, false, false]; }
  });
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(done)); } catch { /* storage unavailable: progress just isn't remembered */ }
  }, [done]);
  const toggle = (i) => setDone((d) => d.map((v, j) => (j === i ? !v : v)));
  const count = done.filter(Boolean).length;

  const steps = [
    {
      title: 'Join us on Phoenix Connect',
      body: 'Become a member so you hear about every workshop, pitch night, and cohort deadline.',
      action: <ExternalLink className="step-link" href={links.phoenixConnect}>Open Phoenix Connect <Arrow /></ExternalLink>,
    },
    {
      title: 'Come to an event',
      body: 'Workshops, pitch nights and idea jams are open to everyone. The next one is on the ticket.',
    },
    {
      title: 'Apply to the Foundry Cohort',
      body: 'Applications open each semester. Have an idea or a team? Apply when the window opens.',
      action: <ExternalLink className="step-link" href={links.cohortApplication}>Cohort application <Arrow /></ExternalLink>,
    },
  ];

  return (
    <section className="section mist" id="join" aria-labelledby="howto-title">
      <div className="wrap">
        <SectionHead index="04" label="Join" id="howto-title" title="Your launch checklist.">
          <p>Three steps to get started. Tick them off as you go; we'll remember where you are.</p>
        </SectionHead>

        <div className="launch">
          <Reveal className="checklist">
            <div className="check-status" aria-live="polite">
              <p><strong>{count}/3</strong> {STATUS[count]}</p>
              <div className="check-bar"><span style={{ transform: `scaleX(${count / 3})` }} /></div>
            </div>
            <ol>
              {steps.map((s, i) => (
                <li className={`check${done[i] ? ' is-done' : ''}`} key={s.title}>
                  <label>
                    <input type="checkbox" checked={done[i]} onChange={() => toggle(i)} />
                    <span className="check-box" aria-hidden="true">
                      <svg viewBox="0 0 20 20"><path d="m5 10.5 3 3 7-7" /></svg>
                    </span>
                    <span className="check-text">
                      <span className="check-num">Step {i + 1}</span>
                      <span className="check-title">{s.title}</span>
                    </span>
                  </label>
                  <p>{s.body}</p>
                  {s.action}
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal className="ticket" delay={120} aria-labelledby="ticket-title">
            <Foal id="ticket" className="foal-ticket" />
            <div className="ticket-top">
              <p className="ticket-kicker" id="ticket-title">Next event</p>
              <p className="ticket-name"><Filled value={nextEvent.name} label="[EVENT NAME]" /></p>
            </div>
            <dl className="ticket-info">
              <div><dt>Date</dt><dd><Filled value={nextEvent.date} label="[DATE]" /></dd></div>
              <div><dt>Location</dt><dd><Filled value={nextEvent.location} label="[LOCATION]" /></dd></div>
              <div><dt>Who</dt><dd>Open to all UWGB students</dd></div>
            </dl>
            <div className="ticket-stub">
              <span>Phoenix Foundry</span>
              <span>Admit one</span>
            </div>
          </Reveal>
        </div>

        <Reveal className="join-cta">
          <p>Membership is free. No dues, ever.</p>
          <div className="btns">
            <ExternalLink className="btn btn-primary" href={links.phoenixConnect}>Join on Phoenix Connect</ExternalLink>
            <ExternalLink className="btn btn-ghost" href={links.cohortApplication}>Cohort Application</ExternalLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
