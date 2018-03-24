const cheerio = require('cheerio')
const got = require('got')
const urlUtil = require('url')

module.exports.run = (event, context, callback) => {
  const response = json => ({
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(json)
  })

  const {
    queryStringParameters:query={}
  } = event

  fetchUrlInfo(query.url||'')
  .then(json=>callback(null, response(json)))
  .catch(err=>callback(null, response({error: err})))
}

function fetchUrlInfo (url) {
  return new Promise((resolve, reject) => {
    got(url)
      .then(response => {
        const {url: base='' } = response
        const $ = cheerio.load(response.body)
        const title = $('title').text()
        const favicon = $('link[rel="icon"], link[rel="shortcut icon"], link[rel="Shortcut Icon"]').last().attr('href') || ''
        const desc = $('meta[name="description"]').attr('content') || ''
        resolve({
          url,
          title,
          desc,
          favicon: urlUtil.resolve(base, favicon),
          // favourite: false,
        // url: urlUtil.resolve(base, url)
        })
      })
      .catch(err => {
        console.log(err)
        reject(err)
      })
  })
}

