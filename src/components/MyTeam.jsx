import React, { useState } from 'react';
import backgroundImg from '../assets/background.png';

const MyTeam = ({ selectedPlayers, onRemovePlayer, onPlayerClick }) => {
  // Example positions on the court (you can adjust these)
  const courtPositions = [
    { top: '80%', left: '30%', label: 'Guard' },
    { top: '80%', left: '70%', label: 'Guard' },
    { top: '40%', left: '30%', label: 'Forward' },
    { top: '40%', left: '70%', label: 'Forward' },
    { top: '20%', left: '50%', label: 'Center' },
  ];

  const formations = {
    "1-2-2" : {Guard: 1, Forward: 2, Center: 2},
    "2-1-2" : {Guard: 2, Forward: 1, Center: 2},
    "2-2-1" : {Guard: 2, Forward: 2, Center: 1},
    "1-3-1" : {Guard: 1, Forward: 3, Center: 1},
  }

  const [selectedFormation, setSelectedFormation] = useState('2-2-1');

  const addPlayerToTeam = (player) => {
    setTeam((prevTeam) => {
      // Find valid positions the player can play
      const availablePositions = Object.keys(formations[selectedFormation]).filter((pos) =>
        player.positions.includes(pos)
      );
  
      for (const pos of availablePositions) {
        if (prevTeam[pos].length < formations[selectedFormation][pos]) {
          return { ...prevTeam, [pos]: [...prevTeam[pos], player] };
        }
      }
      return prevTeam; // No changes if the team is full
    });
  };

  const removePlayerFromTeam = (playerId) => {
    setTeam((prevTeam) => {
      const newTeam = {};
      for (const pos in prevTeam) {
        newTeam[pos] = prevTeam[pos].filter((p) => p.id !== playerId);
      }
      return newTeam;
    });
  };
  
  const changeFormation = (newFormation) => {
    setSelectedFormation(newFormation);
    setTeam({ Guard: [], Forward: [], Center: [] }); // Reset team for now
  };
  


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
    {courtPositions.map((position) =>{
      const player = selectedPlayers[position.label];
      return(
        <div
        
        key = {position.label}
        //afisare statistici la click pe jucator
        onClick = {() => player && onPlayerClick(player) }
        //stergere jucator din teren la click dreapta
        onContextMenu={(e) => {
          e.preventDefault();
          if(player && onRemovePlayer) {
            onRemovePlayer(position.label)
          };}
        }
        style={{
              position: 'absolute',
              top: position.top,
              left: position.left,
              transform: 'translate(-50%, -50%)',
              backgroundColor: player ? 'rgba(255, 255, 255, 0.8)' : 'rgba(200, 200, 200, 0.5)',
              padding: '8px 16px',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              textAlign: 'center',
              cursor: player? 'pointer' : 'default',
            }}
        >
          {player ? player.player_name : 'Select a Player'}
          <div className='text-xs text-gray-600'>{position.label}</div>
        </div>
      )
    })}
    </div>
  );
};

export default MyTeam;