import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import './Tweet.css';

const Tweet = ({gameId}) => {

    const [tweetText, setTweetText] = useState('');
    const [loading, setLoading] = useState(true);
    const [gameData, setGameData] = useState([]);

    useEffect(() => {
        setLoading(true);
        fetch(`http://localhost:5000/api/ai/get-tweet/${gameId}`)
            .then(response => response.json())
            .then(data => {
                if (data.reply) {
                    setTweetText(data.reply);
                }
                else {
                    setTweetText("Error loading tweet.");
                }
                setLoading(false);
                })
                .catch(() => {
                    setTweetText("Error loading tweet.");
                    setLoading(false);
                });
    }, [gameId]);

    useEffect(() => {
        fetch(`http://localhost:5000/api/teams/game/metadata/${gameId}`)
        .then(response => response.json())
        .then(data => setGameData(data))
        .catch(error => console.error('Error fetching game data:', error));
    },[]);
    
    return (
        <div className="tweet-container">
            <h1 className="tweet-title">
                {loading ? <Skeleton width={100} /> : gameData.MATCHUP}
            </h1>
            <p className="tweet-text">
                {loading ? <Skeleton count={2} /> : tweetText}
            </p>
            <p className="tweet-date">
                {loading ? <Skeleton width={100} /> : gameData.GAME_DATE}
            </p>
        </div>
    );
}

export default Tweet;