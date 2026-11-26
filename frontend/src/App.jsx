import { useState } from 'react';
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { getUser, clearSession } from './api';
import { properName } from './format';
import Login from './pages/Login';
import Scan from './pages/Scan';
import Customers from './pages/Customers';
import Rewards from './pages/Rewards';
import Register from './pages/Register';
import MemberCard from './pages/MemberCard';

const COUNTER_STOPS = [
  { to: '/scan', no: '01', label: 'Scan' },
  { to: '/customers', no: '02', label: 'Members' },
  { to: '/rewards', no: '03', label: 'Rewards' },
];

export default function App() {
  const [barista, setBarista] = useState(getUser());
  const navigate = useNavigate();

  const clockOut = () => {
    clearSession();
    setBarista(null);
    navigate('/login');
  };

  return (
    <Routes>
      {/* public pages */}
      <Route path="/register" element={<Register />} />
      <Route path="/card" element={<MemberCard />} />
      <Route
        path="/login"
        element={barista ? <Navigate to="/scan" replace /> : <Login onLogin={setBarista} />}
      />

      {/* staff pages, login required */}
      <Route
        path="*"
        element={barista ? <Counter barista={barista} onClockOut={clockOut} /> : <Navigate to="/card" replace />}
      />
    </Routes>
  );
}

function Counter({ barista, onClockOut }) {
  return (
    <div className="counter-shell">
      <aside className="rail">
        <div className="rail-mark">Evercup<em>Points</em></div>
        <div className="rail-tag">Behind the counter</div>
        {COUNTER_STOPS.map((stop) => (
          <NavLink key={stop.to} to={stop.to}>
            <span>{stop.no}</span>{stop.label}
          </NavLink>
        ))}
        <div className="rail-foot">
          <div className="who">
            <b>{properName(barista.fullName)}</b> {barista.role}
          </div>
          <button className="btn-quiet" onClick={onClockOut}>Clock out</button>
        </div>
      </aside>
      <main className="pour">
        <Routes>
          <Route path="/scan" element={<Scan />} />
          <Route path="/customers" element={<Customers barista={barista} />} />
          <Route path="/rewards" element={<Rewards barista={barista} />} />
          <Route path="*" element={<Navigate to="/scan" replace />} />
        </Routes>
      </main>
    </div>
  );
}
