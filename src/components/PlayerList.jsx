import React from 'react';

const PlayerList = ({ players, onSelectPlayer }) => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Player List</h1>
      <ul>
        {players.map((player) => (
          <li
            key={player.player_id}
            className="mb-2 cursor-pointer hover:bg-gray-200 p-2 rounded"
            onClick={() => onSelectPlayer(player)}
          >
            <span className="font-semibold">{player.player_name}</span> - {player.team_name} - {player.player_position}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayerList;