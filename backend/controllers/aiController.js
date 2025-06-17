const { GoogleGenerativeAI } = require('@google/generative-ai');

const api_key = process.env.API_KEY;

const ai = new GoogleGenerativeAI(api_key);
const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-001' });

const getAiResponse = async (req, res) => {
    const { message } = req.body;
  
    if (!message) {
      return res.status(400).json({ error: 'No message provided' });
    }
  
    try {
      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: message }]
          }
        ]
      });
  
      const responseText = result.response.text();
      console.log('AI response:', responseText);
  
      res.json({ reply: responseText });
    } catch (error) {
      console.error('Error communicating with AI:', error);
      res.status(500).json({ error: error.message });
    }
};

const getTweet = async (req, res) => {
    const {gameId} = req.params;

    const prompt = `You are one of the most famous NBA journalists on the internet and you write the best tweets. 
    Your job is to write short, tweet-like texts that can summarize a whole NBA game in 2-3 sentences maximum, 
    just by looking at the boxscore. Your tweets should be engaging, but semi-professional also. 
    Don't be scared to create storylines from the magic of just reading the boxscore! 
    Make sure to include the final score in your tweet. Make sure to double check the final score by looking the game up online. 
    Here is the current game's boxscore in JSON format:`

    const teams_score = await fetch(`http://localhost:5000/api/teams/game/${gameId}/final-score`)
        .then(response => response.json())
        .then(data => data)
        .catch(error => console.error(error));

    const team1_name = teams_score[0].MATCHUP.split(' ')[0];
    const team1_score_str = teams_score[0].total_points;
    const team2_name = teams_score[1].MATCHUP.split(' ')[0];
    const team2_score_str = teams_score[1].total_points;

    const boxscore = await fetch(`http://localhost:5000/api/teams/game/${gameId}`)
        .then(response => response.json())
        .then(data => data)
        .catch(error => console.error(error));

    const boxscoreStr = JSON.stringify(boxscore, null,2);

    const finalScoreText = `The final score of the game was: ${team1_name}: ${team1_score_str} - ${team2_name}: ${team2_score_str}`;
    const ai_input = prompt + boxscoreStr + finalScoreText;

    try {
        const result = await model.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [{ text: ai_input }]
                }
            ]
        });
        
    const responseText = result.response.text();
  
    res.json({ reply: responseText });
    } catch (error) {
      console.error('Error communicating with AI:', error);
      res.status(500).json({ error: error.message });
    }
}


module.exports = { getAiResponse, getTweet };