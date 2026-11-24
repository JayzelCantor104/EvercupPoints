import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Customers({ user }) {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const load = async (term = '') => {
    setError('');
    try {
      const res = await api.listCustomers(term);
      setRows(res.data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    setError('');
    try {
      await api.deleteCustomer(id);
      load(search);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <h1>Members</h1>
      <p className="sub">Everyone enrolled in the loyalty program.</p>

      {error && <div className="alert err">{error}</div>}

      <div className="card">
        <form className="row" onSubmit={(e) => { e.preventDefault(); load(search); }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
                 placeholder="Search by name or email" />
          <button className="primary" style={{ flex: '0 0 auto' }} type="submit">Search</button>
        </form>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Email</th><th>QR code</th><th>Points</th>
              {user.role === 'Admin' && <th></th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.customerId}>
                <td>{c.customerId}</td>
                <td>{c.firstName} {c.lastName}</td>
                <td className="muted">{c.email}</td>
                <td><span className="pill">{c.qrCode}</span></td>
                <td><strong>{c.pointsBalance}</strong></td>
                {user.role === 'Admin' && (
                  <td style={{ textAlign: 'right' }}>
                    <button className="link" onClick={() => remove(c.customerId)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan="6" className="muted">No members found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
