const express = require('express');
const bodyParser = require('body-parser');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
const port = 3000;

// In-memory store for URL mappings
const urlDatabase = {};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(express.json())

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle form submission
app.post('/shorten', (req, res) => {
    // console.log(req.body);
  const originalUrl = req.body.longUrl;
//   console.log(originalUrl);
  const shortId = nanoid(6); // Generates a 6-character short ID

  urlDatabase[shortId] = originalUrl;
//   console.log(urlDatabase);

//   const shortUrl = `${req.protocol}://${req.get('host')}/${shortId}`;
  const shortUrl = `${req.protocol}://${req.headers.host}/${shortId}`;
res.json({ shortUrl });

//   res.send(`<p>Shortened URL: <a href="${shortUrl}">${shortUrl}</a></p><a href="/">Shorten another</a>`);
res.json({shortUrl});
});

// Redirect short URL
app.get('/:shortId', (req, res) => {
  const originalUrl = urlDatabase[req.params.shortId];
//   console.log(req.params.shortId);
//   console.log(urlDatabase)
//   console.log(originalUrl)
  if (originalUrl) {
    if(originalUrl.includes('http') ||   originalUrl.includes('https'))
    {
        res.redirect(originalUrl)
    }
    else{

    
    res.redirect(`https://${originalUrl}`);
    }
  } else {
    res.status(404).send('URL not found');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
