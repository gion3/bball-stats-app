import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import PlayerCard from '../PlayerCard/PlayerCard';
import SimpleSearchBar from '../SearchBar/SimpleSearchBar'; // Assuming this component exists
import './MyTeam.css';

// Helper to get the auth token
const getAuthToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
};

const MyTeam = () => {
    // State Management
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [allPlayers, setAllPlayers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPlayers, setFilteredPlayers] = useState([]);

    // Roster State
    const [roster, setRoster] = useState([]); // The "draft" roster of player IDs
    const [initialRoster, setInitialRoster] = useState([]); // The saved roster for comparison
    const [rosterPlayers, setRosterPlayers] = useState([]); // Full player objects for rendering cards
    const [nextGames, setNextGames] = useState([]); // To store upcoming games
    const [lastGameStats, setLastGameStats] = useState({});
    const [lastGameScores, setLastGameScores] = useState({});

    // UI State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');

    // --- DATA FETCHING ---
    const fetchUserTeams = useCallback(async (token) => {
        try {
            const response = await fetch('http://localhost:5000/api/fantasy/teams', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch teams');
            const data = await response.json();
            setTeams(data);
            if (data.length > 0) {
                setSelectedTeam(data[0]);
            }
            return data;
        } catch (err) {
            setError(err.message);
            return [];
        }
    }, []);

    const fetchTeamRoster = useCallback(async (teamId, token) => {
        try {
            const response = await fetch(`http://localhost:5000/api/fantasy/teams/${teamId}/roster`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch roster');
            const data = await response.json();
            setRoster(data);
            setInitialRoster(data);
        } catch (err) {
            setError(err.message);
        }
    }, []);

    // --- MAIN EFFECT FOR INITIAL LOAD ---
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setLoading(true);
                const token = await user.getIdToken();
                await fetchUserTeams(token);
                // Fetch all players once
                try {
                    const playersResponse = await fetch('http://localhost:5000/api/players/all-with-stats');
                    const playersData = await playersResponse.json();
                    setAllPlayers(playersData);

                    const gamesResponse = await fetch('http://localhost:5000/api/games/next-round');
                    const gamesData = await gamesResponse.json();
                    setNextGames(gamesData);

                } catch (err) {
                    setError('Failed to fetch players or games.');
                }
                setLoading(false);
            } else {
                setError('Please log in to see your teams.');
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [fetchUserTeams]);

    useEffect(() => {
        async function fetchStats() {
          const stats = {};
          const scores = {};
          for (const player of rosterPlayers) {
            const res = await fetch(`http://localhost:5000/api/games/most-recent-game-player-row/${player.PLAYER_ID}`);
            const data = await res.json();
            stats[player.PLAYER_ID] = data;
            // Calculate score using your formula
            if (data) {
              scores[player.PLAYER_ID] =
                (data.PTS + data.REB + data.AST + data.STL + data.BLK) -
                ((data.FGA - data.FGM) + (data.FTA - data.FTM) + data.TOV + data.PF);
            }
          }
          setLastGameStats(stats);
          setLastGameScores(scores);
        }
        if (rosterPlayers.length > 0) fetchStats();
    }, [rosterPlayers]);
    
    // --- DERIVED STATE & DEPENDENCY EFFECTS ---
    useEffect(() => {
        if (selectedTeam) {
            getAuthToken().then(token => {
                if(token) fetchTeamRoster(selectedTeam.id, token);
            });
        }
    }, [selectedTeam, fetchTeamRoster]);

    useEffect(() => {
        setRosterPlayers(roster.map(id => allPlayers.find(p => p.PLAYER_ID === id)).filter(Boolean));
    }, [roster, allPlayers]);

    useEffect(() => {
        setFilteredPlayers(
            allPlayers.filter(p => p.PLAYER_NAME.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, allPlayers]);

    const hasUnsavedChanges = useMemo(() => {
        if (roster.length !== initialRoster.length) return true;
        const sortedRoster = [...roster].sort();
        const sortedInitial = [...initialRoster].sort();
        return sortedRoster.some((id, index) => id !== sortedInitial[index]);
    }, [roster, initialRoster]);

    // --- EVENT HANDLERS ---
    const handleAddPlayer = (playerId) => {
        if (roster.length < 5 && !roster.includes(playerId)) {
            setRoster(prev => [...prev, playerId]);
        }
    };

    const handleRemovePlayer = (e, playerId) => {
        e.preventDefault(); // Prevent context menu from appearing
        setRoster(prev => prev.filter(id => id !== playerId));
    };
    
    const handleSaveRoster = async () => {
        if (roster.length !== 5) {
            setError('Roster must have exactly 5 players to save.');
            return;
        }
        const token = await getAuthToken();
        if (!token || !selectedTeam) return;

        try {
            const response = await fetch(`http://localhost:5000/api/fantasy/teams/${selectedTeam.id}/roster`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ playerIds: roster }),
            });
            if (!response.ok) throw new Error('Failed to save roster.');
            setInitialRoster(roster); // Set the new baseline
            alert('Roster saved!');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        const token = await getAuthToken();
        if (!newTeamName.trim() || !token) return;

        try {
            const response = await fetch('http://localhost:5000/api/fantasy/teams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ teamName: newTeamName }),
            });
            if (!response.ok) throw new Error('Failed to create team');
            
            const newTeam = await response.json(); // Capture the new team's data

            setNewTeamName('');
            setShowCreateForm(false);
            
            // Refresh the teams list and automatically select the new one
            await fetchUserTeams(token).then((fetchedTeams) => {
                const justCreatedTeam = fetchedTeams.find(t => t.id === newTeam.teamId);
                if (justCreatedTeam) {
                    setSelectedTeam(justCreatedTeam);
                }
            });

        } catch (err) {
            setError(err.message);
        }
    };

    // --- RENDER LOGIC ---
    if (loading) return <div>Loading...</div>;
    if (error) return <div className="error-message">{error}</div>;

    if (teams.length === 0 && !showCreateForm) {
        // Special view for first-time users
        return (
            <div className="my-team-container centered-form">
                <h2>Create Your First Fantasy Team</h2>
                <form onSubmit={handleCreateTeam}>
                    <input type="text" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder="Enter team name" required />
                    <button type="submit">Create Team</button>
                </form>
            </div>
        );
    }
    function getScoreClass(score) {
        if (score < 0) return 'score-red';
        if (score < 15) return 'score-yellow';
        return 'score-green';
    }
    
    return (
        <div className="my-team-container">
            <header className="team-header">
                <h1>My Teams</h1>
                <div className="team-controls">
                    <select
                        value={selectedTeam?.id || ''}
                        onChange={(e) => setSelectedTeam(teams.find(t => t.id === parseInt(e.target.value)))}
                    >
                        {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                    </select>
                    <button onClick={() => setShowCreateForm(true)} className="add-team-btn">+</button>
                </div>
            </header>

            {showCreateForm && (
                <form onSubmit={handleCreateTeam} className="create-team-form">
                    <input type="text" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder="New team name" required/>
                    <button type="submit">Save</button>
                    <button type="button" onClick={() => { setShowCreateForm(false); setNewTeamName(''); }}>Cancel</button>
                </form>
            )}

            <main className="team-content-area">
                <section className="roster-section">
                    <h2>Current Roster</h2>
                    <div className="roster-grid">
                        {rosterPlayers.map(player => (
                            <div key={player.PLAYER_ID} onContextMenu={(e) => handleRemovePlayer(e, player.PLAYER_ID)}>
                                <PlayerCard playerId={player.PLAYER_ID} />
                                <div
                                className={`player-scores-text ${
                                    lastGameScores[player.PLAYER_ID] !== undefined
                                    ? getScoreClass(lastGameScores[player.PLAYER_ID])
                                    : ''
                                }`}
                                >
                                Last Game Score: {lastGameScores[player.PLAYER_ID] !== undefined ? lastGameScores[player.PLAYER_ID] : 'Loading...'}
                                </div>
                            </div>
                        ))}
                    </div>
                    {hasUnsavedChanges && (
                        <button onClick={handleSaveRoster} className="save-changes-btn" disabled={roster.length !== 5}>
                            Save Changes {roster.length !== 5 && "(5 players required)"}
                        </button>
                    )}
                </section>

                <aside className="available-players-section">
                    <h2>Available Players</h2>
                    <SimpleSearchBar
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        placeholder="Search players..."
                    />
                    <ul className="player-list">
                        {filteredPlayers.map(player => (
                            <li key={player.PLAYER_ID} onClick={() => handleAddPlayer(player.PLAYER_ID)}>
                                <span>{player.PLAYER_NAME}</span>
                                <span className="player-team-abbr">{player.TEAM_ABBREVIATION}</span>
                            </li>
                        ))}
                    </ul>
                </aside>
            </main>

            <section className="upcoming-games-section">
                <h2>Upcoming Games</h2>
                <div className="games-grid">
                    {nextGames.map(game => (
                        <div key={game.GAME_ID} className="game-matchup-box">
                            {game.MATCHUP} - {game.gd}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default MyTeam;
