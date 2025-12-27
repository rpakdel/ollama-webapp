
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://host.docker.internal:11434';

app.use(cors());
app.use(express.json());

// Serve static React files
app.use(express.static(path.join(__dirname, 'dist')));

// Proxy for fetching models
app.get('/api/models', async (req, res) => {
  try {
    const response = await axios.get(`${OLLAMA_URL}/api/tags`);
    res.json(response.data);
  } catch (error) {
    console.error('Ollama connect error:', error.message);
    res.status(500).json({ error: 'Could not connect to Ollama service' });
  }
});

// Proxy for chat (supports streaming)
app.post('/api/chat', async (req, res) => {
  const { model, messages, stream } = req.body;
  
  try {
    const response = await axios({
      method: 'post',
      url: `${OLLAMA_URL}/api/chat`,
      data: { model, messages, stream: stream !== false },
      responseType: stream ? 'stream' : 'json'
    });

    if (stream) {
      // Essential headers for real-time streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering for Nginx if used
      
      response.data.pipe(res);
    } else {
      res.json(response.data);
    }
  } catch (error) {
    console.error('Ollama chat error:', error.message);
    res.status(500).json({ error: 'Ollama interaction failed' });
  }
});

// Fallback to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`Targeting Ollama at ${OLLAMA_URL}`);
});
