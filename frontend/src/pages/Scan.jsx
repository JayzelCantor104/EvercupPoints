import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { api } from '../api';

export default function Scan() {
  const [customer, setCustomer] = useState(null);
  const [manual, setManual] = useState('');
  const [receipt, setReceipt] = useState('');
  const [amount, setAmount] = useState('');
  const [rewards, setRewards] = useState([]);
  const [error, setError] = useState('');
  const [okMsg, setOkMsg] = useState('');
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    api.listRewards(true).then((r) => setRewards(r.data)).catch(() => {});
    return () => { stopScanner(); };
  }, []);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch { /* already stopped */ }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const startScanner = async () => {
    setError(''); setOkMsg('');
    setScanning(true);
    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        async (decoded) => {
          await stopScanner();
          lookup(decoded);
        },
        () => {},
      );
    } catch (err) {
      setError('Could not open the camera. The page must be on https or localhost.');
      setScanning(false);
    }
  };

  const lookup = async (qrCode) => {
    setError(''); setOkMsg('');
    try {
      setCustomer(await api.getCustomerByQr(qrCode));
    } catch (err) {
      setCustomer(null);
      setError(err.message);
    }
  };

  const award = async (e) => {
    e.preventDefault();
    setError(''); setOkMsg('');
    try {
      const tx = await api.awardPoints(customer.customerId, receipt, parseFloat(amount));
      setOkMsg(`Added ${tx.pointsEarned} points for receipt ${tx.receiptNumber}.`);
      setCustomer(await api.getCustomer(customer.customerId));
      setReceipt(''); setAmount('');
    } catch (err) {
      setError(err.message);
    }
  };

  const claim = async (rewardId) => {
    setError(''); setOkMsg('');
    try {
      const r = await api.redeem(customer.customerId, rewardId);
      setOkMsg(`Reward claimed. ${r.pointsUsed} points deducted.`);
      setCustomer(await api.getCustomer(customer.customerId));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <h1>Scan a member</h1>
      <p className="sub">Scan the customer's QR code, or type the code shown on their profile.</p>

      {error && <div className="alert err">{error}</div>}
      {okMsg && <div className="alert ok">{okMsg}</div>}

      <div className="card">
        <h2>Camera</h2>
        <div id="qr-reader" />
        {!scanning
          ? <button className="primary" onClick={startScanner}>Start camera</button>
          : <button className="primary" onClick={stopScanner}>Stop camera</button>}

        <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
          <label>Or enter the QR code manually</label>
          <div className="row">
            <input value={manual} onChange={(e) => setManual(e.target.value)}
                   placeholder="EVC-0001-7F3A" />
            <button className="primary" style={{ flex: '0 0 auto' }}
                    onClick={() => lookup(manual.trim())} disabled={!manual.trim()}>
              Look up
            </button>
          </div>
        </div>
      </div>

      {customer && (
        <>
          <div className="card">
            <h2>{customer.firstName} {customer.lastName}</h2>
            <p className="muted" style={{ marginTop: -8 }}>
              {customer.email} &nbsp;·&nbsp; <span className="pill">{customer.qrCode}</span>
            </p>
            <div className="points">{customer.pointsBalance} points</div>
          </div>

          <div className="card">
            <h2>Award points for a purchase</h2>
            <form onSubmit={award}>
              <div className="row">
                <div className="field">
                  <label>Receipt number</label>
                  <input value={receipt} onChange={(e) => setReceipt(e.target.value)}
                         placeholder="OR-2026-004901" required />
                </div>
                <div className="field">
                  <label>Purchase amount</label>
                  <input type="number" step="0.01" min="0.01" value={amount}
                         onChange={(e) => setAmount(e.target.value)} placeholder="250.00" required />
                </div>
              </div>
              <button className="primary" type="submit">Add points</button>
              <p className="muted" style={{ marginBottom: 0 }}>
                1 point for every 10 pesos. A receipt number can only be claimed once.
              </p>
            </form>
          </div>

          <div className="card">
            <h2>Claim a reward</h2>
            {rewards.length === 0 && <p className="muted">No active rewards.</p>}
            <table>
              <tbody>
                {rewards.map((r) => (
                  <tr key={r.rewardId}>
                    <td>{r.rewardName}</td>
                    <td className="muted">{r.pointsRequired} pts</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="primary" onClick={() => claim(r.rewardId)}
                              disabled={customer.pointsBalance < r.pointsRequired}>
                        Claim
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
