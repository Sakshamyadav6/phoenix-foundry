import { site } from '../config.js';
import { Brand, ExternalLink, Filled } from './shared.jsx';

export default function Footer() {
  const { links, instagramHandle, email } = site;

  return (
    <footer className="footer on-dark">
      <div className="wrap footer-inner">
        <div>
          <Brand onDark />
          <p className="footer-tag">Where Phoenix Founders Rise.</p>
          <p className="footer-reg">A registered student organization at the University of Wisconsin-Green Bay.</p>
        </div>
        <ul className="footer-links">
          <li>
            <ExternalLink href={links.instagram}>
              <span className="k">Instagram</span>
              <span className="v"><Filled value={instagramHandle} label="[@HANDLE]" /></span>
            </ExternalLink>
          </li>
          <li>
            <ExternalLink href={links.phoenixConnect}>
              <span className="k">Phoenix Connect</span>
              <span className="v">Join our page</span>
            </ExternalLink>
          </li>
          <li>
            <ExternalLink href={email ? `mailto:${email}` : null}>
              <span className="k">Email</span>
              <span className="v"><Filled value={email} label="[EMAIL]" /></span>
            </ExternalLink>
          </li>
        </ul>
        <div className="footer-base">
          <span>© {new Date().getFullYear()} Phoenix Foundry</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
