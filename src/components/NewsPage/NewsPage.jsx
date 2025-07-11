import {useState, useEffect} from 'react';
import Tweet from '../Tweet/Tweet';
import './NewsPage.css';


const NewsPage = () => {

    const [tweets, setTweets] = useState([]);
    const [gameIds, setGameIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setLoading(true);
        fetch('http://localhost:5000/api/teams/game/most-recent')
        .then(response => response.json())
        .then(data => setGameIds(data))
        .catch(error => setError("Failed to load news."))
        .finally(() => setLoading(false));
    }, []);

    return (
      <div>
        <div className="news-header">
          <h1>Latest NBA News</h1>
          <button onClick={() => window.location.reload()}>Refresh</button>
        </div>
        {loading ? (
          <div className="news-loading">Loading news...</div>
        ) : error ? (
          <div className="news-error">{error}</div>
        ) : gameIds.length === 0 ? (
          <div className="news-empty">No news available at the moment.</div>
        ) : (
          <div className="tweet-list">
            {gameIds.map((gameId) => (
              <Tweet key={gameId.GAME_ID} gameId={gameId.GAME_ID}/>
            ))}
          </div>
        )}
      </div>
    );
}

export default NewsPage;
