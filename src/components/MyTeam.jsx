import React from 'react';
import backgroundImg from '../assets/background.png';

const MyTeam = ({ selectedPlayers }) => {
  // Example positions on the court (you can adjust these)
  const courtPositions = [
    { top: '10%', left: '50%', label: 'Point Guard' },
    { top: '30%', left: '20%', label: 'Shooting Guard' },
    { top: '30%', left: '80%', label: 'Small Forward' },
    { top: '50%', left: '35%', label: 'Power Forward' },
    { top: '50%', left: '65%', label: 'Center' },
  ];

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '100%',
        height: '700px',
        position: 'relative', // Required for absolute positioning of players
      }}
    >
      {/* Display selected players on the court */}
      {selectedPlayers.map((player, index) => (
        <div
          key={player.player_id}
          style={{
            position: 'absolute',
            top: courtPositions[index].top,
            left: courtPositions[index].left,
            transform: 'translate(-50%, -50%)', // Center the player at the position
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            padding: '8px 16px',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            textAlign: 'center',
          }}
        >
          {player.player_name}
          <div className="text-xs text-gray-600">{courtPositions[index].label}</div>
        </div>
      ))}
    </div>
  );
};

export default MyTeam;