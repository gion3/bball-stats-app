import React from "react";
import backgroundImg from "../assets/background.png";

const MyTeam = ({ selectedPlayers, onRemovePlayer, onPlayerClick, selectedFormation }) => {
  // Define positions on the court with a maximum number of players per position
  const courtPositions = {
    Guards: [
      { top: "80%", left: "30%" },
      { top: "80%", left: "70%" },
    ],
    Forwards: [
      { top: "40%", left: "30%" },
      { top: "40%", left: "70%" },
      { top: "50%", left: "50%" },
    ],
    Centers: [{ top: "20%", left: "50%" }],
  };

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
      {Object.keys(courtPositions).map((position, posIndex) => {
        const players = selectedPlayers[position] || []; // Ensure fallback to empty array
        const maxPlayers = selectedFormation[posIndex]; // Match formation constraints

        return players.slice(0, maxPlayers).map((player, index) => {
          const pos = courtPositions[position][index]; // Get corresponding court position
          if (!pos) return null; // Ensure we don't exceed defined positions

          return (
            <div
              key={player.id}
              onClick={() => onPlayerClick(player)}
              onContextMenu={(e) => {
                e.preventDefault();
                onRemovePlayer(position, player.id);
              }}
              style={{
                position: "absolute",
                top: pos.top,
                left: pos.left,
                transform: "translate(-50%, -50%)",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                padding: "8px 16px",
                borderRadius: "4px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              {player.full_name}
              <div className="text-xs text-gray-600">{position.slice(0, -1)}</div>
            </div>
          );
        });
      })}
    </div>
  );
};

export default MyTeam;
