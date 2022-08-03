const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs');
const url = require('url');

const PORT = process.argv[2] || 8001;

app.use(cors());

app.get('/v4/history', (req, res, next) => {
  const { countryCode } = req.query;
  if (countryCode && fs.existsSync(`./public/v4/history_${countryCode}`)) {
    // we alter the URL to search for the specific history file if available
    res.redirect(`/v4/history_${countryCode}`);
  } else {
    next();
  }
});

app.get('/v5/history/:aggregate', (req, res, next) => {
  const { aggregate } = req.params;
  const { countryCode } = req.query;
  if (countryCode && fs.existsSync(`./public/v5/history/${countryCode}/${aggregate}.json`)) {
    // we alter the URL to use the specific zone history file if available
    res.redirect(`/v5/history/${countryCode}/${aggregate}`);
  } else {
    // otherwise fallback to general history files (that are using data from DE)
    next();
  }
});

app.use(function (req, res, next) {
  // Get rid of query parameters so we can serve static files
  if (Object.entries(req.query).length !== 0) {
    res.redirect(url.parse(req.url).pathname);
  } else {
    // Log all requests to static files
    console.log(req.method, req.path);
    next();
  }
});

app.use(express.static('public', { extensions: ['json'] }));

const server = app.listen(PORT, () => {
  console.log('Started mockserver on port: ' + PORT);
});
