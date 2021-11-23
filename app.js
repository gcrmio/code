'use strict';
// Module Dependencies
// -------------------
var express     = require('express');
var bodyParser  = require('body-parser');
var errorhandler = require('errorhandler');
var http        = require('http');
var path        = require('path');
var request     = require('request');
var routes      = require('./routes');
var activity    = require('./routes/activity');
var cts         = require('./routes/contents');
const fileupload = require('express-fileupload');
var pgm         = require('./routes/pgdata');
var sendMMS     = require('./sendMMS');
var loadResult  = require('./loadResult');
var receiveResult = require('./receiveResult');
var setMMS = require('./routes/setmms');
var scheduledSetMMS = require('./scheduled-setMMS');
var scheduledSendMMS = require('./scheduled-sendMMS');
var app = express();
var ejs = require('ejs');
const {Pool, Client} = require('pg');

const pool = new Pool({
  host: process.env.PG_host,
  user: process.env.PG_user,
  password: process.env.PG_password,
  database: process.env.PG_database,
  port: process.env.PG_port,
  ssl: {
    rejectUnauthorized: false
  }
});

// Configure Express
app.set('port', process.env.PORT || 3000);
//app.use(bodyParser.json({type: 'application/json'})); 
//app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.raw({type: 'application/jwt'}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(fileupload());




//app.use(express.methodOverride());
//app.use(express.favicon());

app.use(express.static(path.join(__dirname, 'public')));

// Express in Development Mode
if ('development' == app.get('env')) {
  app.use(errorhandler());
}

// HubExchange Routes
app.get('/', routes.index );
//app.post('/login', routes.login );
//app.post('/logout', routes.logout );

// Custom Hello World Activity Routes
app.post('/journeybuilder/save/', activity.save );
app.post('/journeybuilder/validate/', activity.validate );
app.post('/journeybuilder/publish/', activity.publish );
app.post('/journeybuilder/execute/', activity.execute );


app.post('/contents/list', cts.getContentList);
app.post('/contents/items', cts.getContentItemList);
app.post('/contents/load', cts.getContentAsset);
app.post('/contents/file', cts.getContentBinaryBase64EncodedFile);
app.post('/contents/uploadImage', cts.uploadImage);
app.post('/contents/getUploadContentInfo', cts.getUploadContentInfo);


app.post('/message/getmsgid', pgm.getmsgid);
app.post('/message/uploadwork', pgm.uploadwork);

app.get('/setMMS', async (req, res) => {
  console.log("sendMsg=======================================");
  setMMS.setMMS();
  res.send('Set MMS Complete!');
})

//02. Send MMS
app.get('/sendMMS', (req, res) => {
  try {
      console.log("sendMsg=======================================");
      sendMMS.dbSelect();
      res.send('Send Msg Complete!');
  } catch (error) {
      console.log('There was an error!');
  }
})

app.set('view engine', 'ejs');
app.get('/scheduler', (req, result) => {
  var query = 'SELECT * FROM scheduler';
  pool.query(query, function(err, result){
    result.render('scheduler.ejs', {scheduler: result});
  })
})

// app.get('/scheduler01', (req, res) => {
//   scheduledSetMMS.getResult();
//   res.send('Scheduler01 Complete!');
// })

// app.get('/scheduler02', (req, res) => {
//   scheduledSendMMS.getResult();
//   res.send('Scheduler02 Complete!');
// })
//03. Receive Result
// app.get('/receiveResult', (req, res) => {
// console.log('Receive Result===============================');
// receiveResult.listSelect();
// res.send('Receive Result Complete!');
// })

//04. Load Result
// app.get('/loadResult', (req, res) => {
  // try {
    // console.log("updateDE=======================================");
    // loadResult.checkapi(req, res);
    // res.send('updateDE Complete!');
  // } catch (error) {
  //     console.log('There was an error!');
  // }
// })

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});