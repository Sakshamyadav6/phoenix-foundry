import { useEffect, useRef } from 'react';
import { Arrow, prefersReducedMotion } from './shared.jsx';

/*
 * A horizontal hero. The section pins under the nav and vertical scrolling slides a three-chapter
 * track sideways (Spark, Build, Rise). A startup growth curve is drawn along the whole track as you
 * go: flat at the idea, a dip at the pivot, then the hockey stick up to the phoenix at Demo Day.
 * Jargon floats behind at three parallax depths and lights up as the line passes it.
 */

// Growth curve in track units: x 0..1000 across the track, y 0..100 down the stage
const CURVE = [
  [0, 88], [70, 87.5], [170, 86], [270, 84], [350, 82], [420, 86], [480, 90], [545, 87],
  [600, 83], [660, 85], [720, 84], [770, 80], [815, 70], [860, 58], [905, 47], [945, 38],
];
const MILESTONES = [
  { at: 1, label: 'Idea' },
  { at: 3, label: 'Validate' },
  { at: 6, label: 'Pivot', below: true },
  { at: 8, label: 'MVP' },
  { at: 12, label: 'Traction' },
  { at: 14, label: 'Demo Day' },
];
const PEAK = CURVE[CURVE.length - 1];

// Smooth path through the points (Catmull-Rom to cubic Béziers)
const CURVE_PATH = CURVE.reduce((d, p, i, a) => {
  if (i === 0) return `M${p[0]} ${p[1]}`;
  const p0 = a[i - 2] || a[i - 1];
  const p1 = a[i - 1];
  const p3 = a[i + 1] || p;
  const c1 = [p1[0] + (p[0] - p0[0]) / 6, p1[1] + (p[1] - p0[1]) / 6];
  const c2 = [p[0] - (p3[0] - p1[0]) / 6, p[1] - (p3[1] - p1[1]) / 6];
  return `${d} C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p[0]} ${p[1]}`;
}, '');

// The phoenix from the logo, in four pieces that fly up into place at the peak
export const PHOENIX_VIEWBOX = '390 428 608 747';
export const PHOENIX = [
  {
    d: 'M400 438C440 490 560 600 745 715L780 790 826 702 785 672 835 670 758 606 922 640 972 678C984 686 989 694 988 703 ' +
      'C962 694 930 696 914 716C902 733 905 752 918 762L985 808 843 1005 697 845 512 773 456 657 662 752 440 615C425 560 410 495 400 438Z',
    dx: 0, dy: 70, rot: 0,
  },
  { d: 'M540 808L686 851 766 942 622 893Z', dx: -60, dy: 110, rot: -10 },
  { d: 'M771 948L829 1019 771 1085Z', dx: -30, dy: 150, rot: 8 },
  { d: 'M918 925L920 1022 775 1165Z', dx: 40, dy: 170, rot: -8 },
];

const HEADLINE = [['Where', 'Phoenix'], ['Founders', 'Rise.']];

// 40 terms every founder hears in their first semester
const JARGON = [
  'MVP', 'Pivot', 'Product-market fit', 'Runway', 'Bootstrap', 'Pitch deck', 'Traction', 'Seed round',
  'Customer discovery', 'Burn rate', 'Unicorn', 'Cap table', 'Iterate', 'Go-to-market', 'Term sheet', 'Angel investor',
  'Ship it', 'Validate', 'North star metric', 'Lean canvas', 'Flywheel', 'Moat', 'Series A', 'Demo Day',
  'Hockey stick', 'Ramen profitable', 'Zero to one', 'Churn', 'Founder-market fit', 'TAM', 'Equity', 'Stealth mode',
  'Scale', 'Freemium', 'Vesting', 'Growth loop', 'Disrupt', 'Accelerator', 'Elevator pitch', 'Exit strategy',
];
// Spread the words over the track on a fixed scatter; depth 0 is nearest (biggest, slowest to lag)
const WORDS = JARGON.map((word, i) => ({
  word,
  depth: i % 3,
  x: ((i * 61) % 100) * 0.97 + 1,
  y: 6 + ((i * 37 + (i % 3) * 13) % 78),
}));

const CHAPTERS = ['Spark', 'Build', 'Rise'];

const SPECS = [
  { k: 'Open to', v: 'Every UWGB student, every major' },
  { k: 'Membership', v: 'Free. No dues, ever.' },
  { k: 'The cohort', v: 'One semester, ending at Demo Day' },
];

function useHorizontalHero() {
  const ref = useRef(null);

  // Pin only when the screen is tall enough for a chapter to fit (not landscape phones);
  // otherwise the chapters simply stack. Re-checks on rotate/resize.
  useEffect(() => {
    const hero = ref.current;
    if (!hero || prefersReducedMotion()) return;
    const mq = window.matchMedia('(min-height: 540px)');
    let teardown = null;
    const apply = () => {
      teardown?.();
      teardown = mq.matches ? pin(hero) : null;
    };
    apply();
    mq.addEventListener('change', apply);
    return () => {
      mq.removeEventListener('change', apply);
      teardown?.();
    };
  }, []);

  return ref;
}

/** Drives the pinned horizontal hero. Returns a cleanup that restores the stacked layout. */
function pin(hero) {
  hero.classList.add('is-pinned');

  const q = (s) => hero.querySelector(s);
  const stage = q('.hero-stage');
  const track = q('.hero-track');
  const ink = q('.curve-ink');
  const pen = q('.curve-pen');
  const path = q('.curve-path');
  const layers = [...hero.querySelectorAll('.jargon-layer')];
  const words = [...hero.querySelectorAll('.jargon-word')];
  const marks = [...hero.querySelectorAll('.milestone')];
  const fill = q('.chapters-fill');
  const panels = [...hero.querySelectorAll('.panel')];
  const text = [...hero.querySelectorAll('.panel > *')];

  // Sample the curve so the pen can follow it
  const lut = [];
  const len = path.getTotalLength();
  for (let i = 0; i <= 300; i++) {
    const pt = path.getPointAtLength((len * i) / 300);
    lut.push([pt.x, pt.y]);
  }
  const yAt = (x) => {
    const j = lut.findIndex((p) => p[0] >= x);
    if (j <= 0) return lut[j === 0 ? 0 : lut.length - 1][1];
    const [a, b] = [lut[j - 1], lut[j]];
    return a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0] || 1);
  };

  let raf = 0;
  let lastLight = 0;
  let chapter = -1;
  const t0 = performance.now();

  const frame = (now) => {
    raf = 0;
    const vw = window.innerWidth;
    const travel = track.offsetWidth - vw;
    // Progress runs from the moment the stage pins under the nav until it unpins
    const r = hero.getBoundingClientRect();
    const range = hero.offsetHeight - stage.offsetHeight;
    const p = Math.min(1, Math.max(0, (parseFloat(getComputedStyle(stage).top) - r.top) / (range || 1)));

    track.style.transform = `translate3d(${(-p * travel).toFixed(1)}px, 0, 0)`;
    // Nearer jargon lags a little behind the track, farther jargon a lot: depth
    layers.forEach((l, i) => { l.style.transform = `translate3d(${(p * travel * (0.12 + i * 0.16)).toFixed(1)}px, 0, 0)`; });

    // The line is drawn ahead to 70% across the screen, and finishes exactly at the end
    const intro = 1 - Math.pow(1 - Math.min(1, (now - t0) / 1600), 3);
    const start = (0.7 * vw) / track.offsetWidth;
    const x = Math.min(PEAK[0], (start + p * (1 - start)) * 1000 * intro);
    ink.style.clipPath = `inset(0 ${(100 - x / 10).toFixed(2)}% 0 0)`;
    pen.style.left = `${x / 10}%`;
    pen.style.top = `${yAt(x)}%`;
    marks.forEach((m) => m.toggleAttribute('data-on', x >= Number(m.dataset.x)));

    // A chapter is current once its left edge passes the middle of the screen
    const shift = p * travel;
    const c = panels.reduce((cur, el, i) => (el.offsetLeft - shift < vw * 0.5 ? i : cur), 0);
    if (c !== chapter) { chapter = c; hero.dataset.chapter = c; }
    fill.style.transform = `scaleX(${p.toFixed(4)})`;

    // Words the pen passes near light up for a moment, unless they sit behind chapter text
    if (now - lastLight > 120) {
      lastLight = now;
      const pr = pen.getBoundingClientRect();
      const blocks = text.map((el) => el.getBoundingClientRect());
      // Milestone labels step aside while chapter text covers them
      marks.forEach((m) => {
        const b = m.getBoundingClientRect();
        m.toggleAttribute('data-covered', blocks.some((t) => b.left < t.right && b.right > t.left && b.top < t.bottom && b.bottom > t.top));
      });
      words.forEach((w) => {
        const b = w.getBoundingClientRect();
        const dx = Math.max(b.left - pr.right, pr.left - b.right, 0);
        const dy = Math.max(b.top - pr.bottom, pr.top - b.bottom, 0);
        const hidden = blocks.some((t) => b.left < t.right && b.right > t.left && b.top < t.bottom && b.bottom > t.top);
        if (dx < 90 && dy < 140 && !hidden && !w.classList.contains('is-lit')) {
          w.classList.add('is-lit');
          setTimeout(() => w.classList.remove('is-lit'), 2400);
        }
      });
    }
    if (intro < 1) raf = requestAnimationFrame(frame);
  };
  const schedule = () => { if (!raf) raf = requestAnimationFrame(frame); };

  schedule();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    hero.classList.remove('is-pinned');
    [track, ...layers].forEach((el) => { el.style.transform = ''; });
  };
}

export default function Hero() {
  const ref = useHorizontalHero();
  let n = 0; // running letter index for the headline stagger

  return (
    <section className="hero" ref={ref} data-chapter="0" aria-labelledby="hero-title">
      <div className="hero-stage">
        <div className="hero-track">
          <div className="jargon" aria-hidden="true">
            {[0, 1, 2].map((depth) => (
              <div className={`jargon-layer depth-${depth}`} key={depth}>
                {WORDS.filter((w) => w.depth === depth).map((w) => (
                  <span className="jargon-word" style={{ left: `${w.x}%`, top: `${w.y}%` }} key={w.word}>{w.word}</span>
                ))}
              </div>
            ))}
          </div>

          <div className="curve" aria-hidden="true">
            <svg className="curve-ghost" viewBox="0 0 1000 100" preserveAspectRatio="none">
              <path d={CURVE_PATH} />
            </svg>
            <div className="curve-ink">
              <svg viewBox="0 0 1000 100" preserveAspectRatio="none">
                <path className="curve-path" d={CURVE_PATH} />
              </svg>
            </div>
            {MILESTONES.map((m) => {
              const [x, y] = CURVE[m.at];
              return (
                <span
                  className={`milestone${m.below ? ' below' : ''}${m.at === MILESTONES.at(-1).at ? ' at-peak' : ''}`}
                  data-x={x}
                  style={{ left: `${x / 10}%`, top: `${y}%` }}
                  key={m.label}
                >
                  <i />{m.label}
                </span>
              );
            })}
            <span className="curve-pen" />
            <svg
              className="hero-mark"
              viewBox={PHOENIX_VIEWBOX}
              style={{ left: `${PEAK[0] / 10}%`, top: `${PEAK[1]}%` }}
            >
              {PHOENIX.map((p, i) => (
                <path
                  d={p.d}
                  key={i}
                  style={{ '--p': i, '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, '--rot': `${p.rot}deg` }}
                />
              ))}
            </svg>
          </div>

          <div className="panel panel-spark">
            {/* Each letter sets in from hairline to heavy; the letters of "Rise." then climb */}
            <h1 id="hero-title" aria-label="Where Phoenix Founders Rise.">
              {HEADLINE.map((line, l) => (
                <span className="h-line" aria-hidden="true" key={l}>
                  {line.map((word) => (
                    <span className={`h-word${word === 'Rise.' ? ' rise' : ''}`} key={word}>
                      {[...word].map((ch, k) => (
                        <span className="h-ch" style={{ '--i': n++, '--k': k }} key={k}>{ch}</span>
                      ))}
                    </span>
                  ))}
                </span>
              ))}
            </h1>
            <p className="hero-sub hero-in" style={{ '--i': 0 }}>
              Bring an idea, or just curiosity. We help UWGB students turn ideas into real ventures through
              workshops, mentors, and a semester-long cohort that ends on the Demo Day stage.
            </p>
            <div className="hero-actions hero-in" style={{ '--i': 1 }}>
              <a className="btn btn-primary" href="#join">
                Join Phoenix Foundry <Arrow />
              </a>
              <span className="scroll-hint" aria-hidden="true">Scroll to rise <Arrow /></span>
            </div>
          </div>

          <div className="panel panel-build">
            <p className="panel-num">02 · Build</p>
            <h2 className="panel-title">Every founder starts in the noise.</h2>
            <p className="panel-body">
              Pitch decks, pivots, burn rates. We'll show you what it all means, then help you do it: validate the
              problem, talk to customers, and ship a first version.
            </p>
          </div>

          <div className="panel panel-rise">
            <p className="panel-num">03 · Rise</p>
            <h2 className="panel-title">Demo Day is the finish line.</h2>
            <dl className="hero-specs">
              {SPECS.map((s) => (
                <div key={s.k}>
                  <dt>{s.k}</dt>
                  <dd>{s.v}</dd>
                </div>
              ))}
            </dl>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#join">
                Join Phoenix Foundry <Arrow />
              </a>
              <a className="btn btn-ghost" href="#what-to-expect">See How It Works</a>
            </div>
          </div>
        </div>

        <div className="chapters" aria-hidden="true">
          <ol>
            {CHAPTERS.map((c, i) => (
              <li key={c}><span>0{i + 1}</span> {c}</li>
            ))}
          </ol>
          <div className="chapters-bar"><div className="chapters-fill" /></div>
        </div>
      </div>
    </section>
  );
}
