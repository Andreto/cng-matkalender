function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }
    document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function() {
        console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
        console.error('Async: Could not copy text: ', err);
    });
}

function msgDisplay(type, msg) {
    //Create Element
    var msgCon = document.createElement("div");
    msgCon.classList.add("message-container", type, "show");
    var id = "msg" + (Math.floor(Math.random() * 100000)).toString();
    msgCon.id = id;
    msgCon.stackOffset = 0;
    var msgDiv = document.createElement("div");
    msgDiv.classList.add("message");
    msgDiv.innerHTML = msg;
    msgCon.appendChild(msgDiv);
    msgCon.addEventListener("animationend", function(){this.remove();});

    //Append element
    document.body.appendChild(msgCon);

    //Stack getElementsByClassName
    var cards = document.getElementsByClassName("message-container");
    if (cards.length > 0){
      for (i = 0; i < cards.length; i++) {
        if (cards[i].id != id){
          extraOffset = document.getElementById(id).offsetHeight + 10;
          cards[i].style.transform = "translateY(-" + (cards[i].stackOffset + extraOffset) + "px)";
          cards[i].stackOffset = cards[i].stackOffset + extraOffset;
        }
      }
    }
}

function genUrl() {
    var reg = document.getElementById("reg-check").checked;
    var veg = document.getElementById("veg-check").checked;
    var time = document.getElementById("start-hour").value + document.getElementById("start-min").value;
    var dur = document.getElementById("start-dur").value;
    var m = ""

    if (reg && veg) {
        m = "a";
    } else if (reg) {
        m = "r"
    } else if (veg) {
        m = "v"
    }

    if (m != "") {
        icsLinkPath = "?m=" + m + "&t=" + time + "&d=" + dur;
        document.getElementById("link-display").innerText = icsLinkBase + icsLinkPath;
    } else {
        document.getElementById("link-display").innerText = icsLinkBase
        msgDisplay("warn", "Välj minst en kategori av rätter")
    }
}

function formatNumInput(elem) {
    console.log(elem.id, elem.value % elem.step, parseInt(elem.value) > parseInt(elem.max));
    if (parseInt(elem.value) > parseInt(elem.max)) {
        elem.value = elem.max; 
    }
    if (parseInt(elem.value) % parseInt(elem.step) != 0) {
        elem.value = parseInt(elem.value) - (parseInt(elem.value) % parseInt(elem.step));
    }
    if (elem.value.length < 2) {
        elem.value = "0" + elem.value;
    }

}

var icsLinkBase = "https://cng-mat.herokuapp.com/f";
var icsLinkPath = "?m=a&t=1200&d=45"

document.getElementById("copy-button").addEventListener("click", function(){
    copyTextToClipboard(icsLinkBase + icsLinkPath);
    msgDisplay("info", "Länken är kopierad.")
});
document.getElementById("reg-check").addEventListener("change", function(){genUrl()});
document.getElementById("veg-check").addEventListener("change", function(){genUrl()});
document.getElementById("start-hour").addEventListener("change", function(){formatNumInput(this);genUrl();});
document.getElementById("start-min").addEventListener("change", function(){formatNumInput(this);genUrl();});
document.getElementById("start-dur").addEventListener("change", function(){formatNumInput(this);genUrl();});