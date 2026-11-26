import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { api } from '../api';
import { properName } from '../format';

export default function Scan() {
  const [guest, setGuest] = useState(null);
  const [typedCode, setTypedCode] = useState('');
  const [receiptNo, setReceiptNo] = useState('');
  const [amount, setAmount] = useState('');
  const [rewardMenu, setRewardMenu] = useState([]);
  const [problem, setProblem] = useState('');
  const [goodNews, setGoodNews] = useState('');
  const [cameraOn, setCameraOn] = useState(false);
  const lens = useRef(null);

  const clearNotes = () => { setProblem(''); setGoodNews(''); };

  useEffect(() => {
    api.listRewards(true).then((res) => setRewardMenu(res.data)).catch(() => {});
    return () => { stopCamera(); };
  }, []);

  const stopCamera = async () => {
    if (lens.current) {
      try { await lens.current.stop(); } catch { /* already stopped */ }
      lens.current = null;
    }
    setCameraOn(false);
  };

  const startCamera = async () => {
    clearNotes();
    setCameraOn(true);
    try {
      const reader = new Html5Qrcode('qr-reader');
      lens.current = reader;
      await reader.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        async (decoded) => {
          await stopCamera();
          findGuest(decoded);
        },
        () => {},
      );
    } catch {
      setProblem('Could not open the camera. The page must be on https or localhost.');
      setCameraOn(false);
    }
  };

  const findGuest = async (memberCode) => {
    clearNotes();
    try {
      setGuest(await api.getCustomerByQr(memberCode.trim().toUpperCase()));
    } catch (err) {
      setGuest(null);
      setProblem(err.message);
    }
  };

  const refreshGuest = async () => setGuest(await api.getCustomer(guest.customerId));

  const ringUp = async (e) => {
    e.preventDefault();
    clearNotes();
    try {
      const entry = await api.awardPoints(guest.customerId, receiptNo.trim(), parseFloat(amount));
      setGoodNews(`+${entry.pointsEarned} pts for receipt ${entry.receiptNumber}.`);
      await refreshGuest();
      setReceiptNo('');
      setAmount('');
    } catch (err) {
      setProblem(err.message);
    }
  };

  const handOver = async (reward) => {
    clearNotes();
    try {
      const claim = await api.redeem(guest.customerId, reward.rewardId);
      setGoodNews(`${reward.rewardName} claimed. -${claim.pointsUsed} pts.`);
      await refreshGuest();
    } catch (err) {
      setProblem(err.message);
    }
  };

  return (
    <>
      <header className="pour-head">
        <h1>Who's at the counter?</h1>
        <p>Scan the member's QR, or type the code under it.</p>
      </header>

      {problem && <div className="note-bitter">{problem}</div>}
      {goodNews && <div className="note-sweet">{goodNews}</div>}

      <section className="slip">
        <div className="slip-head"><span>Find member</span></div>
        <div className="slip-body">
          <div id="qr-reader" />
          {cameraOn
            ? <button className="btn-quiet" onClick={stopCamera}>Stop camera</button>
            : <button className="btn-brew" onClick={startCamera}>Start camera</button>}

          <div className="or-line">OR</div>

          <form className="jot-row" onSubmit={(e) => { e.preventDefault(); findGuest(typedCode); }}>
            <label className="jot" style={{ marginBottom: 0 }}>
              <span className="jot-label">Member code</span>
              <input className="mono" value={typedCode} onChange={(e) => setTypedCode(e.target.value)}
                     placeholder="EVC-0001-7F3A" />
            </label>
            <button className="btn-brew" type="submit" disabled={!typedCode.trim()}>Look up</button>
          </form>
        </div>
      </section>

      {guest && (
        <>
          <section className="slip">
            <div className="slip-head">
              <span>Member</span>
              <span className="code-chip">{guest.qrCode}</span>
            </div>
            <div className="slip-body jot-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2>{properName(`${guest.firstName} ${guest.lastName}`)}</h2>
                <div className="faint">{guest.email}</div>
              </div>
              <div className="tally">{guest.pointsBalance}<small>PTS</small></div>
            </div>
          </section>

          <div className="split">
            <section className="slip">
              <div className="slip-head"><span>Ring up a purchase</span><span className="aside">1 pt / ₱10</span></div>
              <form className="slip-body" onSubmit={ringUp}>
                <label className="jot">
                  <span className="jot-label">UTAK receipt no.</span>
                  <input className="mono" value={receiptNo} onChange={(e) => setReceiptNo(e.target.value)}
                         placeholder="OR-2026-004901" required />
                </label>
                <label className="jot">
                  <span className="jot-label">Amount paid (₱)</span>
                  <input type="number" step="0.01" min="0.01" value={amount}
                         onChange={(e) => setAmount(e.target.value)} placeholder="250.00" required />
                </label>
                <button className="btn-brew wide" type="submit">Add points</button>
                <p className="faint" style={{ marginBottom: 0 }}>Each receipt can earn points only once.</p>
              </form>
            </section>

            <section className="slip">
              <div className="slip-head"><span>Hand over a reward</span></div>
              <div className="slip-body" style={{ paddingTop: 4, paddingBottom: 4 }}>
                {rewardMenu.length === 0 && <p className="faint">No active rewards.</p>}
                {rewardMenu.map((reward) => (
                  <div key={reward.rewardId} className="menu-item" style={{ alignItems: 'center' }}>
                    <div>
                      <div className="menu-name">{reward.rewardName}</div>
                      <div className="short">{reward.pointsRequired} pts</div>
                    </div>
                    <button className="btn-quiet" onClick={() => handOver(reward)}
                            disabled={guest.pointsBalance < reward.pointsRequired}
                            style={guest.pointsBalance < reward.pointsRequired ? { opacity: .35, cursor: 'default' } : null}>
                      Claim
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </>
  );
}
