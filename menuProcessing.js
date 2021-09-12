const getMenu = function (pdfInp) {
  var dayIDs = ["Mån", "Tis", "Ons", "Tor", "Fre"];
  var remItems = ["Veckans Meny", "GlutenfrittVeganskt", "Laktosfritt", "Fläskfritt", "Vegetariskt", " C ", "V"];

//["Måndag:", "Tisdag:", "Onsdag:", "Torsdag:", "Fredag:", " C " ];
  var menu = {
    "W" : 0,
    "Mån": {"meal": [], "veg": 0}, 
    "Tis": {"meal": [], "veg": 0},
    "Ons": {"meal": [], "veg": 0},
    "Tor": {"meal": [], "veg": 0},
    "Fre": {"meal": [], "veg": 0}
  }

  let vecka = 0;
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
          menu[dayIDs[day]].veg = lines[i];
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

module.exports = {
  getMenu
}