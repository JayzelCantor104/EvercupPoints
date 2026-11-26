import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { api, rememberCard, recallCard, forgetCard } from '../api';
import { properName, peso, shortDate } from '../format';
import Lobby from './Lobby';

const BEANS_PER_GOAL = 10;

// cheapest reward the member can't afford yet
function nextGoal(menu, balance) {
  return menu.find((reward) => reward.pointsRequired > balance) || null;
}

export default function MemberCard() {
  const saved = recallCard();
  const [email, setEmail] = useState(saved?.email || '');
  const [memberCode, setMemberCode] = useState(saved?.memberCode || '');
  const [card, setCard] = useState(null);
  const [problem, setProblem] = useState('');
  const [opening, setOpening] = useState(Boolean(saved));
  const [mailNote, setMailNote] = useState('');
  const qrCanvas = useRef(null);

  const openCard = async (withEmail, withCode) => {
    setProblem('');
    setOpening(true);
    try {
      const result = await api.openCard(withEmail, withCode);
      rememberCard(result.member.email, result.member.qrCode);
      setCard(result);
    } catch (err) {
      setCard(null);
      setProblem(err.message);
    } finally {
      setOpening(false);
    }
  };

  // open the saved card automatically
  useEffect(() => {
    if (saved) openCard(saved.email, saved.memberCode);
  }, []);

  useEffect(() => {
    if (card && qrCanvas.current) {
      QRCode.toCanvas(qrCanvas.current, card.member.qrCode, {
        width: 150, margin: 1, color: { dark: '#2a1f17', light: '#fbf8f2' },
      });
    }
  }, [card]);

  const mailMyCode = async () => {
    setProblem('');
    setMailNote('');
    if (!email.trim()) {
      setProblem('Type your email first, then tap "Email me my code".');
      return;
    }
    try {
      const reply = await api.resendCard(email.trim());
      setMailNote(reply.message);
    } catch (err) {
      setProblem(err.message);
    }
  };

  const closeCard = () => {
    forgetCard();
    setCard(null);
    setEmail('');
    setMemberCode('');
  };

  if (!card) {
    return (
      <Lobby here="/card">
        {problem && <div className="note-bitter">{problem}</div>}
        {mailNote && <div className="note-sweet">{mailNote}</div>}
        <section className="slip">
          <div className="slip-head"><span>Open my card</span></div>
          <form
            className="slip-body"
            onSubmit={(e) => { e.preventDefault(); openCard(email, memberCode); }}
          >
            <p className="faint" style={{ marginTop: 0 }}>
              Use the email you joined with and the member code printed under your QR.
            </p>
            <label className="jot">
              <span className="jot-label">Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                     autoComplete="email" required />
            </label>
            <label className="jot">
              <span className="jot-label">Member code</span>
              <input className="mono" value={memberCode} onChange={(e) => setMemberCode(e.target.value)}
                     placeholder="EVC-0001-7F3A" required />
            </label>
            <button className="btn-brew wide" type="submit" disabled={opening}>
              {opening ? 'Opening' : 'Open my card'}
            </button>
            <div style={{ textAlign: 'center', marginTop: 14 }}>
              <button type="button" className="btn-void" onClick={mailMyCode}>Lost your code? Email me my code</button>
            </div>
          </form>
        </section>
      </Lobby>
    );
  }

  const { member, visits, claims, menu } = card;
  const goal = nextGoal(menu, member.pointsBalance);
  const roasted = goal
    ? Math.min(BEANS_PER_GOAL, Math.floor((member.pointsBalance / goal.pointsRequired) * BEANS_PER_GOAL))
    : BEANS_PER_GOAL;

  return (
    <Lobby here="/card" roomy>
      <section className="slip ticket">
        <div className="ticket-main">
          <h1 className="ticket-hello">Hi, {properName(member.firstName)}</h1>
          <div className="ticket-since">Member since {shortDate(member.dateRegistered)}</div>

          <div className="tally">{member.pointsBalance}<small>PTS</small></div>

          {menu.length > 0 && (
            <>
              <div className="beans" aria-hidden="true">
                {Array.from({ length: BEANS_PER_GOAL }, (_, i) => (
                  <span key={i} className={`bean${i < roasted ? ' roasted' : ''}`} />
                ))}
              </div>
              <div className="goal-line">
                {goal
                  ? <><b>{goal.pointsRequired - member.pointsBalance} pts</b> more for a {goal.rewardName.replace(/^Free /, '').toLowerCase()}.</>
                  : <>Everything on the reward menu is ready for you.</>}
              </div>
            </>
          )}
        </div>

        <div className="ticket-stub">
          <canvas ref={qrCanvas} />
          <span className="code-chip">{member.qrCode}</span>
          <span className="faint">Show this at the counter</span>
        </div>
      </section>

      <section className="slip">
        <div className="slip-head">
          <span>Reward menu</span>
          <span className="aside">claim at the counter</span>
        </div>
        <div className="slip-body" style={{ paddingTop: 4, paddingBottom: 4 }}>
          {menu.length === 0 && <p className="faint">No rewards on the menu right now.</p>}
          {menu.map((reward) => {
            const gap = reward.pointsRequired - member.pointsBalance;
            return (
              <div key={reward.rewardId} className="menu-item">
                <div>
                  <div className="menu-name">{reward.rewardName}</div>
                  {reward.description && <div className="faint">{reward.description}</div>}
                </div>
                <div className="menu-cost">
                  {reward.pointsRequired} pts
                  <div>{gap <= 0 ? <span className="ready">READY</span> : <span className="short">{gap} to go</span>}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="split">
        <section className="slip">
          <div className="slip-head"><span>Visits</span><span className="aside">latest {visits.length}</span></div>
          <div className="slip-body ledger-wrap">
            <table className="ledger">
              <tbody>
                {visits.map((visit) => (
                  <tr key={visit.transactionId}>
                    <td>
                      {shortDate(visit.transactionDate)}
                      <div className="faint">{peso(visit.purchaseAmount)}</div>
                    </td>
                    <td className="num">+{visit.pointsEarned}</td>
                  </tr>
                ))}
                {visits.length === 0 && <tr><td className="empty">Your first cup is waiting.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="slip">
          <div className="slip-head"><span>Rewards claimed</span><span className="aside">latest {claims.length}</span></div>
          <div className="slip-body ledger-wrap">
            <table className="ledger">
              <tbody>
                {claims.map((claim) => (
                  <tr key={claim.redemptionId}>
                    <td>
                      {claim.rewardName}
                      <div className="faint">{shortDate(claim.redemptionDate)}</div>
                    </td>
                    <td className="num">-{claim.pointsUsed}</td>
                  </tr>
                ))}
                {claims.length === 0 && <tr><td className="empty">Nothing claimed yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button className="btn-void" onClick={closeCard}>Not you? Close this card</button>
      </div>
    </Lobby>
  );
}
