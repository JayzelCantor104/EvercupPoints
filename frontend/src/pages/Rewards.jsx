import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Rewards({ user }) {
  const [rows, setRows] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try {
      const res = await api.listRewards();
      setRows(res.data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.createReward({
        rewardName: name,
        description,
        pointsRequired: parseInt(points, 10),
      });
      setName(''); setDescription(''); setPoints('');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    setError('');
    try { await api.deleteReward(id); load(); }
    catch (err) { setError(err.message); }
  };

  return (
    <>
      <h1>Rewards</h1>
      <p className="sub">What members can claim with their points.</p>

      {error && <div className="alert err">{error}</div>}

      {user.role === 'Admin' && (
        <div className="card">
          <h2>Add a reward</h2>
          <form onSubmit={add}>
            <div className="row">
              <div className="field">
                <label>Reward name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="field">
                <label>Points required</label>
                <input type="number" min="1" value={points}
                       onChange={(e) => setPoints(e.target.value)} required />
              </div>
            </div>
            <div className="field">
              <label>Description</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <button className="primary" type="submit">Add reward</button>
          </form>
        </div>
      )}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Reward</th><th>Description</th><th>Points</th><th>Status</th>
              {user.role === 'Admin' && <th></th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.rewardId}>
                <td>{r.rewardName}</td>
                <td className="muted">{r.description}</td>
                <td><strong>{r.pointsRequired}</strong></td>
                <td>{r.isActive ? 'Active' : 'Retired'}</td>
                {user.role === 'Admin' && (
                  <td style={{ textAlign: 'right' }}>
                    <button className="link" onClick={() => remove(r.rewardId)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan="5" className="muted">No rewards yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
