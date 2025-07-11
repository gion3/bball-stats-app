import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LeaguePage.css";

const UserCreatedLeague = () => {
  const navigate = useNavigate();

  // Placeholder/mock data
  const [members] = useState([
    { display_name: "User 1", team_name: "The All-stars", score: 148.8 },
    { display_name: "User 2", team_name: "The Rookies", score: 118.2 },
    { display_name: "User 3", team_name: "Chicago Bulls", score: 110.1 },
    { display_name: "User 4", team_name: "Dunkers Team", score: 100.4 }
  ]);
  const [loading] = useState(false);
  const [error] = useState("");

  return (
    <div className="league-page-container">
      <button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>&larr; Back</button>
      <h1>League Members</h1>
      {loading ? (
        <div>Loading members...</div>
      ) : error ? (
        <div className="error-msg">{error}</div>
      ) : (
        <div className="league-list">
          {members.length === 0 ? (
            <div>No members found.</div>
          ) : (
            members.map((member, idx) => (
              <div key={idx} className="league-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3>{member.display_name}</h3>
                  <p>Team: <strong>{member.team_name}</strong></p>
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '1.2em', marginLeft: 24 }}>
                  {member.score}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UserCreatedLeague; 