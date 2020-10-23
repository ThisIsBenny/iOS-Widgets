// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: microscope;
// Version 1.0.0

/**************
Credits:
  - drewkerr@GitHub (https://github.com/drewkerr/scriptable) for the diagram idea
**************/

// How many minutes should the cache be valid
const cacheMinutes = 60 * 2;
const population = 646000;

// Show days in graph based on widget size
const daysInGraph = (config.widgetFamily === 'small')? 14 : 28;
const graphWidh = (config.widgetFamily === 'small')? 400 : 800;

////////////////////////////////////////////////////////////////////////////////
let backColor; //Widget background color
let backColor2; //Widget background color
let textColor; //Widget text color
let textWarningColor; //Widget warning text color
let graphColor;

if (Device.isUsingDarkAppearance()) {
  backColor = '111111';
  backColor2 = '222222';
  textColor = 'EDEDED';
  textWarningColor = 'CB4335';
  graphColor = 'EDEDED';
} else {
  backColor = '1A5276';
  backColor2 = '1F618D';
  textColor = 'EDEDED';
  textWarningColor = 'CB4335';
  graphColor = 'EDEDED';
}

var today = new Date();

// Set up the file manager.
const files = FileManager.local()

const path = files.joinPath(files.documentsDirectory(), "widget-covid")

const cacheExists = files.fileExists(path)
const cacheDate = cacheExists ? files.modificationDate(path) : 0

function columnGraph(data, width, height, colour) {
  let max = Math.max(...data)
  let context = new DrawContext()
  context.size = new Size(width, height)
  context.opaque = false
  context.setFillColor(colour)
  data.forEach((value, index) => {
    let w = width / (2 * data.length - 1)
    let h = value / max * height
    let x = width - (index * 2 + 1) * w
    let y = height - h
    let rect = new Rect(x, y, w, h)
    context.fillRect(rect)
  })
  return context
}

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
  let idx = diff / population * 100000;
  let idxBefore = diffBefore / population * 100000;
  
  let graph = [];
  for (let i = 0; i < daysInGraph; i++) {  
    let diff = data[data.length - 1 - i][4] - data[data.length - 8 - i][4];
    graph.push((diff / population * 100000).toFixed(0))
  }
  
  return {index: idx.toFixed(0), growing: (idx > idxBefore ? true : false), date: (data[data.length - 1][0]).replace('2020', ''), graph};
}

let data = await getCovidSevenDayIndex()

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
  
let covidText = widget.addText(`${(data.growing ? "⬈" : "⬊")} ${+data.index}`)
covidText.font = Font.regularSystemFont(50)
covidText.textColor = data.index < 50 ? new Color(textColor) : (new Color(textWarningColor));
covidText.centerAlignText()

widget.addSpacer()

let image = columnGraph(data["graph"], graphWidh, 50, new Color(graphColor)).getImage()
let graph = widget.addImage(image)
graph.centerAlignImage()

widget.addSpacer(5)

let dateText = widget.addText(`Stand: ${data.date}`)
dateText.font = Font.mediumSystemFont(8)
dateText.textColor = new Color(textColor)


if(!config.runsInWidget) {
  await widget.presentSmall()
} else {
  // Tell the system to show the widget.
  Script.setWidget(widget)
  Script.complete()
}
