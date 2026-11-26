import { Link } from 'react-router-dom';

const DOORS = [
  { to: '/card', label: 'My card' },
  { to: '/register', label: 'Join' },
  { to: '/login', label: 'Staff' },
];

// layout for the public pages
export default function Lobby({ here, roomy = false, children }) {
  return (
    <div className="lobby">
      <div className="lobby-mark">Evercup<em>Points</em></div>
      <div className="lobby-tag">Every cup counts</div>
      <div className={`lobby-column${roomy ? ' roomy' : ''}`}>
        {children}
        <nav className="lobby-links">
          {DOORS.map((door) => (
            <Link key={door.to} to={door.to} className={door.to === here ? 'here' : ''}>
              {door.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
