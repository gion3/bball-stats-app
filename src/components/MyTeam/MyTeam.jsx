import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Line } from 'react-chartjs-2';
import PlayerCard from '../PlayerCard/PlayerCard';
import SimpleSearchBar from '../SearchBar/SimpleSearchBar'; // Assuming this component exists
import './MyTeam.css';
import { color } from 'd3';

// Helper to get the auth token
const getAuthToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
};

const MyTeam = () => {
    // State Management
    const [team, setTeam] = useState(null);
    const [allPlayers, setAllPlayers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPlayers, setFilteredPlayers] = useState([]);
    const [budget, setBudget] = useState(40); 
    const [teamValue, setTeamValue] = useState(0);
    const [currentRound, setCurrentRound] = useState(null);
    const [scoreHistory, setScoreHistory] = useState([]);
    const [totalScore, setTotalScore] = useState(null);
    const [chartType, setChartType] = useState('scorePerRound');
 

    // Roster State
    const [roster, setRoster] = useState([]); // The "draft" roster of player IDs
    const [initialRoster, setInitialRoster] = useState([]); // The saved roster for comparison
    const [rosterPlayers, setRosterPlayers] = useState([]); // Full player objects for rendering cards
    const [nextGames, setNextGames] = useState([]); // To store upcoming games
    const [lastGameStats, setLastGameStats] = useState({});
    const [lastGameScores, setLastGameScores] = useState({});
    const [lastGamePIR, setLastGamePIR] = useState({});

    // UI State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');

    //get local userId from firebaseUID
    const fetchUserId = async (token) => {
        const res = await fetch('http://localhost:5000/api/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch user ID');
        const data = await res.json();
        return data.id; 
    };

    //get user score history
    useEffect(() => {
        const fetchScoreHistory = async () => {
            if (!team) return;
            const token = await getAuthToken();
            if (!token) return;
            const userId = team.user_id || (await fetchUserId(token));
            try {
                const res = await fetch(`http://localhost:5000/api/fantasy/user/scorebyround/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to fetch score history');
                const data = await res.json();
                setScoreHistory(data.scores || []);
            } catch (err) {
                setScoreHistory([]);
            }
        };
        fetchScoreHistory();
    }, [team]);

    // --- DATA FETCHING ---
    const fetchUserTeam = useCallback(async (token) => {
        try {
            const response = await fetch('http://localhost:5000/api/fantasy/teams', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch team');
            const data = await response.json();
            if (data.length > 0) {
                setTeam(data[0]);
                setBudget(data[0].budget || 40);
            }
            return data[0];
        } catch (err) {
            setError(err.message);
            return null;
        }
    }, []);

    //calculate total score from round_score
    const getTotalScoreEvolution = (scoreHistory) => {
        let total = 0;
        return scoreHistory.map(s => {
            total += s.score_per_round;
            return { ...s, total_score: total };
        });
    };

    // --- MAIN EFFECT FOR INITIAL LOAD ---
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setLoading(true);
                const token = await user.getIdToken();
                await fetchUserTeam(token);
                // Fetch all players once
                try {
                    const playersResponse = await fetch('http://localhost:5000/api/players/all-with-stats');
                    const playersData = await playersResponse.json();
                    setAllPlayers(playersData);

                    const currentRoundResponse = await fetch('http://localhost:5000/api/games/crt');
                    const currentRoundData = await currentRoundResponse.json();
                    setCurrentRound(currentRoundData.current_round);


                    // const gamesResponse = await fetch(`http://localhost:5000/api/games/round/${currentRound}`);
                    // const gamesData = await gamesResponse.json();
                    // setNextGames(gamesData);

                } catch (err) {
                    setError('Failed to fetch players or games.');
                }
                setLoading(false);
            } else {
                setError('Please log in to see your team.');
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [fetchUserTeam]);

    //get user total score
    useEffect(() => {
        const fetchTotalScore = async () => {
            if (!team) return;
            const token = await getAuthToken();
            if (!token) return;
            try {
                // Use team.user_id if available, or fetch user ID as above
                const userId = team.user_id || (await fetchUserId(token));
                const res = await fetch(`http://localhost:5000/api/fantasy/user/totalscore/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to fetch total score');
                const data = await res.json();
                setTotalScore(data.members?.[0]?.total_score ?? 0);
            } catch (err) {
                setTotalScore('N/A');
            }
        };
        fetchTotalScore();
    }, [team]);

    //get upcoming games
    useEffect(() => {
        if (!currentRound) return;
        const fetchGames = async () => {
          try {
            const res = await fetch(`http://localhost:5000/api/games/round/${currentRound}`);
            const data = await res.json();
            setNextGames(data);
          } catch (err) {
            setError("Failed to fetch games");
          } finally {
            setLoading(false);
          }
        };
        fetchGames();
    }, [currentRound]);
   

    useEffect(() => {
        async function fetchStats() {
          const stats = {};
          const scores = {};
          for (const player of rosterPlayers) {
            const res = await fetch(`http://localhost:5000/api/games/most-recent-game-player-row/${player.PLAYER_ID}`);
            const data = await res.json();
            stats[player.PLAYER_ID] = data;
            // Calculate score using formula
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
        async function fetchRoster() {
            if (!team) return;
            const token = await getAuthToken();
            try {
                const response = await fetch(`http://localhost:5000/api/fantasy/teams/roster`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch roster');
                const data = await response.json();
                setRoster(data);
                setInitialRoster(data);
            } catch (err) {
                setError(err.message);
            }
        }
        fetchRoster();
    }, [team]);

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

    // Calculate team value whenever roster or allPlayers changes
    useEffect(() => {
        const value = roster.reduce((sum, id) => {
            const player = allPlayers.find(p => p.PLAYER_ID === id);
            return sum + (player ? Number(player.fantasy_price) : 0);
        }, 0);
        setTeamValue(value);
    }, [roster, allPlayers]);

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
        if (teamValue > budget) {
            setError('You are over budget!');
            return;
        }
        const token = await getAuthToken();
        if (!token) return;

        try {
            const response = await fetch(`http://localhost:5000/api/fantasy/teams/roster`, {
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
            const newTeam = await response.json();
            setNewTeamName('');
            setShowCreateForm(false);
            setTeam({ id: newTeam.teamId, name: newTeam.teamName, budget: newTeam.budget });
        } catch (err) {
            setError(err.message);
        }
    };

    // --- RENDER LOGIC ---
    if (loading) return <div>Loading...</div>;
    if (error) return <div className="error-message">{error}</div>;

    if (!team && !showCreateForm) {
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
    
    // Budget color logic
    const overBudget = teamValue > budget;
    const budgetClass = overBudget ? 'budget-over' : 'budget-ok';


    return (
        
        <div className="my-team-container">
            

            {showCreateForm && (
                <form onSubmit={handleCreateTeam} className="create-team-form">
                    <input type="text" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder="New team name" required/>
                    <button type="submit">Save</button>
                    <button type="button" onClick={() => { setShowCreateForm(false); setNewTeamName(''); }}>Cancel</button>
                </form>
            )}

           
            <div className="top-flex-section">
                <section className="roster-section">
                <div className="myteam-header-row">
                    
                        <h2 style={{color:"black", marginBottom: 0}}>MyTeam</h2>
                        <h2 className="team-total-score" style={{color:"black", marginBottom: 0}}>
                            Total score: {totalScore !== null ? totalScore : 'Loading...'}
                        </h2>
                        <h2 className={`team-budget ${budgetClass}`}>
                            Budget: {teamValue}/{budget}
                        </h2>
                    
                </div>
                    <div className="roster-grid">
                        {rosterPlayers.map(player => (
                            <div key={player.PLAYER_ID} onContextMenu={(e) => handleRemovePlayer(e, player.PLAYER_ID)}>
                                <PlayerCard playerId={player.PLAYER_ID} />
                                <div
                                className={`player-scores-text ${
                                    lastGameStats[player.PLAYER_ID]?.PIR !== undefined
                                    ? getScoreClass(lastGameStats[player.PLAYER_ID]?.PIR)
                                    : ''
                                }`}
                                >
                                Last Round Score: {lastGameStats[player.PLAYER_ID]?.PIR !== undefined ? parseFloat(lastGameStats[player.PLAYER_ID].PIR).toFixed(2) : 'N/A'}
                                </div>
                            </div>
                        ))}
                    </div>
                    {hasUnsavedChanges && (
                        <button
                            onClick={handleSaveRoster}
                            className="save-changes-btn"
                            disabled={roster.length !== 5 || overBudget}
                            style={overBudget ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                        >
                            Save Changes {roster.length !== 5 && "(5 players required)"}
                            {overBudget && " (Over Budget)"}
                        </button>
                    )}
                </section>

                <div className="available-players-section">
                    <h2>Available Players</h2>
                    <SimpleSearchBar
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        placeholder="Search players..."
                    />
                    <ul className="player-list">
                        {filteredPlayers.map(player => (
                            <li key={player.PLAYER_ID} onClick={() => handleAddPlayer(player.PLAYER_ID)}>
                                <span>{player.PLAYER_NAME} - {player.TEAM_ABBREVIATION}</span>
                                <span><strong>{player.fantasy_price}</strong></span>
                                
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            
            <div className="bottom-flex-section">
                <section className="upcoming-games-section">
                    <h2>Upcoming Games - Round {currentRound}</h2>
                    <div className="games-grid">
                        {nextGames.map(game => (
                            <div key={game.GAME_ID} className="game-matchup-box">
                                {game.MATCHUP}
                            </div>
                        ))}
                    </div>
                </section>
                {scoreHistory.length > 0 && (
                    <div className="score-chart-section">
                        <div style={{ marginBottom: 10 , color:"black"}}>
                            <label htmlFor="chartType">Chart Type: </label>
                            <select
                                id="chartType"
                                value={chartType}
                                onChange={e => setChartType(e.target.value)}
                            >
                                <option value="scorePerRound">Score Per Round</option>
                                <option value="totalScoreEvolution">Total Score</option>
                            </select>
                        </div>
                        <Line
                            data={{
                                labels: scoreHistory.map(s => `${s.round_no}`),
                                datasets: [
                                    chartType === 'scorePerRound'
                                        ? {
                                            label: 'Score Per Round',
                                            data: scoreHistory.map(s => s.score_per_round),
                                            fill: false,
                                            borderColor: '#1976d2',
                                            backgroundColor: '#1976d2',
                                            tension: 0.2,
                                        }
                                        : {
                                            label: 'Total Score',
                                            data: getTotalScoreEvolution(scoreHistory).map(s => s.total_score),
                                            fill: false,
                                            borderColor: '#43a047',
                                            backgroundColor: '#43a047',
                                        }
                                ],
                            }}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: { display: false },
                                },
                                scales: {
                                    x: { title: { display: true, text: 'Round' } },
                                    y: { title: { display: true, text: chartType === 'scorePerRound' ? 'Score' : 'Total Score' } },
                                },
                            }}
                        />
                    </div>
                )}
                
            </div>
        </div>
    );
};

export default MyTeam;
