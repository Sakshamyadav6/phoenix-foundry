import { useEffect, useState } from 'react';
import { site } from '../config.js';
import { Arrow, Brand, ExternalLink, Filled } from './shared.jsx';

/** Local time on campus, ticking each minute. */
function CampusTime() {
  const fmt = () =>
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', hour: 'numeric', minute: '2-digit' }).format(new Date());
  const [time, setTime] = useState(fmt);
  useEffect(() => {
    const t = setInterval(() => setTime(fmt()), 15000);
    return () => clearInterval(t);
  }, []);
  return (
    <p className="campus-time">
      <span className="live-dot" aria-hidden="true" />
      Green Bay, WI · {time} CT
    </p>
  );
}

export default function Footer() {
  const { links, instagramHandle, email } = site;

  const rows = [
    { k: 'Phoenix Connect', v: 'Join our page', href: links.phoenixConnect },
    { k: 'Instagram', v: <Filled value={instagramHandle} label="[@HANDLE]" />, href: links.instagram },
    { k: 'Email', v: <Filled value={email} label="[EMAIL]" />, href: email ? `mailto:${email}` : null },
  ];

  return (
    <footer className="footer on-dark">
      <div className="wrap footer-inner">
        <p className="footer-mark" aria-hidden="true">Where Phoenix<br />Founders Rise.</p>

        <div className="footer-grid">
          <div className="footer-about">
            <Brand onDark />
            <p className="footer-reg">A registered student organization at the University of Wisconsin-Green Bay.</p>
            <CampusTime />
          </div>
          <ul className="footer-links">
            {rows.map((r) => (
              <li key={r.k}>
                <ExternalLink href={r.href}>
                  <span className="k">{r.k}</span>
                  <span className="v">{r.v}</span>
                  <Arrow />
                </ExternalLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-base">
          <span>© {new Date().getFullYear()} Phoenix Foundry</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
