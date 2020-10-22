// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: bus-alt;

let transportTypes = [
  {
    name: 'ICE/IC/EC',
    show: true,
    code: 0
  },
  {
    name: 'Zug',
    show: true,
    code: 1
  },
  {
    name: 'S-Bahn',
    show: true,
    code: 2
  },
  {
    name: 'U-Bahn',
    show: true,
    code: 3
  },
  {
    name: 'Straßen-Bahn',
    show: true,
    code: 4
  },
  {
    name: 'Bus',
    show: true,
    code: 15
  },
  {
    name: 'Schwebe-Bahn',
    show: true,
    code: 6
  }
 ]

////////////////////////////////////////////////////////////////////////////////
let backColor; //Widget background color
let backColor2; //Widget background color
let textColor; //Widget text color
let useGradient = true
  
if (Device.isUsingDarkAppearance()) {
  backColor = '111111';
  backColor2 = '222222';
  textColor = 'EDEDED';
} else {
  backColor = '145A32';
  backColor2 = '1E8449';
  textColor = 'FFFFFF';
}

async function fetchStationdata(Id, linesFilter, distance, transportCodes) {
  let req = new Request("https://abfahrtsmonitor.vrr.de/backend/api/stations/table")
  req.headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  }
  req.method = "POST";
  req.addParameterToMultipart('table[departure][stationId]', Id)
  req.addParameterToMultipart('table[departure][platformVisibility]', '1')
  req.addParameterToMultipart('table[departure][transport]', transportCodes.join(','))
  req.addParameterToMultipart('table[departure][useAllLines]', '0')
  req.addParameterToMultipart('table[departure][linesFilter]', linesFilter)
  req.addParameterToMultipart('table[departure][rowCount]', '7')
  req.addParameterToMultipart('table[departure][distance]', distance)
  req.addParameterToMultipart('table[sortBy]', '0')
  
  try {
    let res = await req.loadJSON()
    return {departureData: res['departureData'], stationName: res['stationName']}
  } catch (e) {
    throw e
  }
};

let widgetInputRAW = args.widgetParameter;
let widgetInput = null;

if (widgetInputRAW !== null) {
  widgetInput = widgetInputRAW.toString().split(";");
} else {
  throw new Error('No Station Code set!')
}

console.log(widgetInput)

let selectedTransportTypes = transportTypes.filter(function(v){
  return v.show
})

let selectedTransportTypesCodes = selectedTransportTypes.map(function(v){
  return v.code
})

let { departureData: data, stationName } = await fetchStationdata(widgetInput[0], '', widgetInput[1], selectedTransportTypesCodes);

console.log(JSON.stringify(data, null, 2))

// Create Widget
let widget = new ListWidget();

widget.setPadding(10, 10, 10, 10)

if (data) {
  const gradient = new LinearGradient()
  gradient.locations = [0, 1]
  gradient.colors = [
    new Color(backColor),
    new Color(backColor2)  
  ]
  widget.backgroundGradient = gradient

  
  let firstLineStack = widget.addStack()
  
  let provider = firstLineStack.addText("🚏 " + stationName)
  provider.font = Font.boldSystemFont(12)
  provider.textColor = new Color(textColor)
  
  // Last Update
  firstLineStack.addSpacer()
  let lastUpdateText = firstLineStack.addDate(new Date())
  lastUpdateText.font = Font.mediumSystemFont(10)
  lastUpdateText.rightAlignText()
  lastUpdateText.applyTimeStyle()
  lastUpdateText.textColor = Color.lightGray() 
  
  widget.addSpacer(10)
  
  let row = widget.addStack()
  row.layoutHorizontally()
  row.spacing = 15
  
  let timeColumn = row.addStack()
  timeColumn.layoutVertically();
  
  let lineColumn = row.addStack()
  lineColumn.layoutVertically()
  
  let directionColumn = row.addStack()
  directionColumn.layoutVertically()
  
  data.forEach(function(l) {
    
    let timeText = timeColumn.addText(`${l.hour}:${l.minute}`)
    timeText.font = Font.mediumSystemFont(12)
    timeText.textColor = new Color(textColor)
    timeText.leftAlignText()
    
    let lineText = lineColumn.addText(l.name)
    lineText.font = Font.mediumSystemFont(12)
    lineText.textColor = new Color(textColor)
    lineText.leftAlignText()
    
    let directionText = directionColumn.addText(l.direction)
    directionText.font = Font.mediumSystemFont(12)
    directionText.textColor = new Color(textColor)
    directionText.leftAlignText()
    directionText.lineLimit = 1
  
  })
  
  widget.addSpacer()
  
} else {
  let fallbackText = widget.addText("Es ist ein Fehler aufgetreten! Bitte prüfen Sie die Logs direkt in der App.")
  fallbackText.font = Font.mediumSystemFont(12)
  fallbackText.textColor = new Color(textColor)
}

if(!config.runsInWidget) {
  await widget.presentMedium()
} else {
  // Tell the system to show the widget.
  Script.setWidget(widget)
  Script.complete()
}

