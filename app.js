// CNG MAT-KALENDER
//Andreas Törnkvist 2021

const rp = require('request-promise');
const express = require('express');
const schedule = require('node-schedule');

const PDFR = require('./pdfReader.js');
const MENU = require('./menuProcessing.js');
const ICS = require('./icsWriter.js');

const port = process.env.PORT || 3000

const app = express();

// Requests a pdf by URL and retreves menu information
async function menuRequest(url) {
    var buffer = await PDFR.bufferize(url);
    var lines = await PDFR.readlines(buffer);
    lines = await JSON.parse(JSON.stringify(lines));
    lines = lines[0];
    for (let i = 0; i < lines.length; i++) {
      lines[i] = lines[i].join();
    }
    var menu = MENU.getMenu(lines); // Turns the pdf-lines into a json object
    ICS.update(menu);
}

// Finds pdf-url and starts the data-updating chain
function updateData() {
  console.log('\x1b[34m%s\x1b[0m', "UPDATING MENU DATA", (new Date()))
  rp("https://www.cng.se/")
  .then(function(html){
    el = html.substring(0,html.search("MATSEDEL"));
    el = el.substring(el.lastIndexOf("href")+6, el.lastIndexOf("?"));
    console.log("PDF-URL:", el);
    menuRequest(el)
  })
  .catch(function(err){
    console.err(err);
  });
}

app.use('/ics', express.static('ics'));

app.get('/', (req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('Server online');
  res.end();
});

app.listen(port, () => {
  console.log('\x1b[34m%s\x1b[0m','SERVER STARTED');
  updateData();
  const job = schedule.scheduleJob({minute: 0}, function(){
    updateData();
  });
});



