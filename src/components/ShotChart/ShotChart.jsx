import { useEffect, useState } from 'react';
import { Scatter } from 'react-chartjs-2';
import halfcourtImg from '../../assets/halfcourt.png'
import 'chart.js/auto';

function ShotChart({ player, totalSeasonStats }) {
  const [shots, setShots] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/players/shots/${player.id}`)
      .then(res => res.json())
      .then(data => setShots(data));
  }, [player.id]);

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

  function getShotDistanceInMeters(x, y) {
  const distanceInPixels = Math.sqrt(x * x + y * y);
  const pixelToMeter = 0.028;
  const distanceInMeters = distanceInPixels * pixelToMeter;
  return distanceInMeters.toFixed(2);
  }


  const config = {
    data: data,
    options: {
      plugins:{
        tooltip:{
          callbacks:{
            label: function(context){
              const shotX = context.parsed.x;
              const shotY = context.parsed.y;
              const distance = getShotDistanceInMeters(shotX,shotY);
              if(distance > 6.20){
                return `Distance: ${distance} metres, 3PT%: ${totalSeasonStats.threePct}`;
              }
              return `Distance: ${distance} metres, FG%: ${totalSeasonStats.fgPct}`;
              
            }
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      scales:{
        x: {
          min: -250,
          max: 250,
          display: false,
          grid: {
            display: false,
          }
        },
        y: {
          min: -50,
          max: 350,
          display: false,
          grid: {
            display: false,
          }
        }
      }
    }
  }

  return (
      <div
        style={{
        width: '1200px',
        height: '800px',
        backgroundImage: `url(${halfcourtImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
       //padding: '20px',
      }}
      >
        <Scatter data={config.data}  options={config.options}/>
      </div>
  );
}

export default ShotChart;
