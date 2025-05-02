import { useEffect, useState } from "react";

const Tweet = ({gameId}) => {

    const [tweetText, setTweetText] = useState('');

    useEffect(() => {
        fetch(`http://localhost:5000/api/ai/get-tweet/${gameId}`)
            .then(response => response.json())
            .then(data => {
                if (data.reply) {
                    setTweetText(data.reply);
                } else if (data.error) {
                    setTweetText("AI is currently overloaded. Please try again later.");
                }
            })
            .catch(error => setTweetText("An error occurred while fetching the tweet."));
    }, [gameId]);
    
    return (
        <div>
            <h1>Tweet</h1>
            <p>{tweetText}</p>
        </div>
    );
}

export default Tweet;