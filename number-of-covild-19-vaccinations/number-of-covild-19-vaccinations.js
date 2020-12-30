// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: syringe;

/**************
Version 1.0.1

Changelog:
  v1.0.1:
          - fix sorting issue

/**************/

////////////////////////////////////////////////////////////////////////////////
//////////////////////////         User-Config         /////////////////////////
////////////////////////////////////////////////////////////////////////////////

// How many minutes should the cache be valid
const cacheMinutes = 6 * 60

////////////////////////////////////////////////////////////////////////////////
//////////////////////////         Dev Settings         ////////////////////////
////////////////////////////////////////////////////////////////////////////////

const debug = true
config.widgetFamily = config.widgetFamily || 'large'

////////////////////////////////////////////////////////////////////////////////
//////////////////////////         System Settings         /////////////////////
////////////////////////////////////////////////////////////////////////////////

let widgetInputRAW = args.widgetParameter;
let selectedState

if (widgetInputRAW !== null) {
  if (/^Baden-Württemberg|Bayern|Berlin|Brandenburg|Bremen|Hamburg|Hessen|Mecklenburg-Vorpommern|Niedersachsen|Nordrhein-Westfalen|Rheinland-Pfalz|Saarland|Sachsen|Sachsen-Anhalt|Schleswig-Holstein|Thüringen$/.test(widgetInputRAW.toString().trim()) === false) {
     throw new Error('Kein gültiges Bundesland. Bitte prüfen Sie die Eingabe.') 
  }
  selectedState = widgetInputRAW.toString()
}

const fontSize = 9
const fontSize2 = 12
const spacing = 5

const width = 100
const h = 9

const thresholds = {  
  amber: 59,
  green: 79
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function creatProgress(percentage) {
  const context = new DrawContext()
  context.size = new Size(width, h)
  context.opaque = false
  context.respectScreenScale = true
  
  // Background Path
  context.setFillColor(Color.gray())
  const path = new Path()
  path.addRect(new Rect(0, 0, width, h))
  context.addPath(path)
  context.fillPath()
  
  // Progress Path
  let color
  if (percentage > thresholds.green) {
    color = Color.green()
  } else if (percentage > thresholds.amber) {
    color = Color.orange()
  } else {
    color = Color.red()
  }
  
  context.setFillColor(color)  
  const path1 = new Path()
  const path1width = (width * (percentage / 100) > width) ? width : width * (percentage / 100)
  path1.addRect(new Rect(0, 0, path1width, h))
  context.addPath(path1)
  context.fillPath()
  
  return context.getImage()
}

function getDiagram(percentage) {
  function drawArc(ctr, rad, w, deg) {
    bgx = ctr.x - rad
    bgy = ctr.y - rad
    bgd = 2 * rad
    bgr = new Rect(bgx, bgy, bgd, bgd)
  
  
    let color
    if (percentage > thresholds.green) {
      color = Color.green()
    } else if (percentage > thresholds.amber) {
      color = Color.orange()
    } else {
      color = Color.red()
    }
    canvas.setFillColor(color)
    canvas.setStrokeColor(Color.gray())
    canvas.setLineWidth(w)
    canvas.strokeEllipse(bgr)
  
    for (t = 0; t < deg; t++) {
      rect_x = ctr.x + rad * sinDeg(t) - w / 2
      rect_y = ctr.y - rad * cosDeg(t) - w / 2
      rect_r = new Rect(rect_x, rect_y, w, w)
      canvas.fillEllipse(rect_r)
    }
  }
  function sinDeg(deg) {
    return Math.sin((deg * Math.PI) / 180)
  }
  
  function cosDeg(deg) {
    return Math.cos((deg * Math.PI) / 180)
  }
  const canvas = new DrawContext()
  const canvSize = 200
  const canvTextSize = 36
  
  const canvWidth = 10
  const canvRadius = 80
  
  canvas.opaque = false  
  canvas.size = new Size(canvSize, canvSize)
  canvas.respectScreenScale = true
    
  drawArc(
    new Point(canvSize / 2, canvSize / 2),
    canvRadius,
    canvWidth,
    Math.floor(percentage * 3.6)
  )

  const canvTextRect = new Rect(
    0,
    100 - canvTextSize / 2,
    canvSize,
    canvTextSize
  )
  canvas.setTextAlignedCenter()
  canvas.setTextColor(Color.dynamic(Color.black(), Color.white()))
  canvas.setFont(Font.boldSystemFont(canvTextSize))
  canvas.drawTextInRect(`${percentage}%`, canvTextRect)

  return canvas.getImage()
}

var today = new Date()

// Set up the file manager.
const files = FileManager.local()

// Set up cache
const cachePath = files.joinPath(files.cacheDirectory(), "widget-vaccination-" + config.widgetFamily)
const cacheExists = files.fileExists(cachePath)
const cacheDate = cacheExists ? files.modificationDate(cachePath) : 0

// Get Data
let result
let lastUpdate
try {
  // If cache exists and it's been less than 30 minutes since last request, use cached data.
  if (cacheExists && (today.getTime() - cacheDate.getTime()) < (cacheMinutes * 60 * 1000)) {
    console.log("Get from Cache")
    result = JSON.parse(files.readString(cachePath))
    lastUpdate = cacheDate
  } else {
    console.log("Get from API") 
     const req = new Request('https://rki-vaccination-data.vercel.app/api')
    result = await req.loadJSON()
    lastUpdate = today
    console.log("Write Data to Cache")
    try {
      files.writeString(cachePath, JSON.stringify(result))
    } catch (e) {
      console.log("Creating Cache failed!")
      console.log(e)
    }
  }
} catch (e) {
  console.error(e)
  if (cacheExists) {
    console.log("Get from Cache")
    result = JSON.parse(files.readString(cachePath))
    lastUpdate = cacheDate
  } else {
    console.log("No fallback to cache possible. Due to missing cache.")
  }
}

if (debug) {  
  console.log(JSON.stringify(result, null, 2))
}

const widget = new ListWidget()
widget.setPadding(10, 10, 10, 10)
widget.addSpacer(0)

let firstLineStack = widget.addStack()
  
let title = firstLineStack.addText("🦠 COVID-19 Impfungen")
title.font = Font.boldSystemFont(12)
title.minimumScaleFactor = 0.7
title.lineLimit = 1
// Last Update
firstLineStack.addSpacer()

if (config.widgetFamily !== 'small') {
  lastUpdateStack = firstLineStack.addStack()
  lastUpdateStack.layoutVertically()
  lastUpdateStack.addSpacer(3)
  let lastUpdateText = lastUpdateStack.addDate(new Date(result.lastUpdate))
  lastUpdateText.font = Font.systemFont(8)
  lastUpdateText.rightAlignText()
  lastUpdateText.applyDateStyle()
}

widget.addSpacer()

if (config.widgetFamily === 'large') {    
  const stack = widget.addStack()
  stack.layoutVertically()
  stack.spacing = spacing
  for (const [key, value] of Object.entries(result.states).sort((a, b) => a[0].localeCompare(b[0]))) {
    const row = stack.addStack()
    row.layoutHorizontally()
    const stateText = row.addText(key)
    stateText.font = Font.mediumSystemFont(fontSize)
    
    row.addSpacer()
    const quoteText = row.addText(`${value.quote} %`.replace('.', ','))
    quoteText.font = Font.systemFont(fontSize)
    
    row.addSpacer(4)
    const progressBar = row.addImage(creatProgress(value.quote))
    progressBar.imageSize = new Size(width, h)
  }
  
  stack.addSpacer(2)
  
  const row = stack.addStack()  
  row.layoutHorizontally()
  const stateText = row.addText('Gesamt')
  stateText.font = Font.boldSystemFont(fontSize + 1)
    
  row.addSpacer()
  const quoteText = row.addText(`${result.quote} %`.replace('.', ','))
  quoteText.font = Font.boldSystemFont(fontSize + 1)
    
  row.addSpacer(4)
  const progressBar = row.addImage(creatProgress(result.quote))
  progressBar.imageSize = new Size(width, h)
  
  widget.addSpacer(0)
} else {
  const row = widget.addStack()
  row.layoutHorizontally()
  
  
  if (selectedState) {
    const column = row.addStack()
    column.layoutVertically()
    column.centerAlignContent()
    
    const imageStack1 = column.addStack()
    imageStack1.layoutHorizontally()
    imageStack1.addSpacer()
    imageStack1.addImage(getDiagram(result.states[selectedState].quote));
    imageStack1.addSpacer()
    column.addSpacer(2)
    
    const total1 = parseInt((result.states[selectedState].total / 1000).toFixed(0)).toLocaleString('de')
    let vaccinated1
    if (result.states[selectedState].vaccinated > 999) {
      vaccinated1 = parseInt((result.states[selectedState].vaccinated / 1000).toFixed(0)).toLocaleString('de') + 't'
    } else {
      vaccinated1 = result.states[selectedState].vaccinated
    }
    
    const numbersText1Stack = column.addStack()
    numbersText1Stack.layoutHorizontally()
    numbersText1Stack.addSpacer()
    
    const numbersText1 = numbersText1Stack.addText(`${vaccinated1} von ${total1}t`)  
    numbersText1.font = Font.systemFont(fontSize2)
    numbersText1Stack.addSpacer()
    
    const stateText1Stack = column.addStack()
    stateText1Stack.layoutHorizontally()
    stateText1Stack.addSpacer()
    
    const stateText1 = stateText1Stack.addText(selectedState)
    stateText1.font = Font.boldSystemFont(fontSize2)
    stateText1.minimumScaleFactor = 0.7
    stateText1.lineLimit = 1
    stateText1Stack.addSpacer()
  }
  if (!selectedState || config.widgetFamily == 'medium') {
    const column2 = row.addStack()
    column2.layoutVertically()
    column2.centerAlignContent()
        
    const imageStack2 = column2.addStack()
    imageStack2.layoutHorizontally()
    imageStack2.addSpacer()
    imageStack2.addImage(getDiagram(result.quote));
    imageStack2.addSpacer()
    
    const total2 = parseInt((result.total / 1000).toFixed(0)).toLocaleString('de')
    let vaccinated2 = parseInt((result.vaccinated / 1000).toFixed(0)).toLocaleString('de')
    
    const numbersText2Stack = column2.addStack()
    numbersText2Stack.layoutHorizontally()
    numbersText2Stack.addSpacer()
    
    const numbersText2 = numbersText2Stack.addText(`${vaccinated2}t von ${total2}t`)  
    numbersText2.font = Font.systemFont(fontSize2)
    numbersText2Stack.addSpacer()
    
    const stateText2Stack = column2.addStack()
    stateText2Stack.layoutHorizontally()
    stateText2Stack.addSpacer()
    
    const stateText2 = stateText2Stack.addText('Deutschland')
    stateText2.font = Font.boldSystemFont(fontSize2)
    stateText2Stack.addSpacer()
  }
  if (config.widgetFamily === 'small') {
    const lastUpdateStack = widget.addStack()
    lastUpdateStack.layoutHorizontally()
    lastUpdateStack.addSpacer()
    const lastUpdateText = lastUpdateStack.addDate(new Date(result.lastUpdate))
    lastUpdateText.font = Font.systemFont(6)
    lastUpdateText.rightAlignText()
    lastUpdateText.applyDateStyle()
    lastUpdateStack.addSpacer()
  }
}

if (!config.runsInWidget) {
  switch (config.widgetFamily) {
    case 'small': await widget.presentSmall(); break;
    case 'medium': await widget.presentMedium(); break;
    case 'large': await widget.presentLarge(); break;
  }
} else {
  Script.setWidget(widget)
}
Script.complete()