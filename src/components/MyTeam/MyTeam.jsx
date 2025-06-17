import React, { useState, useEffect } from 'react';
import PlayerCard from '../PlayerCard/PlayerCard';
import './MyTeam.css';

const MyTeam = () => {
    const [allPlayers, setAllPlayers] = useState([]);
    const [filteredPlayers, setFilteredPlayers] = useState([]);
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch all players with their stats
    useEffect(() => {
        fetch('http://localhost:5000/api/players/all-with-stats')
            .then(response => response.json())
            .then(data => {
                setAllPlayers(data);
                setFilteredPlayers(data);
            })
            .catch(error => console.error('Error fetching players:', error));
    }, []);

    // Filter players based on search term
    useEffect(() => {
        if (!searchTerm) {
            setFilteredPlayers(allPlayers);
            return;
        }

        const filtered = allPlayers.filter(player => 
            player.PLAYER_NAME.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredPlayers(filtered);
    }, [searchTerm, allPlayers]);

    const handlePlayerSelect = (player) => {
        if (selectedPlayers.length >= 5) {
            alert('You can only select up to 5 players!');
            return;
        }

        if (selectedPlayers.some(p => p.PLAYER_ID === player.PLAYER_ID)) {
            alert('This player is already in your team!');
            return;
        }

        setSelectedPlayers([...selectedPlayers, player]);
    };

    const handlePlayerRemove = (playerId) => {
        setSelectedPlayers(selectedPlayers.filter(p => p.PLAYER_ID !== playerId));
    };

    return (
        <div className="my-team-container">
            <h1>My Team</h1>
            
            {/* Selected Players Section */}
            <div className="selected-players">
                <h2>Selected Players ({selectedPlayers.length}/5)</h2>
                <div className="selected-players-list">
                    {selectedPlayers.map(player => (
                        <div key={player.PLAYER_ID} className="selected-player-card">
                            <PlayerCard playerId={player.PLAYER_ID} />
                            <button 
                                onClick={() => handlePlayerRemove(player.PLAYER_ID)}
                                className="remove-player-btn"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Player Selection Section */}
            <div className="player-selection">
                <h2>Available Players</h2>
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search players..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="players-list">
                    {filteredPlayers.map(player => (
                        <div 
                            key={player.PLAYER_ID}
                            onContextMenu={e => {
                                e.preventDefault();
                                handlePlayerSelect(player);
                            }}
                        >
                            <PlayerCard playerId={player.PLAYER_ID} />
                            <button 
                                className="add-player-btn"
                                disabled={selectedPlayers.some(p => p.PLAYER_ID === player.PLAYER_ID)}
                                onClick={() => handlePlayerSelect(player)}
                            >
                                {selectedPlayers.some(p => p.PLAYER_ID === player.PLAYER_ID) 
                                    ? 'Selected' 
                                    : 'Add to Team'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MyTeam;
