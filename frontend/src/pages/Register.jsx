import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { api, rememberCard } from '../api';
import { properName } from '../format';
import Lobby from './Lobby';

const BLANK_FORM = { firstName: '', lastName: '', email: '', contactNumber: '' };

export default function Register() {
  const [form, setForm] = useState(BLANK_FORM);
  const [newMember, setNewMember] = useState(null);
  const [problem, setProblem] = useState('');
  const [joining, setJoining] = useState(false);
  const qrCanvas = useRef(null);
  const navigate = useNavigate();

  const fill = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const join = async (e) => {
    e.preventDefault();
    setProblem('');
    setJoining(true);
    try {
      const member = await api.createCustomer(form);
      rememberCard(member.email, member.qrCode);
      setNewMember(member);
    } catch (err) {
      setProblem(err.message);
    } finally {
      setJoining(false);
    }
  };

  // draw the QR after signing up
  useEffect(() => {
    if (newMember && qrCanvas.current) {
      QRCode.toCanvas(qrCanvas.current, newMember.qrCode, {
        width: 200, margin: 1, color: { dark: '#2a1f17', light: '#fbf8f2' },
      });
    }
  }, [newMember]);

  if (newMember) {
    return (
      <Lobby here="/register">
        <section className="slip">
          <div className="slip-head"><span>Card issued</span><span className="aside">0 pts</span></div>
          <div className="slip-body" style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: 28 }}>Welcome, {properName(newMember.firstName)}</h1>
            <p className="faint">Show this at the counter every time you order.</p>
            <canvas ref={qrCanvas} style={{ margin: '6px auto 10px', display: 'block' }} />
            <p><span className="code-chip">{newMember.qrCode}</span></p>
            <p className="faint">
              {newMember.cardEmailed
                ? <>A copy is on its way to <b>{newMember.email}</b>.</>
                : <>Keep your member code. You need it with your email to open your card later.</>}
            </p>
            <button className="btn-brew wide" onClick={() => navigate('/card')}>Open my card</button>
          </div>
        </section>
      </Lobby>
    );
  }

  return (
    <Lobby here="/register">
      {problem && <div className="note-bitter">{problem}</div>}
      <section className="slip">
        <div className="slip-head"><span>Join the program</span><span className="aside">free, no app</span></div>
        <form className="slip-body" onSubmit={join}>
          <div className="jot-row">
            <label className="jot">
              <span className="jot-label">First name</span>
              <input value={form.firstName} onChange={fill('firstName')} autoComplete="given-name" required />
            </label>
            <label className="jot">
              <span className="jot-label">Last name</span>
              <input value={form.lastName} onChange={fill('lastName')} autoComplete="family-name" required />
            </label>
          </div>
          <label className="jot">
            <span className="jot-label">Email</span>
            <input type="email" value={form.email} onChange={fill('email')} autoComplete="email" required />
          </label>
          <label className="jot">
            <span className="jot-label">Mobile number (optional)</span>
            <input value={form.contactNumber} onChange={fill('contactNumber')} autoComplete="tel"
                   placeholder="09XX XXX XXXX" />
          </label>
          <button className="btn-brew wide" type="submit" disabled={joining}>
            {joining ? 'Issuing card' : 'Get my card'}
          </button>
        </form>
      </section>
    </Lobby>
  );
}
