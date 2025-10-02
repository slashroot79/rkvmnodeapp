
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 4000;
const logFile = path.join(__dirname, 'requests.log');


app.use((req, res, next) => {
  const start = Date.now();
  const requestLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    body: req.body || {}
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logEntry = {
      ...requestLog,
      statusCode: res.statusCode,
      responseTimeMs: duration
    };
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  });

  next();
});

app.get('', (req, res) => {
  res.json({ message: 'VM root url' });
});

app.get('/vmfast', (req, res) => {
  res.json({ message: 'Fast response from VM!' });
});

app.get('/vmslow', async (req, res, next) => {
  try {
    await new Promise(r => setTimeout(r, 300000)); // 250s
    res.json({ message: 'VM response after 300s!' });
  } catch (err) {
    next(err); 
  }
});


app.use((err, req, res, next) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    error: err.message,
    stack: err.stack
  };
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.listen(port,'0.0.0.0', () => {
  console.log(`VM API server running on port ${port}`);
});
