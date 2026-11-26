import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, saveSession } from '../api';
import Lobby from './Lobby';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [problem, setProblem] = useState('');
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  const clockIn = async (e) => {
    e.preventDefault();
    setProblem('');
    setChecking(true);
    try {
      const session = await api.login(username, password);
      saveSession(session);
      onLogin(session);
      navigate('/scan');
    } catch (err) {
      setProblem(err.message);
    } finally {
      setChecking(false);
    }
  };

  return (
    <Lobby here="/login">
      {problem && <div className="note-bitter">{problem}</div>}
      <section className="slip">
        <div className="slip-head"><span>Staff clock-in</span></div>
        <form className="slip-body" onSubmit={clockIn}>
          <label className="jot">
            <span className="jot-label">Username</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)}
                   autoComplete="username" required />
          </label>
          <label className="jot">
            <span className="jot-label">Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                   autoComplete="current-password" required />
          </label>
          <button className="btn-brew wide" type="submit" disabled={checking}>
            {checking ? 'Checking' : 'Clock in'}
          </button>
        </form>
      </section>
    </Lobby>
  );
}
