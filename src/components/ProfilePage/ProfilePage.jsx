import { useContext, useState,useEffect } from "react";
import { GlobalContext } from "../../UserContext";
import { auth } from "../../firebaseConfig";
import "./ProfilePage.css";
import pfp from "../../assets/165513.jpg";

const ProfilePage = () => {
    const {user} = useContext(GlobalContext);
    const [activeTab, setActiveTab] = useState('overview');
    const [activeLeagues, setActiveLeagues] = useState([]);
    const [error, setError] = useState('');

    // Mock data - replace with real data from your backend
    const userStats = {
        totalPoints: 1250,
        ranking: 42,
        leaguesJoined: 3,
        winLoss: { wins: 15, losses: 8 },
        bestPlayers: ['LeBron James', 'Stephen Curry', 'Giannis Antetokounmpo']
    };

    // const activeLeagues = [
    //     { id: 1, name: 'NBA Fantasy League 2024', position: 3, totalTeams: 12 },
    //     { id: 2, name: 'Friends League', position: 1, totalTeams: 8 },
    //     { id: 3, name: 'Pro League', position: 5, totalTeams: 10 }
    // ];

    const fetchActiveLeagues = async () => {
        const token = await auth.currentUser.getIdToken(); 
        const res = await fetch("http://localhost:5000/api/fantasy/leagues/mine", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        console.log('API response:', data);
        if (res.ok) {
          return data.leagues;
        } else {
          throw new Error(data.message || "Failed to fetch leagues");
        }
    };

    useEffect(() => {
        const getLeagues = async () => {
          try {
            const leagues = await fetchActiveLeagues();
            setActiveLeagues(leagues);
          } catch (err) {
            setError(err.message);
          }
        };
        getLeagues();
    }, []);

    return (
        <div className="profile-container">
            {/* Profile Header */}
            <div className="profile-header">
                <div className="profile-avatar">
                    <img src={pfp} alt="Profile" />
                </div>
                <div className="profile-info">
                    <h1>{user?.displayName || 'Fantasy Player'}</h1>
                    <p className="email">{user?.email}</p>
                    <p className="join-date">Member since: {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'unknown'}</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="profile-tabs">
                <button 
                    className={activeTab === 'overview' ? 'active' : ''} 
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button 
                    className={activeTab === 'leagues' ? 'active' : ''} 
                    onClick={() => setActiveTab('leagues')}
                >
                    My Leagues
                </button>
                
                <button 
                    className={activeTab === 'settings' ? 'active' : ''} 
                    onClick={() => setActiveTab('settings')}
                >
                    Settings
                </button>
            </div>

            {/* Content Sections */}
            <div className="profile-content">
                {activeTab === 'overview' && (
                    <div className="overview-section">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>Total Points</h3>
                                <p className="stat-value">{userStats.totalPoints}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Current Ranking</h3>
                                <p className="stat-value">#{userStats.ranking}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Leagues</h3>
                                <p className="stat-value">{userStats.leaguesJoined}</p>
                            </div>
                        </div>
                        {/* <div className="best-players">
                            <h3>Best Performing Players</h3>
                            <ul>
                                {userStats.bestPlayers.map((player, index) => (
                                    <li key={index}>{player}</li>
                                ))}
                            </ul>
                        </div> */}
                    </div>
                )}

                {activeTab === 'leagues' && (
                    <div className="leagues-section">
                        <h2 className="py-6">Active Leagues</h2>
                        <div className="leagues-grid">
                            {activeLeagues.map(league => (
                                <div key={league.id} className="league-card">
                                    <h3>{league.name}</h3>
                                    <p>Position: {league.position}/{league.totalTeams}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className="activity-section">
                        <h2 className="py-6">Recent Activity</h2>
                        <div className="activity-feed">
                            <p>Activity feed coming soon...</p>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="settings-section">
                        <h2 className="py-6">Settings</h2>
                        <div className="settings-grid">
                            <div className="setting-card">
                                <h3>Notifications</h3>
                                <p>Manage your notification preferences</p>
                            </div>
                            <div className="setting-card">
                                <h3>Privacy</h3>
                                <p>Control your privacy settings</p>
                            </div>
                            <div className="setting-card">
                                <h3>Theme</h3>
                                <p>Customize your app appearance</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;