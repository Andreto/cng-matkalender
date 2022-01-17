const { writeFileSync } = require('fs');
const ics = require('ics');
const wn = require('weeknumber');
const fs = require('fs');
const path = require('path');

const timeAdj = 1; //Time adjustment; Time from the ics module should be local but for some reason it does not line up

const update = function (menu, filename, meal, time, duration, requestObject) {
	var dayIDs = ["Mån", "Tis", "Ons", "Tor", "Fre"];
	var icsObj = [];

	var d = new Date();
	d.setDate(d.getDate() + (7-d.getDay()) + 7*(menu.W - wn.weekNumber(d) - 1) );

	for (let i = 0; i < 5; i++) {
		d.setDate(d.getDate() + 1);

		let event = {
			"title": "Lunch Bildingen",
			"start": [d.getFullYear(), d.getMonth()+1, d.getDate(), time[0]-timeAdj, time[1]],
			"duration": { minutes: duration },
			"description" : ""
		};

		let reg = menu[dayIDs[i]].meal.join(" \n");
		let veg = menu[dayIDs[i]].veg.join(" \n");

		if (meal == "a") {
			event.description = reg;
			if (veg.length != 0) {
				event.description += "\n" + veg;
			}
		} else if (meal == "r") {
			event.description = reg;
		} else if (meal == "v") {
			if (veg.length != 0) {
				event.description = veg;
			} else {
				event.description = menu[dayIDs[i]].meal.join(" (Ej Veg)\n") + " (Ej Veg)";
			}
		}

		icsObj.push(event);
	}

	requestObject.res.setHeader('Content-type', 'text/calendar');
	requestObject.res.write(ics.createEvents(icsObj).value);
	requestObject.res.end()

	//writeFileSync(path.join(__dirname, "../ics/") + filename + ".ics", ics.createEvents(icsObj).value);

	var updates = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/updates.json")));
	updates[filename] = (new Date()).toISOString();
	fs.writeFileSync(path.join(__dirname, "../data/updates.json"), JSON.stringify(updates, null, 2));

	console.log("🟢 UPDATING 📆", filename, (new Date()));
}

module.exports = {
  update
}