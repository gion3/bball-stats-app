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
  const [players, setPlayers] = useState([]); // State for all players
  const [selectedPlayers, setSelectedPlayers] = useState([]); // State for selected players

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
    if (selectedPlayers.length < 5 && !selectedPlayers.includes(player)) {
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  return (
    <div>
      {user ? (
        <>
          <Header />
          <div className="flex justify-between items-center">
            <PlayerList players={players} onSelectPlayer={handleSelectPlayer} />
            <MyTeam selectedPlayers={selectedPlayers} />
            <OnClickStats />
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