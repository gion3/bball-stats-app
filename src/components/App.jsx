import { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import Login from "./Login";
import Register from "./Register";
import Header from "./Header";
import PlayerCard from "./PlayerCard/PlayerCard";
import PlayerCarousel from "./PlayerCarousel/PlayerCarousel";
import PlayerList from "./PlayerList";
import OnClickStats from "./OnClickStats";
import React from 'react';
import backgroundImg from '../assets/background.png';



function App() {
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const [selectedPlayerForStats, setSelectedPlayerForStats] = useState(null);

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


  

  const handlePlayerClick = (player) => {
    setSelectedPlayerForStats(player);
  };

  const handleSelectPlayer = (selectedPlayer) => {
    console.log("Selecting player:", selectedPlayer.full_name); // Debugging
  
  };
  

  return (
    <div>
      {user ? (
        <>
          <Header />
          <div className="flex justify-between items-start content-around p-4">
            <PlayerCard playerId={2544}/>
            <OnClickStats selectedPlayer={selectedPlayerForStats} />
          </div>
          <h1>League leaders</h1>
          <PlayerCarousel playerIds={top10PlayerIds} />
          <h1>Welcome, {user.email}</h1>
        </>
      ) : (
        <>
          {isRegistering ? <Register /> : <Login />}
          <button onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? "Already have an account? Login" : "Don't have an account? Register"}
          </button>
        </>
      )}
    </div>
  );
}

export default App;