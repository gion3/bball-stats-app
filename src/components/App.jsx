import { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import Login from "./Login";
import Register from "./Register";
import Header from "./Header";
import PlayerList from "./PlayerList";
import MyTeam from "./MyTeam";
import OnClickStats from "./OnClickStats";
import React from 'react';
import backgroundImg from '../assets/background.png';

const formations = {
  "1-2-2": { Guard: 1, Forward: 2, Center: 2 },
  "2-1-2": { Guard: 2, Forward: 1, Center: 2 },
  "2-2-1": { Guard: 2, Forward: 2, Center: 1 },
  "1-3-1": { Guard: 1, Forward: 3, Center: 1 },
};

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

  const [team, setTeam] = useState({
    Guards: [],
    Forwards: [],
    Centers: [],
    Formation: [2,2,1]
  });

  const FORMATIONS = {
    "2-2-1": [2, 2, 1],
    "1-3-1": [1, 3, 1],
    "1-2-2": [1, 2, 2],
    "3-1-1": [3,1,1],
  };
  

  const handlePlayerClick = (player) => {
    setSelectedPlayerForStats(player);
  };

  const handleSelectPlayer = (selectedPlayer) => {
    console.log("Selecting player:", selectedPlayer.full_name); // Debugging
  
    setTeam((prevTeam) => {
      console.log("Previous team state:", prevTeam); // Debugging
  
      const isPlayerAlreadyInTeam =
        prevTeam.Guards.some((player) => player.id === selectedPlayer.id) ||
        prevTeam.Forwards.some((player) => player.id === selectedPlayer.id) ||
        prevTeam.Centers.some((player) => player.id === selectedPlayer.id);
  
      if (isPlayerAlreadyInTeam) {
        console.log("Player already in team!"); // Debugging
        return prevTeam; // No change
      }
  
      let newTeam = { 
        Guards: [...prevTeam.Guards], 
        Forwards: [...prevTeam.Forwards], 
        Centers: [...prevTeam.Centers], 
        Formation: [...prevTeam.Formation] 
      };
  
      for (const pos of selectedPlayer.positions || []) {
        if (pos === "Guard" && newTeam.Formation[0] > 0) {
          console.log("Adding player to Guards");
          return {
            ...newTeam,
            Guards: [...newTeam.Guards, selectedPlayer],
            Formation: [newTeam.Formation[0] - 1, newTeam.Formation[1], newTeam.Formation[2]],
          };
        }
        if (pos === "Forward" && newTeam.Formation[1] > 0) {
          console.log("Adding player to Forwards");
          return {
            ...newTeam,
            Forwards: [...newTeam.Forwards, selectedPlayer],
            Formation: [newTeam.Formation[0], newTeam.Formation[1] - 1, newTeam.Formation[2]],
          };
        }
        if (pos === "Center" && newTeam.Formation[2] > 0) {
          console.log("Adding player to Centers");
          return {
            ...newTeam,
            Centers: [...newTeam.Centers, selectedPlayer],
            Formation: [newTeam.Formation[0], newTeam.Formation[1], newTeam.Formation[2] - 1],
          };
        }
      }
  
      console.log("No available spots for this player!");
      return prevTeam;
    });
  };
  
  
  const handleRemovePlayer = (position, playerId) => {
    setTeam((prevTeam) => {
      let updatedTeam = { ...prevTeam };
      let formationIndex;
  
      // Determine which position we are modifying
      switch (position) {
        case "Guards":
          updatedTeam.Guards = prevTeam.Guards.filter((player) => player.id !== playerId);
          formationIndex = 0;
          break;
        case "Forwards":
          updatedTeam.Forwards = prevTeam.Forwards.filter((player) => player.id !== playerId);
          formationIndex = 1;
          break;
        case "Centers":
          updatedTeam.Centers = prevTeam.Centers.filter((player) => player.id !== playerId);
          formationIndex = 2;
          break;
        default:
          return prevTeam; // Return unchanged team if position is invalid
      }
  
      // Increment the respective Formation index to reflect an open slot
      updatedTeam.Formation[formationIndex] += 1;
  
      // If the removed player was displayed in OnClickStats, clear it
      if (selectedPlayerForStats && selectedPlayerForStats.id === playerId) {
        setSelectedPlayerForStats(null);
      }
  
      return updatedTeam;
    });
  };
  

  const handleFormationChange = (formationName) => {
    // Echipa se reseteaza la schimbarea formatiei
    if (!window.confirm("Changing formation will clear your team. Continue?")) {
      return;
    }
    console.log("handleFormationChange called with params: " + formationName);
    setTeam({
      Formation: [...FORMATIONS[formationName]],
      Guards: [],
      Forwards: [],
      Centers: []
    });
    console.log(team)
  };

  return (
    <div>
      {user ? (
        <>
          <Header />
          <div className="flex justify-between items-start content-around p-4">
            <PlayerList onSelectPlayer={handleSelectPlayer} />
            <MyTeam
              selectedPlayers={team}
              onRemovePlayer={handleRemovePlayer}
              onPlayerClick={handlePlayerClick}
              selectedFormation={[2,2,1]}
              formations={FORMATIONS}
              onFormationChange={handleFormationChange}
            />
            <OnClickStats selectedPlayer={selectedPlayerForStats} />
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