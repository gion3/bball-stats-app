import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import "./PlayerPage.css";
import ShotChart from '../ShotChart/ShotChart';
import ShotHeatMap from '../ShotHeatMap/ShotHeatMap';

const PlayerPage = () => {
    const { playerId } = useParams();
    const [player, setPlayer] = useState([]);
    const [stats, setStats] = useState([]);
    const [pageIndex, setPageIndex] = useState(0);
    const pageSize = 10;

    const columns = useMemo(() => [
        { accessorKey: 'GAME_DATE', header: 'Game Date' },
        { accessorKey: 'MATCHUP', header: 'Matchup' },
        { accessorKey: 'WL', header: 'WL' , cell: row =>{
            const value = row.getValue();
            return <span className={value === 'W' ? 'win' : 'loss'}>{value}</span>
        }},
        { accessorKey: 'MIN', header: 'Minutes' },
        { accessorKey: 'FGM', header: 'FGM' },
        { accessorKey: 'FGA', header: 'FGA' },
        { accessorKey: 'FG_PCT', header: 'FG%', cell: row => ((row.getValue() * 100).toFixed(1)) },
        { accessorKey: 'FG3M', header: '3PM' },
        { accessorKey: 'FG3A', header: '3PA' },
        { accessorKey: 'FG3_PCT', header: '3P%' ,cell: row => ((row.getValue() * 100).toFixed(1))},
        { accessorKey: 'FTM', header: 'FTM' },
        { accessorKey: 'FTA', header: 'FTA' },
        { accessorKey: 'FT_PCT', header: 'FT%' ,cell: row => ((row.getValue() * 100).toFixed(1))},
        { accessorKey: 'OREB', header: 'OREB' },
        { accessorKey: 'DREB', header: 'DREB' },
        { accessorKey: 'REB', header: 'REB' },
        { accessorKey: 'AST', header: 'AST' },
        { accessorKey: 'STL', header: 'STL' },
        { accessorKey: 'BLK', header: 'BLK' },
        { accessorKey: 'TOV', header: 'TOV' },
        { accessorKey: 'PF', header: 'PF' },
        { accessorKey: 'PTS', header: 'PTS' },
        { accessorKey: 'PLUS_MINUS', header: '+/-' }
    ], []);

    // functie paginare
    const paginatedStats = useMemo(
        () => stats.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize),
        [stats, pageIndex, pageSize]
    );

    const table = useReactTable({
        data: paginatedStats,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: Math.ceil(stats.length / pageSize),
        state: { pagination: { pageIndex, pageSize } }
    });

    useEffect(() => {
        if (!playerId) return;
        fetch(`http://localhost:5000/api/players/stats/${playerId}`)
            .then((response) => response.json())
            .then((data) => setStats(data))
            .catch((error) => console.error('Error fetching stats for player:', error));
    }, [playerId]);

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
                    ppg: (data.PTS / 82).toFixed(1),
                    apg: (data.AST / 82).toFixed(1),
                    rpg: (data.REB / 82).toFixed(1),
                    color1: data.COLOR1,
                    color2: data.COLOR2,
                }
                setPlayer(mutations)
            })
            .catch((error) => console.error('Error fetching player:', error));
    }, [playerId]);

    const header_background_style = {
        background: `${player.color1}`
    }

    const team_name_color = {
        color: `${player.color2}`
    }

    //calculare footer tabel
    const totalSeasonStats = stats.reduce((acc,player) => {
        acc.points += player.PTS || 0;
        acc.rebounds += player.REB || 0;
        acc.assists += player.AST || 0;
        acc.fgMade += player.FGM || 0;
        acc.fgAtt += player.FGA || 0;
        acc.threePtMade += player.FG3M || 0;
        acc.threePtAtt += player.FG3A || 0;
        return acc;
    }, {
        points: 0,
        rebounds: 0,
        assists: 0,
        fgMade: 0,
        fgAtt: 0,
        threePtMade: 0,
        threePtAtt: 0,
    });

    totalSeasonStats.fgPct = totalSeasonStats.fgAtt ? (totalSeasonStats.fgMade / totalSeasonStats.fgAtt * 100).toFixed(1) : 0.0;
    totalSeasonStats.threePct = totalSeasonStats.threePtAtt ? (totalSeasonStats.threePtMade / totalSeasonStats.threePtAtt * 100).toFixed(1) : 0.0;

    return (
        <div>
            <div className='player-page-header' style={header_background_style}>
                <img className='player-headshot' src={`/player_headshots/${player.id}.png`} alt={player.name} />
                <div className='player-header-info'>
                    <div className='player-header-name'>{player.name}</div>
                    <div className='player-header-team-name' style={team_name_color}>{player.team_name}</div>
                </div>
                <div className='player-header-averages'>
                    <div className='stat-label'>PPG</div>
                    <div className='stat-label'>APG</div>
                    <div className='stat-label'>RPG</div>
                    <div className='stat-value'>{player.ppg}</div>
                    <div className='stat-value'>{player.apg}</div>
                    <div className='stat-value'>{player.rpg}</div>
                </div>
                <img className='team-logo' src={`/team_logos/${player.team_id}.png`} alt={player.team_name} />
                
            </div>
            <h2> {player.name} Game-by-Game</h2>
            <div className='table-wrapper'>
                <div className="pagination-controls">
                    <button onClick={() => setPageIndex(old => Math.max(old - 1, 0))} disabled={pageIndex === 0}>
                        Previous
                    </button>
                    <span>Page {pageIndex + 1} of {Math.ceil(stats.length / pageSize)}</span>
                    <button onClick={() => setPageIndex(old => Math.min(old + 1, Math.ceil(stats.length / pageSize) - 1))}
                            disabled={pageIndex >= Math.ceil(stats.length / pageSize) - 1}>
                        Next
                    </button>
                </div>
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
                                        {flexRender(cell.column.columnDef.cell ?? cell.column.columnDef.header, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            {table.getFlatHeaders().map(header => {
                            const columnId = header.column.id;

                            let footerValue = '';
                            switch (columnId) {
                                case 'GAME_DATE':
                                footerValue = 'Totals: ';
                                break;
                                case 'PTS':
                                footerValue = totalSeasonStats.points;
                                break;
                                case 'REB':
                                footerValue = totalSeasonStats.rebounds;
                                break;
                                case 'AST':
                                footerValue = totalSeasonStats.assists;
                                break;
                                case 'FG_PCT':
                                footerValue = `${totalSeasonStats.fgPct}%`;
                                break;
                                case 'FG3_PCT':
                                footerValue = `${totalSeasonStats.threePct}%`;
                                break;
                                default:
                                footerValue = ''; 
                            }

                            return <td key={header.id}><strong>{footerValue}</strong></td>;
                            })}
                        </tr>
                    </tfoot>
                </table>
                <h2> {player.name} Shot Chart</h2>
                <div className='chart-container'>
                    <div className='chart-box'>
                        <ShotChart player={player} totalSeasonStats={totalSeasonStats}/>
                    </div>
            </div>
            </div>
        </div>
    );
};

export default PlayerPage;