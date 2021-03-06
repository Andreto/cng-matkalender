const fs = require('fs');
const path = require('path');

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

const saveMenu = function(menu, requestObject) {
	fs.writeFileSync(
		path.join(__dirname, "../data/menu.json"), 
		JSON.stringify(menu, null, 2)
	);
	
	var updates = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/updates.json")));
	updates.menu = (new Date()).toISOString();
	fs.writeFileSync(path.join(__dirname, "../data/updates.json"), JSON.stringify(updates, null, 2));

	res = requestObject.res;
	req = requestObject.req;

	calReq(req.query, requestObject);
}

const calReq = function(q, requestObject) {
	const ICS = require(path.join(__dirname, '../scripts/icsWriter.js'));

	var meal = q.m || "a";
	var time = q.t || "1200";
	var duration = q.d || "45";

	var filename = meal + time + duration;
	var updates = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/updates.json")));

	console.log(requestObject);
	ICS.update(
		JSON.parse(fs.readFileSync(path.join(__dirname, "../data/menu.json"))),
		filename, 
		meal, 
		[parseInt(time.substring(0,2)), parseInt(time.substring(2))], 
		parseInt(duration),
		requestObject
	)
}

module.exports = {
  getMenu, saveMenu, calReq
}