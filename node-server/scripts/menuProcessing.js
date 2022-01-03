const fs = require('fs');
const path = require('path');
const HTMLParser = require('node-html-parser');

const procHtmlMenu = function(htmlText) {
	html = HTMLParser.parse(htmlText);
	var menuElem = html.querySelector('#Kopia1avText1').nextSibling
	var menu = {"und": []};
	var currentWeek = "und"
	for (let i = 0; i < menuElem.childNodes.length; i++) {
			node = menuElem.childNodes[i];
		if (node.tagName == 'H2') {
			currentWeek = node.rawText.replace("Vecka ", "")
			menu[currentWeek] = []
		} else {
			p = node.innerHTML.split("<br>");
			day = p.shift().replace(/<[^>]*>/g, "").replace(":", "").trim();
			menu[currentWeek][day] = p;
		}
	}
	console.log(menu);
}

const getMenu = function (pdfInp) {
	var dayIDs = ["Mån", "Tis", "Ons", "Tor", "Fre"];
	var remItems = ["Veckans Meny", "GlutenfrittVeganskt", "Laktosfritt", "Fläskfritt", "Vegetariskt", " C ", "V"];

	//["Måndag:", "Tisdag:", "Onsdag:", "Torsdag:", "Fredag:", " C " ];
	var menu = {
		"W" : 0,
		"Mån": {"meal": [], "veg": []}, 
		"Tis": {"meal": [], "veg": []},
		"Ons": {"meal": [], "veg": []},
		"Tor": {"meal": [], "veg": []},
		"Fre": {"meal": [], "veg": []}
	}

	let lines = []

	for (let i = 0; i < pdfInp.length; i++) {
		if (!remItems.includes(pdfInp[i])) {
			if (pdfInp[i].includes("Vecka")) {
				menu.W = parseInt(pdfInp[i].replace("Vecka ", ""));
			} else {
				lines.push(pdfInp[i]);
			}
		}
	}

	console.log("Colected", lines.length, "lines of data.")

	let day = 0;
	for (let i = 0; i < lines.length; i++) {
		if (lines[i].includes(dayIDs[day])) {
			i++;
			while (i < lines.length && !lines[i].includes(dayIDs[day+1])) {
				if (lines[i].includes("Veg")) {
				menu[dayIDs[day]].veg.push(lines[i]);
				} else {
				menu[dayIDs[day]].meal.push(lines[i]);
				}
				i++;
			}
			day++;
			i-=1;

			if (day == 5) {
				i = lines.length;
			}
		}
	}
	return(menu);
}

const saveMenu = function(menu) {
	fs.writeFileSync(
		path.join(__dirname, "../data/menu.json"), 
		JSON.stringify(menu, null, 2)
	);
	
	var updates = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/updates.json")));
	updates.menu = (new Date()).toISOString();
	fs.writeFileSync(path.join(__dirname, "../data/updates.json"), JSON.stringify(updates, null, 2));
}

const calReq = function(q) {
	const ICS = require(path.join(__dirname, '../scripts/icsWriter.js'));

	var meal = q.m || "a";
	var time = q.t || "1200";
	var duration = q.d || "45";

	var filename = meal + time + duration;
	var updates = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/updates.json")));

	if (updates.hasOwnProperty(filename)) {
		mDate = new Date(updates.menu);
		iDate = new Date(updates[filename]);
		if (mDate > iDate) {
		ICS.update(
			JSON.parse(fs.readFileSync(path.join(__dirname, "../data/menu.json"))),
			filename, 
			meal, 
			[parseInt(time.substring(0,2)), parseInt(time.substring(2))], 
			parseInt(duration)
		)
		} else {
			console.log("⚪", filename)
		}
	} else {
		ICS.update(
		JSON.parse(fs.readFileSync(path.join(__dirname, "../data/menu.json"))),
		filename, 
		meal, 
		[parseInt(time.substring(0,2)), parseInt(time.substring(2))], 
		parseInt(duration)
		)
	}
	return(filename + ".ics");

}

module.exports = {
  	procHtmlMenu, getMenu, saveMenu, calReq
}