// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: microscope;
// How many minutes should the cache be valid
let cacheMinutes = 60 * 2;

////////////////////////////////////////////////////////////////////////////////
let backColor; //Widget background color
let backColor2; //Widget background color
let textColor; //Widget text color
let textWarningColor; //Widget warning text color

var today = new Date();

// Set up the file manager.
const files = FileManager.local()

const path = files.joinPath(files.documentsDirectory(), "widget-covid")

const cacheExists = files.fileExists(path)
const cacheDate = cacheExists ? files.modificationDate(path) : 0


async function fetchCovidData() {
  let csv;
  if (cacheExists && (today.getTime() - cacheDate.getTime()) < (cacheMinutes * 60 * 1000)) {
    console.log("Get Covid Data from Cache")
    csv = files.readString(path)
  } else {
    console.log("Get Covid Data")
    let req = new Request('https://raw.githubusercontent.com/opendataddorf/od-resources/master/COVID_Duesseldorf.csv');
    csv = await req.loadString();
    files.writeString(path, csv) 
  }

  return csv.trim().split("\r\n").map(function(row){return row.split(",");});
}

async function getCovidSevenDayIndex() {
  let data = await fetchCovidData();
  let diff = data[data.length - 1][4] - data[data.length - 8][4];
  let diffBefore = data[data.length - 2][4] - data[data.length - 9][4];
  let idx = diff / 646000 * 100000;
  let idxBefore = diffBefore / 646000 * 100000;
  return {index: idx.toFixed(0), indexBefore: idxBefore.toFixed(0), growing: (idx > idxBefore ? true : false), date: (data[data.length - 1][0]).replace('2020', '')};
}

let covidIndex = await getCovidSevenDayIndex()
console.log(covidIndex)


if (Device.isUsingDarkAppearance()) {
  backColor = '111111';
  backColor2 = '222222';
  textColor = 'EDEDED';
  textWarningColor = 'CB4335';
} else {
  backColor = '1A5276';
  backColor2 = '1F618D';
  textColor = 'EDEDED';
  textWarningColor = 'CB4335';
}

// Create Widget
let widget = new ListWidget();

widget.setPadding(10, 10, 10, 10)

const gradient = new LinearGradient()
gradient.locations = [0, 1]
gradient.colors = [
  new Color(backColor),
  new Color(backColor2)
]
widget.backgroundGradient = gradient


let provider = widget.addText("🦠 7-Tage-Inzidenz")
provider.font = Font.mediumSystemFont(12)
provider.textColor = new Color(textColor)

widget.addSpacer()


  
let covidText = widget.addText(`${(covidIndex.growing ? "⬈" : "⬊")} ${+covidIndex.index}`)
covidText.font = Font.regularSystemFont(50)
covidText.textColor = covidIndex.index < 50 ? new Color(textColor) : (new Color(textWarningColor));
covidText.centerAlignText()

widget.addSpacer()

let dateText = widget.addText(`Stand: ${covidIndex.date}`)
dateText.font = Font.mediumSystemFont(12)
dateText.textColor = new Color(textColor)


if(!config.runsInWidget) {
  await widget.presentSmall()
} else {
  // Tell the system to show the widget.
  Script.setWidget(widget)
  Script.complete()
}
