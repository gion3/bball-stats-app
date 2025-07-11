import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../UserContext";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebaseConfig";
import "./LeaguePage.css";
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';

const LeaguePage = () => {
  const { user } = useContext(GlobalContext);
  const navigate = useNavigate();
  const [leagues, setLeagues] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [leagueName, setLeagueName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch user's leagues
  useEffect(() => {
    const fetchLeagues = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch("http://localhost:5000/api/fantasy/leagues/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          // Fetch user count for each league
          const leaguesWithCounts = await Promise.all(
            data.leagues.map(async (league) => {
              try {
                const countRes = await fetch(`http://localhost:5000/api/fantasy/leagues/${league.id}/usercount`);
                const countData = await countRes.json();
                // The endpoint returns { members: [{ 'count(user_id)': N }] }
                const userCount = Array.isArray(countData.members) && countData.members[0] ? Object.values(countData.members[0])[0] : 1;
                return { ...league, userCount };
              } catch {
                return { ...league, userCount: 1 };
              }
            })
          );
          setLeagues(leaguesWithCounts);
        } else setErrorMsg(data.message || "Failed to fetch leagues");
      } catch (err) {
        setErrorMsg("Failed to fetch leagues");
      } finally {
        setLoading(false);
      }
    };
    fetchLeagues();
  }, [user]);

  // Create league handler
  const handleCreateLeague = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setAccessCode("");
    if (!leagueName) {
      setErrorMsg("Please enter a league name.");
      return;
    }
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("http://localhost:5000/api/fantasy/leagues/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: leagueName }),
      });
      const data = await res.json();
      if (res.ok) {
        setAccessCode(data.accessCode);
        setLeagueName("");
        // Refresh leagues
        setLeagues((prev) => [
          ...prev,
          { id: data.leagueId, name: leagueName, access_code: data.accessCode, userCount: 1 },
        ]);
      } else {
        setErrorMsg(data.message || "Failed to create league");
      }
    } catch (err) {
      setErrorMsg("Failed to create league");
    }
  };

  // Join league handler
  const handleJoinLeague = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    if (!joinCode) {
      setErrorMsg("Please enter an access code.");
      return;
    }
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("http://localhost:5000/api/fantasy/leagues/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ accessCode: joinCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Joined league successfully!");
        setShowJoin(false);
        setJoinCode("");
        // Refresh leagues
        setLeagues((prev) => [
          ...prev,
          { id: data.leagueId || Date.now(), name: joinCode, access_code: joinCode, userCount: 1 },
        ]);
      } else {
        setErrorMsg(data.message || "Failed to join league");
      }
    } catch (err) {
      setErrorMsg("Failed to join league");
    }
  };

  const handleLeagueClick = (leagueId) => {
    navigate(`/leagues/${leagueId}`);
  };

  if (!user) {
    return <div className="league-page-container"><h2>Please log in to view your leagues.</h2></div>;
  }

  return (
    <div className="league-page-container">
      <h1>Fantasy Leagues</h1>
      <div className="league-actions">
        <button onClick={() => { setShowCreate(true); setShowJoin(false); }}>Create a League</button>
        <button onClick={() => { setShowJoin(true); setShowCreate(false); }}>Join a League</button>
      </div>
      {successMsg && <div className="success-msg">{successMsg}</div>}
      {errorMsg && <div className="error-msg">{errorMsg}</div>}
      {/* Create League Modal */}
      {showCreate && (
        <form className="league-modal" onSubmit={handleCreateLeague}>
          <h2>Create League</h2>
          <input
            type="text"
            placeholder="League Name"
            value={leagueName}
            onChange={e => setLeagueName(e.target.value)}
          />
          <button type="submit">Create</button>
          <button type="button" onClick={() => setShowCreate(false)}>Cancel</button>
        </form>
      )}
      {/* Join League Modal */}
      {showJoin && (
        <form className="league-modal" onSubmit={handleJoinLeague}>
          <h2>Join League</h2>
          <input
            type="text"
            placeholder="Access Code"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value)}
          />
          <button type="submit">Join</button>
          <button type="button" onClick={() => setShowJoin(false)}>Cancel</button>
        </form>
      )}
      <h2>Your Leagues</h2>
      {loading ? (
        <div>Loading leagues...</div>
      ) : (
        <div className="league-list">
          {leagues.length === 0 ? (
            <div>No leagues joined yet.</div>
          ) : (
            leagues.map(league => (
              <div
                key={league.id}
                className="league-card"
                onClick={() => handleLeagueClick(league.id)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <h3>{league.name}</h3>
                  <p>Access Code: <span className="access-code">{league.access_code}</span></p>
                </div>
                <div className="league-user-count">
                  {league.userCount} {<PersonIcon fontSize="small" />}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default LeaguePage;
