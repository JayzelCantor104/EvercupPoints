import { useState } from 'react';
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { getUser, clearSession } from './api';
import Login from './pages/Login';
import Scan from './pages/Scan';
import Customers from './pages/Customers';
import Rewards from './pages/Rewards';
import Register from './pages/Register';

export default function App() {
  const [user, setUser] = useState(getUser());
  const navigate = useNavigate();

  const logout = () => {
    clearSession();
    setUser(null);
    navigate('/login');
  };

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <nav className="nav">
        <span className="brand">EvercupPoints</span>
        <NavLink to="/scan">Scan</NavLink>
        <NavLink to="/customers">Members</NavLink>
        <NavLink to="/rewards">Rewards</NavLink>
        <span style={{ fontSize: 13, opacity: .85 }}>
          {user.fullName} ({user.role})
        </span>
        <button onClick={logout}>Log out</button>
      </nav>
      <div className="wrap">
        <Routes>
          <Route path="/scan" element={<Scan />} />
          <Route path="/customers" element={<Customers user={user} />} />
          <Route path="/rewards" element={<Rewards user={user} />} />
          <Route path="*" element={<Navigate to="/scan" replace />} />
        </Routes>
      </div>
    </>
  );
}
