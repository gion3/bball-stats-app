import React, { useEffect, useState } from 'react';
import {useNavigate} from 'react-router-dom';
import "./PlayerCard.css"

const PlayerCard = ({playerId}) => {
  const navigate = useNavigate();
  const [player, setPlayer] = useState([]);

  useEffect(() => {
        if (!playerId) return;

        fetch(`http://localhost:5000/api/players/${playerId}`)
            .then((response) => response.json())
            .then((data) => {
                const mutations = {
                    id: data.PLAYER_ID,
                    team_id: data.TEAM_ID,
                    name: data.PLAYER_NAME,
                    age: data.AGE,
                    team_name: data.TEAM_NAME,
                    total_pts: data.PTS,
                    total_ast: data.AST,
                    total_reb: data.REB,
                    ppg: (data.PTS / 82).toFixed(2),
                    apg: (data.AST / 82).toFixed(2),
                    rpg: (data.REB / 82).toFixed(2),
                    color1: data.COLOR1,
                    color2: data.COLOR2,
                }
                setPlayer(mutations)
            })
            .catch((error) => console.error('Error fetching player:', error));
    }, [playerId]);

    const handleClick = () =>{
        navigate(`/players/${player.id}`);
    }

    const cardStyle = {
        background: `linear-gradient(135deg, ${player.color1} 70%, ${player.color2})`
    }
  return (
    <div className='player-card' style={cardStyle} onClick={handleClick}>
        <div className='player-header'>
            <img
                src={`/player_headshots/${player.id}.png`}
                className='player-image'
            />
            <h2 className='player-name'>{player.name}</h2>
            <p className='player-team'>{player.team_name}</p>
        </div>
        <div className='player-details'>
            <p><strong>Age: {player.age}</strong></p>
            <div className='player-stats'>
                <div className='stat'>
                    <span className='label'>PPG: </span>
                    <span className='value'>{player.ppg}</span>
                </div>
                <div className='stat'>
                    <span className='label'>RPG: </span>
                    <span className='value'>{player.rpg}</span>
                </div>
                <div className='stat'>
                    <span className='label'>APG: </span>
                    <span className='value'>{player.apg}</span>
                </div>
            </div>
        </div>
    </div>
  );
};

export default PlayerCard;
