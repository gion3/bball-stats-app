import { useContext, useState } from "react";
import { GlobalContext } from "../../UserContext";
import "./ProfilePage.css";

const ProfilePage = () => {
    const user = useContext(GlobalContext);
    const [activeTab, setActiveTab] = useState('overview');

    // Mock data - replace with real data from your backend
    const userStats = {
        totalPoints: 1250,
        ranking: 42,
        leaguesJoined: 3,
        winLoss: { wins: 15, losses: 8 },
        bestPlayers: ['LeBron James', 'Stephen Curry', 'Giannis Antetokounmpo']
    };

    const activeLeagues = [
        { id: 1, name: 'NBA Fantasy League 2024', position: 3, totalTeams: 12 },
        { id: 2, name: 'Friends League', position: 1, totalTeams: 8 },
        { id: 3, name: 'Pro League', position: 5, totalTeams: 10 }
    ];

    return (
        <div className="profile-container">
            {/* Profile Header */}
            <div className="profile-header">
                <div className="profile-avatar">
                    <img src={user?.photoURL || 'https://via.placeholder.com/150'} alt="Profile" />
                </div>
                <div className="profile-info">
                    <h1>{user?.displayName || 'Fantasy Player'}</h1>
                    <p className="email">{user?.email}</p>
                    <p className="join-date">Member since {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : '2024'}</p>
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
                    className={activeTab === 'activity' ? 'active' : ''} 
                    onClick={() => setActiveTab('activity')}
                >
                    Activity
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
                            <div className="stat-card">
                                <h3>Win/Loss</h3>
                                <p className="stat-value">{userStats.winLoss.wins}-{userStats.winLoss.losses}</p>
                            </div>
                        </div>
                        <div className="best-players">
                            <h3>Best Performing Players</h3>
                            <ul>
                                {userStats.bestPlayers.map((player, index) => (
                                    <li key={index}>{player}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'leagues' && (
                    <div className="leagues-section">
                        <h2>Active Leagues</h2>
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
                        <h2>Recent Activity</h2>
                        <div className="activity-feed">
                            <p>Activity feed coming soon...</p>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="settings-section">
                        <h2>Settings</h2>
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