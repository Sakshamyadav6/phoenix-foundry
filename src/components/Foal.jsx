import { useEffect, useState } from 'react';
import { throwSparks } from './shared.jsx';

/*
 * Hidden baby unicorns. Five foals hide around the page; finding them is a small game that Uni keeps
 * score of. Progress is remembered in the browser. Each foal announces itself with a 'foal-found' event.
 */
export const FOALS = 5;
const KEY = 'pf-foals';

export function foundFoals() {
  try { return new Set(JSON.parse(localStorage.getItem(KEY)) || []); } catch { return new Set(); }
}

function collect(id) {
  const found = foundFoals();
  const again = found.has(id);
  found.add(id);
  try { localStorage.setItem(KEY, JSON.stringify([...found])); } catch { /* not remembered, still counts this visit */ }
  window.dispatchEvent(new CustomEvent('foal-found', { detail: { count: found.size, again } }));
}

export default function Foal({ id, className = '' }) {
  const [found, setFound] = useState(false);
  useEffect(() => { setFound(foundFoals().has(id)); }, [id]);

  const onClick = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    throwSparks(r.left + r.width / 2, r.top + r.height / 3, found ? 6 : 16);
    collect(id);
    setFound(true);
  };

  return (
    <button
      type="button"
      className={`foal ${className}${found ? ' is-found' : ''}`.trim()}
      aria-label={found ? 'Baby unicorn, already found' : 'A baby unicorn is hiding here. Tap to find it.'}
      onClick={onClick}
    >
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <defs>
          <linearGradient id={`foal-coat-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFE09A" />
            <stop offset="1" stopColor="#F2A15A" />
          </linearGradient>
        </defs>
        <path d="M22.5 10.5 29.5 0.8 25.6 11.6z" fill="#FFF3D6" stroke="#E8B860" strokeWidth=".6" />
        <path d="M20.5 11.5 18.6 5.2l4.6 4.4z" fill={`url(#foal-coat-${id})`} />
        <path
          d="M9.5 38c-1.6-7.4-.6-15.3 5.6-21.2l6-5.2c4.6-1.4 8.6.6 10.6 4.6l3.2 6.2c1 2.4-.6 4.4-3 4l-5-.8c-2 2.6-3 6.2-3 10.4"
          fill={`url(#foal-coat-${id})`}
        />
        <path d="M15.6 15.4c-4.4 1.6-7.6 5.6-8.2 10.6 1.8-1.8 3.6-2.6 5.4-2.6-1.8 3-2 6-1 9 1.4-4.4 3.6-7.8 6.2-10.4z" fill="#E2683A" />
        <circle cx="27" cy="16.6" r="1.5" fill="#3A1A0A" />
        <circle cx="27.5" cy="16.1" r=".45" fill="#fff" />
        <ellipse cx="31.6" cy="22.6" rx=".8" ry=".6" fill="#9C4A1C" />
        <path d="M23.6 20.6c1 .6 2.2.6 3.2 0" stroke="#E98C6A" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity=".7" />
      </svg>
    </button>
  );
}
