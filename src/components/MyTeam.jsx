import React from 'react';
import backgroundImg from '../assets/background.png';

const MyTeam = ({ selectedPlayers, onRemovePlayer, onPlayerClick }) => {
  // Example positions on the court (you can adjust these)
  const courtPositions = [
    { top: '80%', left: '30%', label: 'PG' },
    { top: '80%', left: '70%', label: 'SG' },
    { top: '40%', left: '30%', label: 'SF' },
    { top: '40%', left: '70%', label: 'PF' },
    { top: '20%', left: '50%', label: 'C' },
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