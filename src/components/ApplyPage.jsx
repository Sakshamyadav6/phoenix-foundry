import Nav from './Nav.jsx';
import Footer from './Footer.jsx';
import ApplyForm from './ApplyForm.jsx';
import { useAnvilSparks } from './shared.jsx';
import { PHOENIX, PHOENIX_VIEWBOX } from './Hero.jsx';

const TAGS = ['Every major welcome', 'Free to join', 'About 5 minutes'];

// Faint startup words in the side margins behind the form (wide screens only)
const WORDS = [
  { w: 'MVP', x: 4, y: 14 }, { w: 'Pitch deck', x: 3, y: 46 }, { w: 'Traction', x: 6, y: 76 },
  { w: 'Demo Day', x: 84, y: 22 }, { w: 'Pivot', x: 88, y: 54 }, { w: 'Ship it', x: 83, y: 84 },
];

/** Decoration behind the form card: dot grid, outlined phoenix marks, drifting slats, faint jargon. */
function Backdrop() {
  const mark = (side) => (
    <svg className={`decor-mark decor-mark-${side}`} viewBox={PHOENIX_VIEWBOX}>
      {PHOENIX.map((p, i) => <path d={p.d} key={i} />)}
    </svg>
  );
  return (
    <div className="apply-decor" aria-hidden="true">
      {mark('l')}
      {mark('r')}
      {[1, 2, 3, 4, 5, 6].map((n) => <span className={`decor-slat decor-slat-${n}`} key={n} />)}
      {WORDS.map((d) => (
        <span className="decor-word" style={{ left: `${d.x}%`, top: `${d.y}%` }} key={d.w}>{d.w}</span>
      ))}
    </div>
  );
}

/** /apply: the Foundry Cohort application. Same nav and footer as the home page. */
export default function ApplyPage() {
  useAnvilSparks();

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Nav page="apply" />
      <main id="main">
        <section className="apply-hero" aria-labelledby="apply-title">
          <span className="apply-slat apply-slat-1" aria-hidden="true" />
          <span className="apply-slat apply-slat-2" aria-hidden="true" />
          <div className="wrap apply-hero-inner">
            <h1 className="apply-eyebrow" id="apply-title">Phoenix Foundry · Cohort Application</h1>
            <p className="apply-lede">
              Bring an idea, or just curiosity. The Foundry Cohort is a semester of building alongside other UW-Green
              Bay students, with workshops, mentors, and a team that has your back.
            </p>
            <ul className="apply-tags">
              {TAGS.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </div>
        </section>

        <div className="apply-body">
          <Backdrop />
          <div className="wrap">
            <ApplyForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
