import { useEffect, useRef } from 'react';
import { site } from '../config.js';
import { HOME, ROOT, asset } from '../paths.js';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Visible dashed placeholder for content the club still needs to fill in. */
export function Placeholder({ children }) {
  return <span className="ph">{children}</span>;
}

/** Shows the value, or the bracketed placeholder when it is still missing. */
export function Filled({ value, label }) {
  return value ? value : <Placeholder>{label}</Placeholder>;
}

export function Arrow({ size }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" style={size ? { width: size, height: size } : undefined}>
      <path d="M4 10h11m-4-5 5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Logo image from config, or the dashed LOGO slot until one is uploaded. */
export function Logo({ onDark = false }) {
  const src = onDark ? site.logoOnDark || site.logo : site.logo;
  if (src) {
    return <img className="logo" src={asset(src)} alt="Phoenix Foundry" width="1249" height="240" />;
  }
  return <span className="logo-slot" aria-hidden="true">LOGO</span>;
}

export function Brand({ onDark = false }) {
  return (
    <a className="brand" href={ROOT ? HOME : '#top'} aria-label={ROOT ? 'Phoenix Foundry home' : 'Phoenix Foundry, back to top'}>
      <Logo onDark={onDark} />
      {/* The logo image already includes the name, so only show text next to the placeholder */}
      {!site.logo && <span className="brand-name">Phoenix Foundry</span>}
    </a>
  );
}

/** Link to an outside page. While the URL is missing it stays put instead of jumping to the top. */
export function ExternalLink({ href, children, ...rest }) {
  if (href) {
    const external = /^https?:/.test(href);
    return (
      <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <a href="#" data-placeholder="[LINK]" onClick={(e) => e.preventDefault()} {...rest}>
      {children}
    </a>
  );
}

/**
 * Rise-on-scroll wrapper. Content is visible by default; only elements that
 * start below the fold are hidden, then fade up when they scroll into view.
 */
export function Reveal({ as: Tag = 'div', delay = 0, className = '', style, children, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !('IntersectionObserver' in window)) return;
    if (el.getBoundingClientRect().top <= window.innerHeight) return;

    el.classList.add('pending');
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.remove('pending');
        io.disconnect();
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      el.classList.remove('pending');
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`.trim()}
      style={delay ? { '--d': `${delay}ms`, ...style } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Throw a small burst of gold sparks from a point on screen. */
export function throwSparks(x, y, count = 12, reach = 46) {
  if (prefersReducedMotion() || !document.body.animate) return;
  for (let i = 0; i < count; i++) {
    const spark = document.createElement('span');
    spark.className = 'spark';
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
    document.body.appendChild(spark);
    // Mostly upward, fanning out, then falling slightly
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.3;
    const dist = 28 + Math.random() * reach;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist + 14;
    spark
      .animate(
        [
          { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
          { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.4)`, opacity: 0 },
        ],
        { duration: 420 + Math.random() * 320, easing: 'cubic-bezier(.2,.7,.4,1)' }
      )
      .finished.then(() => spark.remove(), () => spark.remove());
  }
}

/** Pressing a primary button throws a few sparks, like a hammer on an anvil. */
export function useAnvilSparks() {
  useEffect(() => {
    const onDown = (e) => { if (e.target.closest('.btn-primary')) throwSparks(e.clientX, e.clientY); };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, []);
}

/** Section opener: a numbered index label, a display headline, and optional intro text. */
export function SectionHead({ index, label, id, title, children, className = '' }) {
  return (
    <Reveal className={`sec-head ${className}`.trim()}>
      <p className="sec-index"><span>{index}</span>{label}</p>
      <h2 id={id}>{title}</h2>
      {children && <div className="sec-intro">{children}</div>}
    </Reveal>
  );
}
