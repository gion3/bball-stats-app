import React from "react";
import backgroundImg from "../assets/background.png";

const MyTeam = ({ selectedPlayers, onRemovePlayer, onPlayerClick, selectedFormation, formations, onFormationChange }) => {
  // Define positions on the court with a maximum number of players per position
  const courtPositions = {
    Guards: [
      { top: "80%", left: "30%" },
      { top: "80%", left: "70%" },
    ],
    Forwards: [
      { top: "40%", left: "30%" },
      { top: "40%", left: "70%" },
    ],
    Centers: [{ top: "20%", left: "50%" }],
  };


  const handleFormationSelect = (event) => {
    onFormationChange(event.target.value);
  }


  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        width: "100%",
        height: "700px",
        position: "relative",
      }}
    >
      <div>
        <label htmlFor="formation-select">Choose formation:</label>
        <select
        id="formation-select"
        value={selectedFormation}
        onChange={handleFormationSelect}
        >
          {Object.keys(formations).map((formation) => (
            <option key={formation} value={formation}>
              {formation}
            </option>
          ))}
        </select>
      </div>
      {Object.keys(courtPositions).map((position, posIndex) => {
        const players = selectedPlayers[position] || []; // Get players in this position
        const maxPlayers = selectedFormation[posIndex]; // Formation constraints

        return courtPositions[position].slice(0, maxPlayers).map((pos, index) => {
          const player = players[index]; // Get player for this spot (if exists)

          return (
            <div
              key={`${position}-${index}`}
              onClick={() => player && onPlayerClick(player)}
              onContextMenu={(e) => {
                e.preventDefault();
                if (player) onRemovePlayer(position, player.id);
              }}
              style={{
                position: "absolute",
                top: pos.top,
                left: pos.left,
                transform: "translate(-50%, -50%)",
                backgroundColor: player ? "rgba(255, 255, 255, 0.8)" : "rgba(200, 200, 200, 0.6)",
                padding: "8px 16px",
                borderRadius: "4px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                textAlign: "center",
                cursor: player ? "pointer" : "default",
              }}
            >
              {player ? (
                <>
                  {player.full_name}
                  <div className="text-xs text-gray-600">{position.slice(0, -1)}</div>
                </>
              ) : (
                <span style={{ color: "gray", fontSize: "12px" }}>
                  {position.slice(0, -1)} {index + 1}
                </span>
              )}
            </div>
          );
        });
      })}
    </div>
  );
};

export default MyTeam;