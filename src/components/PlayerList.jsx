import React, {useState, useEffect} from 'react';
import SearchBar from './SearchBar';

const PlayerList = ({ onSelectPlayer }) => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
      fetch('http://localhost:3000/api/players')
          .then((response) => response.json())
          .then((data) => setPlayers(data))
          .catch((error) => console.error('Error fetching players:', error));
  }, []);

  return (
      <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Player List</h1>
          <SearchBar setPlayers={setPlayers} />
          <div className="max-h-150 overflow-y-auto">
              <ul>
                  {players.map((player) => (
                      <li
                          key={player.id}
                          className="mb-2 cursor-pointer hover:bg-gray-200 p-2 rounded"
                          onClick={() => onSelectPlayer(player)}
                      >
                          <span className="font-semibold">{player.full_name}</span> - {player.team_name} - {player.positions.join(', ')}
                      </li>
                  ))}
              </ul>
          </div>
      </div>
  );
};

export default PlayerList;