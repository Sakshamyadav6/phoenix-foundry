import { Arrow } from './shared.jsx';

export default function Hero() {
  return (
    <section className="hero on-dark" aria-labelledby="hero-title">
      <div className="wrap hero-inner">
        <span className="eyebrow">Student founder incubator · UW-Green Bay</span>
        <h1 id="hero-title" className="cast">
          Where Phoenix Founders Rise.
        </h1>
        <p className="hero-sub hero-in" style={{ '--i': 0 }}>
          Bring an idea, or just curiosity. We help UWGB students turn ideas into real ventures through
          workshops, mentors, and a semester-long cohort that ends on the Demo Day stage.
        </p>
        <div className="hero-actions hero-in" style={{ '--i': 1 }}>
          <a className="btn btn-primary" href="#join">
            Join Phoenix Foundry <Arrow />
          </a>
          <a className="btn btn-ghost" href="#what-to-expect">See How It Works</a>
        </div>
        <ul className="hero-facts hero-in" style={{ '--i': 2 }}>
          <li>Open to every UWGB student, every major</li>
          <li>Free membership. No dues, ever.</li>
          <li>A semester-long cohort that ends at Demo Day</li>
        </ul>
      </div>
    </section>
  );
}
