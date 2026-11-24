import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, saveSession } from '../api';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = await api.login(username, password);
      saveSession(data);
      onLogin(data);
      navigate('/scan');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="card">
          <h1>EvercupPoints</h1>
          <p className="sub">Staff sign in</p>

          {error && <div className="alert err">{error}</div>}

          <form onSubmit={submit}>
            <div className="field">
              <label>Username</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)}
                     autoComplete="username" required />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                     autoComplete="current-password" required />
            </div>
            <button className="primary" type="submit" disabled={busy} style={{ width: '100%' }}>
              {busy ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
        <p className="muted" style={{ textAlign: 'center' }}>
          Not a member yet? <Link to="/register">Join the loyalty program</Link>
        </p>
      </div>
    </div>
  );
}
