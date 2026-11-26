import { useState, useEffect } from 'react';
import { api } from '../api';

const BLANK_REWARD = { rewardName: '', description: '', pointsRequired: '' };

export default function Rewards({ barista }) {
  const [rewardMenu, setRewardMenu] = useState([]);
  const [draft, setDraft] = useState(BLANK_REWARD);
  const [problem, setProblem] = useState('');
  const isAdmin = barista.role === 'Admin';

  const loadMenu = async () => {
    setProblem('');
    try {
      const res = await api.listRewards();
      setRewardMenu(res.data);
    } catch (err) {
      setProblem(err.message);
    }
  };

  useEffect(() => { loadMenu(); }, []);

  const fill = (field) => (e) => setDraft({ ...draft, [field]: e.target.value });

  const addToMenu = async (e) => {
    e.preventDefault();
    setProblem('');
    try {
      await api.createReward({
        rewardName: draft.rewardName.trim(),
        description: draft.description.trim(),
        pointsRequired: parseInt(draft.pointsRequired, 10),
      });
      setDraft(BLANK_REWARD);
      loadMenu();
    } catch (err) {
      setProblem(err.message);
    }
  };

  // retire = hide from members without deleting
  const flipServing = async (reward) => {
    setProblem('');
    try {
      await api.setRewardServing(reward.rewardId, !reward.isActive);
      loadMenu();
    } catch (err) {
      setProblem(err.message);
    }
  };

  const takeOffMenu = async (reward) => {
    if (!window.confirm(`Delete "${reward.rewardName}" from the reward menu?`)) return;
    setProblem('');
    try {
      await api.deleteReward(reward.rewardId);
      loadMenu();
    } catch (err) {
      setProblem(err.message);
    }
  };

  return (
    <>
      <header className="pour-head">
        <h1>Reward menu</h1>
        <p>What members can trade their points for.</p>
      </header>

      {problem && <div className="note-bitter">{problem}</div>}

      {isAdmin && (
        <section className="slip">
          <div className="slip-head"><span>Add to the menu</span><span className="aside">admin</span></div>
          <form className="slip-body" onSubmit={addToMenu}>
            <div className="jot-row">
              <label className="jot" style={{ flex: 2 }}>
                <span className="jot-label">Reward name</span>
                <input value={draft.rewardName} onChange={fill('rewardName')} placeholder="Free Iced Americano" required />
              </label>
              <label className="jot">
                <span className="jot-label">Points needed</span>
                <input type="number" min="1" value={draft.pointsRequired} onChange={fill('pointsRequired')} required />
              </label>
            </div>
            <label className="jot">
              <span className="jot-label">Description</span>
              <input value={draft.description} onChange={fill('description')} placeholder="One 16oz cup" />
            </label>
            <button className="btn-brew" type="submit">Add reward</button>
          </form>
        </section>
      )}

      <section className="slip">
        <div className="slip-head"><span>On the menu</span><span className="aside">{rewardMenu.length} items</span></div>
        <div className="slip-body ledger-wrap">
          <table className="ledger">
            <thead>
              <tr>
                <th>Reward</th><th>Status</th><th className="end">Points</th>
                {isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {rewardMenu.map((reward) => (
                <tr key={reward.rewardId}>
                  <td>
                    {reward.rewardName}
                    {reward.description && <div className="faint">{reward.description}</div>}
                  </td>
                  <td className="faint">{reward.isActive ? 'Serving' : 'Retired'}</td>
                  <td className="num"><b>{reward.pointsRequired}</b></td>
                  {isAdmin && (
                    <td className="end" style={{ whiteSpace: 'nowrap' }}>
                      <button className="btn-void" style={{ color: 'var(--ink)', marginRight: 14 }}
                              onClick={() => flipServing(reward)}>
                        {reward.isActive ? 'Retire' : 'Restore'}
                      </button>
                      <button className="btn-void" onClick={() => takeOffMenu(reward)}>Delete</button>
                    </td>
                  )}
                </tr>
              ))}
              {rewardMenu.length === 0 && (
                <tr><td colSpan={isAdmin ? 4 : 3} className="empty">The menu is empty.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
