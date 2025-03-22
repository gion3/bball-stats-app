function OnClickStats({selectedPlayer}){
    return (
        <div>
        {selectedPlayer ? (
            <div className="p-4 border border-gray-300 rounded shadow-md justify-between items-center">
                <h2 className="text-lg font-bold"> {selectedPlayer.player_name} </h2>
                <p className="text-gray-600"> {selectedPlayer.player_position} </p>
            </div>
        ) : (
            <p className="text-gray-600"> Select a player to view stats. </p>
        )}
        </div>
    );
}
export default OnClickStats;