import { useState, useEffect } from 'react';
import { api } from '../api';
import { properName, shortDate } from '../format';

export default function Customers({ barista }) {
  const [roster, setRoster] = useState([]);
  const [rosterTotal, setRosterTotal] = useState(0);
  const [lookFor, setLookFor] = useState('');
  const [problem, setProblem] = useState('');
  const isAdmin = barista.role === 'Admin';

  const loadRoster = async (term = '') => {
    setProblem('');
    try {
      const res = await api.listCustomers(term);
      setRoster(res.data);
      setRosterTotal(res.total);
    } catch (err) {
      setProblem(err.message);
    }
  };

  useEffect(() => { loadRoster(); }, []);

  const dropMember = async (member) => {
    const name = properName(`${member.firstName} ${member.lastName}`);
    if (!window.confirm(`Remove ${name} and all of their points history? This cannot be undone.`)) return;
    setProblem('');
    try {
      await api.deleteCustomer(member.customerId);
      loadRoster(lookFor);
    } catch (err) {
      setProblem(err.message);
    }
  };

  return (
    <>
      <header className="pour-head">
        <h1>Members</h1>
        <p>Everyone carrying an Evercup card.</p>
      </header>

      {problem && <div className="note-bitter">{problem}</div>}

      <section className="slip">
        <div className="slip-head">
          <span>Roster</span>
          <span className="aside">{rosterTotal} {rosterTotal === 1 ? 'member' : 'members'}</span>
        </div>
        <div className="slip-body">
          <form className="jot-row" onSubmit={(e) => { e.preventDefault(); loadRoster(lookFor); }}>
            <label className="jot">
              <span className="jot-label">Search name or email</span>
              <input value={lookFor} onChange={(e) => setLookFor(e.target.value)} />
            </label>
            <button className="btn-brew" type="submit" style={{ marginBottom: 18 }}>Search</button>
          </form>

          <div className="ledger-wrap">
            <table className="ledger">
              <thead>
                <tr>
                  <th>#</th><th>Member</th><th>Code</th><th>Joined</th><th className="end">Points</th>
                  {isAdmin && <th></th>}
                </tr>
              </thead>
              <tbody>
                {roster.map((member) => (
                  <tr key={member.customerId}>
                    <td className="faint">{String(member.customerId).padStart(3, '0')}</td>
                    <td>
                      {properName(`${member.firstName} ${member.lastName}`)}
                      <div className="faint">{member.email}</div>
                    </td>
                    <td><span className="code-chip">{member.qrCode}</span></td>
                    <td className="faint">{shortDate(member.dateRegistered)}</td>
                    <td className="num"><b>{member.pointsBalance}</b></td>
                    {isAdmin && (
                      <td className="end">
                        <button className="btn-void" onClick={() => dropMember(member)}>Remove</button>
                      </td>
                    )}
                  </tr>
                ))}
                {roster.length === 0 && (
                  <tr><td colSpan={isAdmin ? 6 : 5} className="empty">No members match.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
