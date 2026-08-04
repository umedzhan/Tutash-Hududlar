import { Link } from 'react-router-dom';

export function LogoMark() {
  return (
    <span className="lp-logo-mark">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function Logo() {
  return (
    <Link className="lp-logo" to="/">
      <LogoMark />
      <span>
        <b>TUTASH HUDUD</b>
        <small>SURXONDARYO VILOYATI</small>
      </span>
    </Link>
  );
}

interface LandingNavProps {
  /** Sahifadan bosh sahifadagi bo'limlarga o'tish uchun prefiks — "" (o'zida) yoki "/" (boshqa marshrutdan). */
  homeHref?: string;
  /** Nav ixcham (scrolled) ko'rinishda ko'rsatilsinmi. */
  scrolled?: boolean;
  /** Faol bo'lgan nav havolasi (masalan "dalolatnoma"). */
  active?: 'dalolatnoma';
}

export function LandingNav({ homeHref = '', scrolled = false, active }: LandingNavProps) {
  return (
    <nav className={`lp-nav${scrolled ? ' scrolled' : ''}`}>
      <div className="lp-container lp-nav-inner">
        <Logo />
        <ul className="lp-nav-links">
          <li><a href={`${homeHref}#jarayon`}>Jarayon</a></li>
          <li><a href={`${homeHref}#statistika`}>Statistika</a></li>
          <li><a href={`${homeHref}#savollar`}>Savollar</a></li>
          <li>
            <Link to="/dalolatnoma" style={active === 'dalolatnoma' ? { color: 'var(--lp-teal)', background: 'var(--lp-mint2)' } : undefined}>
              Dalolatnoma
            </Link>
          </li>
          <li><a href={`${homeHref}#ariza`}>Ariza</a></li>
        </ul>
        <Link to="/login" className="lp-btn lp-btn-teal" style={{ padding: '11px 22px' }}>
          Kabinetga kirish
        </Link>
      </div>
    </nav>
  );
}
