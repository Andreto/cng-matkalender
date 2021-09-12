const { writeFileSync } = require('fs');
const ics = require('ics');
const wn = require('weeknumber');

const update = function (menu) {
  var dayIDs = ["Mån", "Tis", "Ons", "Tor", "Fre"];
  var icsObj = [];

  var d = new Date();
  d.setDate(d.getDate() + (7-d.getDay()) + 7*(menu.W - wn.weekNumber(d) - 1) );

  for (let i = 0; i < 5; i++) {
    d.setDate(d.getDate() + 1);

    let event = {
      "title": "Lunch Bildingen",
      "start": [d.getFullYear(), d.getMonth()+1, d.getDate(), 10, 0],
      "duration": { minutes: 45 },
      "description": menu[dayIDs[i]].meal.join(" \n")
    };

    icsObj.push(event);
  }

  writeFileSync("./ics/cal.ics", ics.createEvents(icsObj).value);
  console.log("Updated ics files.")
}

module.exports = {
  update
}