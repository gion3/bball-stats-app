import React from 'react';
import PlayerCard from '../PlayerCard/PlayerCard';
import './PlayerCarousel.css';

const PlayerCarousel = ({ playerIds }) => {
  const scrollLeft = () => {
    document.getElementById('carousel').scrollLeft -= 400;
  };

  const scrollRight = () => {
    document.getElementById('carousel').scrollLeft += 400;
  };

  return (
    <div className="carousel-container">
      <button className="scroll-button left" onClick={scrollLeft}>{'<'}</button>
      
      <div className="carousel" id="carousel">
        {playerIds.map(id => (
          <PlayerCard key={id} playerId={id} />
        ))}
      </div>

      <button className="scroll-button right" onClick={scrollRight}>{'>'}</button>
    </div>
  );
};

export default PlayerCarousel;
