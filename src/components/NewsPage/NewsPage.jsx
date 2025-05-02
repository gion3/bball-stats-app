import {useState, useEffect} from 'react';
import Tweet from '../Tweet/Tweet';
import './NewsPage.css';


const NewsPage = () => {

    const [tweets, setTweets] = useState([]);
    const [gameIds, setGameIds] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/api/teams/game/most-recent')
        .then(response => response.json())
        .then(data => setGameIds(data))
        .catch(error => console.error('Error fetching tweets:', error));
    }, []);

    return (
      <div>
        <h1>News Page</h1>
        
        {gameIds.map((gameId) => (
          <Tweet key={gameId.GAME_ID} gameId={gameId.GAME_ID}/>
        ))}
        {/* <Tweet gameId={22401217} onLoad={handleTweetLoaded}/>
        <Tweet gameId={22400919} onLoad={handleTweetLoaded}/>
        <Tweet gameId={22400823} onLoad={handleTweetLoaded}/> */}
      </div>
    );
}

export default NewsPage;
