import { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import Login from "./Login";
import Register from "./Register";
import Header from "./Header";
import PlayerList from "./PlayerList";
import MyTeam from "./MyTeam";
import OnClickStats from "./OnClickStats";

function App() {
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedPlayerForStats, setSelectedPlayerForStats] = useState(null);
  const [players, setPlayers] = useState([]); // State for all players
  const [selectedPlayers, setSelectedPlayers] = useState({
    PG: null,
    SG: null,
    SF: null,
    PF: null,
    C: null,
  }); // State for selected players

  const handlePlayerClick = (player) => {
    setSelectedPlayerForStats(player);
  };

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch players from the backend
  useEffect(() => {
    if (user) {
      fetch('http://localhost:3000/api/players')
        .then((response) => response.json())
        .then((data) => setPlayers(data))
        .catch((error) => console.error('Error fetching players:', error));
    }
  }, [user]);

  // Handle player selection
  const handleSelectPlayer = (player) => {
    const position = player.player_position;
    setSelectedPlayers((prev) => ({
      ...prev,
      [position]: player,
    }))
  };

  const handleRemovePlayer = (position) => {
    setSelectedPlayers((prev) => {
      const updatedPlayers = { ...prev, [position]: null };

      // If the removed player is currently displayed in OnClickStats, clear it
      if (selectedPlayerForStats && selectedPlayerForStats.player_position === position) {
        setSelectedPlayerForStats(null);
      }
  
      return updatedPlayers;
    });
  }

  return (
    <div>
      {user ? (
        <>
          <Header />
          <div className="flex justify-between items-center">
            <PlayerList players={players} onSelectPlayer={handleSelectPlayer}/>
            <MyTeam selectedPlayers={selectedPlayers} onRemovePlayer={handleRemovePlayer} onPlayerClick = {handlePlayerClick}/>
            <OnClickStats selectedPlayer={selectedPlayerForStats}/>
          </div>
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