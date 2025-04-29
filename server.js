require('dotenv').config
const express = require('express');
const bodyParser = require('body-parser');
const { nanoid } = require('nanoid');
const path = require('path');
const connectDB = require('./db');
const Url = require('./models/Url');
const { validateUrl,isValidUrl } = require('./utilities');

const app = express();
const port = process.env.PORT || 3000;

// Connect to Database
connectDB();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(express.json());

// Serve frontend pages
// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Analytics Page
app.get('/analytic', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'analytic.html'));
});

// APIs for Handling form submission and More
app.post('/shorten', async (req, res) => {
  try {
    let originalUrl = req.body.longUrl.trim();
    
    // Validate URL
    // const validation = await validateUrl(originalUrl);
    const validation=isValidUrl(originalUrl);

    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }
    
    originalUrl = validation.normalizedUrl;
    let shortId;
    if (req.body.customId) {
      shortId = req.body.customId;
      // Check if custom ID already exists
      const exists = await Url.findOne({ shortId });
      if (exists) {
        return res.status(400).json({ error: 'Custom ID already in use' });
      }
     
    } else {
      shortId = nanoid(6);
    }


    // Check if URL already exists in DB
    let url = await Url.findOne({ originalUrl });

    if (url) {
      return res.json({ shortUrl: `${req.protocol}://${req.headers.host}/${url.shortId}` });
    }

    // Create new URL entry
    url = new Url({
      originalUrl,
      shortId,
    });

    await url.save();

    const shortUrl = `${req.protocol}://${req.headers.host}/${shortId}`;
    res.json({ shortUrl });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Redirect short URL
app.get('/:shortId', async (req, res) => {
  try {
    const url = await Url.findOneAndUpdate(
      { shortId: req.params.shortId },
      { $inc: { clicks: 1 } },
      { new: true }
    );

    if (url) {
      if (url.originalUrl.includes('http') || url.originalUrl.includes('https')) {
        return res.redirect(url.originalUrl);
      }
      return res.redirect(`https://${url.originalUrl}`);
    }

    res.status(404).send('URL not found');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/analytics/:shortId', async (req, res) => {
  try {
    const url = await Url.findOne({ shortId: req.params.shortId });
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }
    res.json({
      originalUrl: url.originalUrl,
      shortUrl: `${req.protocol}://${req.headers.host}/${url.shortId}`,
      clicks: url.clicks,
      createdAt: url.createdAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});