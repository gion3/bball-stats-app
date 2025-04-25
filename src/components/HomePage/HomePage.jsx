import { useEffect, useState } from "react";
import PlayerCard from "../PlayerCard/PlayerCard";
import PlayerCarousel from "../PlayerCarousel/PlayerCarousel";
import React from 'react';


const HomePage = () =>{
    const [top10PlayerIds,setTop10PlayerIds] = useState([]);
  
  useEffect(() => {
    fetch('http://localhost:5000/api/players/top10')
    .then(response => response.json())
    .then((data) => {
      const ids = data.map(player => player.PLAYER_ID);
      setTop10PlayerIds(ids)
  })
    .catch(error => {
    console.error('Error fetching top 10 player IDs:', error);
  });
  }, []);

  return (
    <>
    <div className="flex justify-between items-start content-around p-4">
        <PlayerCard playerId={2544}/>
    </div>
    <h1>League leaders</h1>
    <PlayerCarousel playerIds={top10PlayerIds} />
    </>
  );
}

export default HomePage;