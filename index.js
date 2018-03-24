const fs = require('fs')
const path = require('path')
const express = require('express')

const app = express()
const PORT = process.env.PORT||5000

app.set('port', PORT)

app.use('/lambda/:handler/:method',
  enableCORS,
  transformAwsEvent,
  function(req, res){
    // console.log(req.params, req.body, req.query)
    const {handler, method='run'} = req.params
    try{
      const lambda = require('./lambda/'+handler+'.js')
      lambda[method](req.awsEvent, {}, (err,ret)=>{
        if(err) throw Error(err)
        const {statusCode, headers, body} = ret
        res.status(statusCode||200)
        .set(Object.assign({
          'Access-Control-Allow-Origin': '*',
        }, headers))
        .json(typeof body=='string' ? JSON.parse(body) : body)
      })
    } catch(e){
      res.status(500).json({
        error: e.message
      })
    }
  }
)

app.use(express.static(__dirname+'/public'))
app.listen(PORT, ()=>console.log('listen', PORT))

function enableCORS(req, res, next){
  const origin = req.get('origin')||''
  res.set({
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS'
  })
  next()
}

function transformAwsEvent(req, res, next){
  req.awsEvent = {
    queryStringParameters: req.query
  }
  next()
}
