const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
var multer = require('multer');
var url = require('url');
var ip = require("ip");
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./db/myDB.db');

/*let sql = `SELECT * FROM victims`;

db.all(sql, [], (err, rows) => {
  if (err) {
    throw err;
  }
  rows.forEach((row) => {
    console.log(row.time + " " + row.url);
  });
});*/





const forms = multer();
const app = express();
const port = process.env.PORT || 3000;

app.use('/demo', express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(forms.array()); 
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(request, response){

  db.all("SELECT * FROM victims", function(err,rows,fields) {
  
      console.log(rows);
      console.log('This function will return a list of all stored items from database ' + rows);
      response.setHeader('Content-Type','application/json')
      response.send(JSON.stringify(rows));
  
  
  });
  });

app.post('/log-tracking', function(req, res) {
    console.log('**** Tracked. Now logging ****');
    let body = req.body;

    let startTime = body.start;
    let endTime = body.end;
    let trackInfo = body.msg;
    var requrl = url.format({
      protocol: req.protocol,
      host: req.get('host'),
      pathname: req.originalUrl,
  });


    let logMsg = '';

    let time = (endTime - startTime) / 1000;
    logMsg = `${time.toFixed(2)} seconds`;

    if (time > 60) {
        time = time / 60;
        logMsg = `${time.toFixed(2)} minutes`;
    }

    let currentDate =  new Date().toLocaleString();

    console.log('In Session for: ', logMsg);
    console.log('Time of the visit:', currentDate);
    console.log('Tracking info: ', trackInfo);
    console.log ( req.connection.remoteAddress
 );
    console.log("URL: "+ requrl); //getting the url

  db.run(`INSERT INTO victims(time, ip, url) VALUES(?,?,?)`, [currentDate,req.connection.remoteAddress
.toString(), requrl.toString()], function(err) {
  if (err) {
    return console.log(err.message);
  }
  console.log(`A row has been inserted with rowid ${this.lastID}`);
});

    
    
});





app.listen(port, () => {
  console.log(`User Tracking app listening at http://localhost:${port}`)
})
