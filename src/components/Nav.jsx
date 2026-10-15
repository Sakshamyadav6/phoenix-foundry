import { useEffect, useState } from 'react';
import { Brand } from './shared.jsx';

const LINKS = [
  { href: '#who-we-are', label: 'Who We Are' },
  { href: '#who-can-join', label: 'Who Can Join' },
  { href: '#what-to-expect', label: 'What to Expect' },
  { href: '#team', label: 'Team' },
  { href: '#join', label: 'Join' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(null);

  // Shadow once the page scrolls
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu on Escape or when the screen grows to desktop width
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const mq = window.matchMedia('(min-width: 1080px)');
    const onMq = (e) => e.matches && setOpen(false);
    document.addEventListener('keydown', onKey);
    mq.addEventListener('change', onMq);
    return () => {
      document.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onMq);
    };
  }, []);

  // Highlight the section currently in view
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const spy = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive('#' + e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    document.querySelectorAll('main section[id]').forEach((s) => spy.observe(s));
    return () => spy.disconnect();
  }, []);

  return (
    <header className={`nav${scrolled ? ' scrolled' : ''}`} id="top">
      <div className="wrap nav-inner">
        <Brand />
        <nav className="nav-links" aria-label="Primary">
          <ul>
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} aria-current={active === l.href ? 'true' : undefined}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <a className="btn btn-primary nav-cta" href="#join">Join Us</a>
        <button
          className="menu-btn"
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
        </button>
      </div>
      <div className="mobile-menu" id="mobile-menu" hidden={!open}>
        <nav className="wrap" aria-label="Mobile" onClick={(e) => e.target.closest('a') && setOpen(false)}>
          <ul>
            {LINKS.map((l) => (
              <li key={l.href}><a href={l.href}>{l.label}</a></li>
            ))}
          </ul>
          <a className="btn btn-primary" href="#join">Join Us</a>
        </nav>
      </div>
    </header>
  );
}
