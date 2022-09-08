const path = require('path')
const express = require('express')
const http = require('http')
const dotenv = require('dotenv').config()
const {defaults, post} = require('axios')
const hbs = require('hbs')
const {response} = require('express');

//console.log(__dirname)
console.log(path.join(__dirname, '../public'))

const app = express()
const webport = process.env.WEB_PORT
const options = {
  headers: {"content-type": "application/json"}}
defaults.baseURL = process.env.APPSERVER


//Defiing Paths
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

  post('/sleep', JSON.stringify(req.body), options)
      .then(function(res) {
        console.log('Status: ', res.status)
        console.log('Response:', res.data)
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

app.post('/test',  (req, res) => {
    console.log('Received:', req.body)

  res.render('review', {
    date: req.body.date,
    bed_time: req.body.bed_time,
    sleep_time: req.body.sleep_time,
    awake_time: req.body.awake_time
  })

  //need to send this data to the app-server for processing on a specific pors
    const request = http.get('http://localhost:3000/test', (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('close', () => {
        console.log('Retrieved all data');
        console.log(JSON.parse(data));
      });
    })

  })


app.get('*', (req, res) => {
  res.render('404', {
    title: '404 Not Found',
    message: "Sorry the page you're looking for doesn't exist"
  })
})

//start the server
app.listen(webport, ()=> {
  console.log(`Server is running on port http://localhost:${webport}`)
})