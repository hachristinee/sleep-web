const path = require('path')
const express = require('express')
const http = require('http')
const dotenv = require('dotenv').config()
const {defaults, post} = require('axios')
const hbs = require('hbs')
const bunyan = require('bunyan');
const {LoggingBunyan} = require('@google-cloud/logging-bunyan');



//console.log(__dirname)
console.log(path.join(__dirname, '../public'))
const now = new Date()
const app = express()
const webport = process.env.WEB_PORT
const options = {
  headers: {"content-type": "application/json"}}
defaults.baseURL = process.env.APPSERVER

console.log('Initialising Logger - Production environment detected')
const loggingBunyan = new LoggingBunyan();
// Create a Bunyan logger that streams to Cloud Logging
// Logs will be written to: "projects/YOUR_PROJECT_ID/logs/bunyan_log"
const logger = bunyan.createLogger({
  // The JSON payload of the log as it appears in Cloud Logging
  // will contain "name": "my-service"
  name: 'web-server',
  streams: [
    // Log to the console at 'info' and above
    {stream: process.stdout, level: 'info'},
    // And log to Cloud Logging, logging at 'info' and above
    loggingBunyan.stream('info'),
  ],
})

//Defining Paths
const viewPath = path.join(__dirname, './templates/views') //if you used a different name for view folder
const partialsPath = path.join(__dirname, './templates/partials')

//Setup Handlebars + views  location.
app.set('view engine', 'hbs')
app.set('views', viewPath)
hbs.registerPartials(partialsPath)

//Setup static directory to serve)
app.use(express.static(path.join(__dirname,'../public'))) //takes the path to the folder we want to serve up
app.use(express.urlencoded({extended: true}))

app.get('/', (req, res) => {
  res.render('home', {
    title: 'Weather',
    name: 'Christine Le'
  })
  console.log('GET / => Returned to home page ')
})

app.get('/sleep',  (req, res) => {
  console.log('GET /sleep')
  logger.info('GET /sleep')
  res.render('log', {
  })
})

app.post('/sleep',  (req, res) => {
  console.log('Received:', req.body)

  res.render('review', {
    date: req.body.date,
    bed_time: req.body.bed_time,
    sleep_time: req.body.sleep_time,
    awake_time: req.body.awake_time
  })

  logger.info({body:req.body})

  post('/sleep', JSON.stringify(req.body), options)
      .then(function(res) {
        console.log('Status: ', res.status)
        console.log('Response:', res.data)
        logger.info({status:res.status})
      })
      .catch(function (error) {
        if (error.response){
          console.log('Status:', error.response.status)
          console.log('Response:', error.response.data)
          //console.log(error.response.headers)
        } else if (error.request) {
          console.log('Error Request:',error.request)
        } else {
          console.log('Error, error/message');
        }
       //console.log('Error config:',error.config)
      })
})

app.get('/ping', (req, res) => {
  res.json({ message: 'Successfully pinged this page'}
  )
})



app.get('*', (req, res) => {
  res.render('404', {
    title: '404 Not Found',
    message: "Sorry the page you're looking for doesn't exist"
  })
  //logger.error('Page does not exist')
  console.log(now, 'Page not found')
})

//start the server
app.listen(webport, ()=> {
  console.log(now, `Server is running on port http://localhost:${webport}`)
  logger.info('Server is running on port http://localhost:%s', webport)
})