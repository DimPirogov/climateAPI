const PORT = process.env.PORT || 8000;
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const appExpress = express();


const newspapers = [
  {
    name: 'thetimes',
    address: 'https://www.thetimes.com/environment/climate-change',
    base: 'https://www.thetimes.com'
  },
  {
    name: 'guardian',
    address: 'https://www.theguardian.com/environment/climate-crisis',
    base: 'https://www.theguardian.com'
  },
  {
    name: 'telegraph',
    address: 'https://www.telegraph.co.uk/climate-change/',
    base: 'https://www.telegraph.co.uk'
  }
]

interface Article {
  title: string;
  url: string;
  source: string;
}

const articles: Article[] = [];

newspapers.forEach(newspaper => {
  axios.get(newspaper.address)
    .then (response => {
      const html = response.data
      const $ = cheerio.load(html)

      $('a:contains("climate")', html).each(function () {
        const title = $(this).text()
        const url = $(this).attr('href')

        articles.push({
          title,
          url: newspaper.base + url,
          source: newspaper.name
        })
      })
    })
})

appExpress.get('/', (req, res) => {
  res.json('Welcome to my climate change news API')
})

appExpress.get('/news', (req, res) => {
  res.json(articles)
})

appExpress.get('/news/:newspaperId', (req, res) => {
  const newspaperId = req.params.newspaperId
  const newspaperAddress = newspapers
    .filter(newspaper => newspaper.name == newspaperId)[0].address
  const newspaperBase = newspapers.filter(
    newspaper => newspaper.name == newspaperId)[0].base

  axios.get(newspaperAddress)
  .then(response => {
    const html = response.data
    const $ = cheerio.load(html)
    const specificArticles: Article [] = []

    $('a:contains("climate")', html).each(function() {
      const title = $(this).text()
      const url = $(this).attr('href')
      specificArticles.push({
        title,
        url: newspaperBase + url,
        source: newspaperId
      })
    })
    res.json(specificArticles)
  }).catch(err => console.log(err))
})


appExpress.listen(PORT, () => console.log(`Climate API running on PORT ${PORT}`));

module.exports = appExpress;
