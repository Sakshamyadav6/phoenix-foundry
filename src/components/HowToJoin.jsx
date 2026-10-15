import { site } from '../config.js';
import { ExternalLink, Filled, Reveal } from './shared.jsx';

export default function HowToJoin() {
  const { nextEvent, links } = site;

  return (
    <section className="section mist" id="join" aria-labelledby="howto-title">
      <div className="wrap">
        <Reveal className="section-head">
          <h2 id="howto-title">Three steps to get started.</h2>
        </Reveal>

        <ol className="howto">
          <Reveal as="li" className="heat">
            <span className="howto-num" aria-hidden="true">1</span>
            <h3>Join us on Phoenix Connect</h3>
            <p>Become a member so you hear about every workshop, pitch night, and cohort deadline.</p>
          </Reveal>
          <Reveal as="li" className="heat" delay={100}>
            <span className="howto-num" aria-hidden="true">2</span>
            <h3>Come to an event</h3>
            <dl className="event">
              <div><dt>Event</dt><dd><Filled value={nextEvent.name} label="[EVENT NAME]" /></dd></div>
              <div><dt>Date</dt><dd><Filled value={nextEvent.date} label="[DATE]" /></dd></div>
              <div><dt>Location</dt><dd><Filled value={nextEvent.location} label="[LOCATION]" /></dd></div>
            </dl>
          </Reveal>
          <Reveal as="li" className="heat" delay={200}>
            <span className="howto-num" aria-hidden="true">3</span>
            <h3>Apply to the Foundry Cohort</h3>
            <p>Applications open each semester. Have an idea or a team? Apply when the window opens.</p>
          </Reveal>
        </ol>

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
