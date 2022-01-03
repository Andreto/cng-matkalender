// CNG MAT-KALENDER
//Andreas Törnkvist 2021

const rp = require('request-promise');
const express = require('express');
const schedule = require('node-schedule');
const fs = require('fs');
const path = require('path');

const PDFR = require('./scripts/pdfReader.js');
const MENU = require('./scripts/menuProcessing.js');

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
    MENU.saveMenu(menu);
    //ICS.update(menu);
}

// Finds pdf-url and starts the data-updating chain
function updateData() {
	console.log("🟢 UPDATING 📄 MENU DATA", (new Date()));
	rp("https://www.finspang.se/bergska/bergskagymnasiet/ovriga/matsedlarforgymnasieskolan/matsedelibildningen")
	.then(function(htmlText) {
		MENU.procHtmlMenu(htmlText);
	})
	.catch(function(err){
		console.error(err);
	});
}

app.get('/', (req, res) => {
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write("Server online");
	res.end();
});

app.get('/f', function(req, res){
	updateData();
	var filename = MENU.calReq(req.query);
	res.sendFile(filename, { root: path.join(__dirname, '/ics/') });
}); 

app.get('/data/:file', (req, res) => {
	var dPath = path.join(__dirname, "/data/") + req.params.file + ".json"
	if (fs.existsSync(dPath)) {
		fs.readFile(dPath, (err, json) => {
			let obj = JSON.parse(json, null, 2);
			res.json(obj);
		});
	} else {
		res.sendStatus(404);
	}
});

// app.listen(port, () => {
// 	console.log("🔵 SERVER STARTED");
// 	updateData();
// });

updateData();



