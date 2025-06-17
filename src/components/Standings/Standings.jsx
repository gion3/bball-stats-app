import React, { useEffect, useState } from 'react';
import './Standings.css';

const Standings = () => {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/teams/standings');
        if (!response.ok) throw new Error('Failed to fetch standings');
        const data = await response.json();
        setStandings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStandings();
  }, []);

  if (loading) return <div>Loading standings...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="standings-container">
      <h2>League Standings</h2>
      <table className="standings-table">
        <thead>
          <tr>
            <th>Logo</th>
            <th>Team</th>
            <th>Wins</th>
            <th>Losses</th>
            <th>Win %</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team) => (
            <tr key={team.team_id}>
              <td>
                <img
                  src={`/team_logos/${team.team_id}.png`}
                  alt={team.TEAM_NAME}
                  className="team-logo"
                  style={{ width: 40, height: 40 }}
                  onError={e => { e.target.onerror = null; e.target.src = '/team_logos/default.png'; }}
                />
              </td>
              <td>{team.TEAM_NAME}</td>
              <td>{team.W}</td>
              <td>{team.L}</td>
              <td>{(team.W_PCT * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Standings;
