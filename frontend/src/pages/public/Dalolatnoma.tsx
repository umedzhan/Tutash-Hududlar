import './landing.css';
import { LandingNav } from './LandingNav';
import { DalolatnomaForm } from './DalolatnomaForm';

export function Dalolatnoma() {
  return (
    <div className="landing-page dalolatnoma-page">
      <LandingNav homeHref="/" scrolled active="dalolatnoma" />
      <DalolatnomaForm />
    </div>
  );
}
