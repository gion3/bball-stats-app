import React, { useEffect, useState } from 'react';
import {useParams} from 'react-router-dom';
import { useReactTable,getCoreRowModel,flexRender } from '@tanstack/react-table';
import "./PlayerPage.css";

const PlayerPage = () =>{
    const {playerId} = useParams();

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

    const columns = [
    { header: 'Name', accessorKey: 'name' },
    { header: 'Age', accessorKey: 'age' },
    { header: 'Team', accessorKey: 'team_name' },
    { header: 'Points', accessorKey: 'ppg' },
    { header: 'Assists', accessorKey: 'apg' },
    { header: 'Rebounds', accessorKey: 'rpg' },
    ];

    const table = useReactTable({
        data: player ? [player] : [], //change this when we add per-game stats
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    console.log(player)

    return (
    <div>
      <h1>Player Stats</h1>
      <table>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PlayerPage;