require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const playerRoutes = require('./routes/players');

const { GoogleGenerativeAI } = require('@google/generative-ai');

const api_key = process.env.API_KEY;

const ai = new GoogleGenerativeAI(api_key);
const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-001' });



app.use(cors());
app.use(express.json());

app.use('/api/players', playerRoutes);

app.post('/api/ask-ai', async (req, res) => {
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
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
