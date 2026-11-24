import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { api } from '../api';

export default function Register() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', contactNumber: '' });
  const [member, setMember] = useState(null);
  const [error, setError] = useState('');
  const canvasRef = useRef(null);

  const change = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setMember(await api.createCustomer(form));
    } catch (err) {
      setError(err.message);
    }
  };

  // Draw the member's QR code once the server has issued it.
  useEffect(() => {
    if (member && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, member.qrCode, { width: 220 });
    }
  }, [member]);

  if (member) {
    return (
      <div className="login-page">
        <div className="login-box card" style={{ textAlign: 'center' }}>
          <h1>Welcome, {member.firstName}</h1>
          <p className="sub">Show this code at the counter to earn points.</p>
          <canvas ref={canvasRef} />
          <p><span className="pill">{member.qrCode}</span></p>
          <p className="muted">Starting balance: {member.pointsBalance} points</p>
          <Link to="/login">Back to sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-box card">
        <h1>Join EvercupPoints</h1>
        <p className="sub">No app to download. You get a QR code right away.</p>

        {error && <div className="alert err">{error}</div>}

        <form onSubmit={submit}>
          <div className="row">
            <div className="field">
              <label>First name</label>
              <input value={form.firstName} onChange={change('firstName')} required />
            </div>
            <div className="field">
              <label>Last name</label>
              <input value={form.lastName} onChange={change('lastName')} required />
            </div>
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={change('email')} required />
          </div>
          <div className="field">
            <label>Contact number</label>
            <input value={form.contactNumber} onChange={change('contactNumber')} />
          </div>
          <button className="primary" type="submit" style={{ width: '100%' }}>Create my card</button>
        </form>

        <p className="muted" style={{ textAlign: 'center', marginTop: 14, marginBottom: 0 }}>
          <Link to="/login">Staff sign in</Link>
        </p>
      </div>
    </div>
  );
}
