import { useEffect, useState } from 'react';
import { Scatter } from 'react-chartjs-2';
import 'chart.js/auto';

function ShotChart({ playerId }) {
  const [shots, setShots] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/players/shots/${playerId}`)
      .then(res => res.json())
      .then(data => setShots(data));
  }, [playerId]);

  const data = {
    datasets: [
      {
        label: 'Missed',
        data: shots.filter(s => s.SHOT_MADE_FLAG === 0).map(s => ({ x: s.LOC_X, y: s.LOC_Y })),
        backgroundColor: 'red'
      },
      {
        label: 'Made',
        data: shots.filter(s => s.SHOT_MADE_FLAG === 1).map(s => ({ x: s.LOC_X, y: s.LOC_Y })),
        backgroundColor: 'green'
      }
    ]
  };

  const options = {
    scales: {
      x: { min: -250, max: 250 },
      y: { min: -50, max: 350 }
    }
  };

  return <Scatter data={data} options={options} />;
}

export default ShotChart;
