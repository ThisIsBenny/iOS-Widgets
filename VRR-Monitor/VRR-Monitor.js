// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: bus-alt;

/**************
Version 1.1.0

Changelog:
  v1.1.0:
          - Line filter support added
          - Setup Wizard enhanced

**************/

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
// Wizard
let wizardStationId, wizardLines
let linesTable = new UITable()
linesTable.showSeparators = true

//Color
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
    console.log(req.response)
    console.log(e)
    throw e
  }
};

async function findNextStations(latitude, longitude) {
  let req = new Request(`https://abfahrtsmonitor.vrr.de/backend/api/stations/coord?long=${longitude}&lat=${latitude}`)
  
  let res = await req.loadJSON()
  return res['suggestions']
};

async function getLines(stationId) {
  let req = new Request(`https://haltestellenmonitor.vrr.de/backend/api/lines/${stationId}/search`)
  
  return await req.loadJSON()
};

function populateStationTable(table, stations) {
  table.removeAllRows()
  for (i = 0; i < stations.length; i++) {
    let station = stations[i]
    let row = new UITableRow()
    
    let nameCell = row.addText(station.value)
    nameCell.leftAligned()
    
    row.onSelect = (number) => {
      wizardStationId = stations[number].data
    }
    
    table.addRow(row)
  }
}

function populateLinesTable() {
  linesTable.removeAllRows()
  
  for (i = 0; i < wizardLines.length; i++) {
    let row = new UITableRow()
    row.dismissOnSelect = false
    
    let selectedCell = row.addText((wizardLines[i].selected)? "✓" : "")  
    selectedCell.widthWeight = 5
    
    let textCell = row.addText(wizardLines[i].name)
    textCell.widthWeight = 70
    
    row.onSelect = (number) => {
      wizardLines[number].selected = !wizardLines[number].selected
      populateLinesTable()
      linesTable.reload()
    }
    linesTable.addRow(row)
  }
}

let widgetInputRAW = args.widgetParameter;
let widgetInput = null;

if (widgetInputRAW !== null) {
  widgetInput = widgetInputRAW.toString().split(";");
} else {
  if(!config.runsInWidget) {
    let prompt1 = new Alert()
    prompt1.message = 'Do you like to use the Setup Wizard to get the widget parameters?'
    prompt1.addAction('Yes')
    prompt1.addCancelAction('No')
    
    if ((await prompt1.presentAlert()) === 0) {
      let l = await Location.current()
      let stations = await findNextStations(l.latitude, l.longitude)
      let table = new UITable()
      table.showSeparators = true
      populateStationTable(table, stations)
      await QuickLook.present(table)
      
      let prompt2 = new Alert()
      prompt2.message = 'How many minutes do you need to go to the station?'
      prompt2.addTextField('Minutes')
      prompt2.addAction('Weiter')
      
      await prompt2.presentAlert()
      
      let widgetParameter = `${wizardStationId};${prompt2.textFieldValue(0)}`
      
      let prompt3 = new Alert()
      prompt3.message = 'Do you want to display only specific lines (including direction)?'
      prompt3.addAction('Yes')
      prompt3.addCancelAction('No, show all lines')
        
      if ((await prompt3.presentAlert()) === 0) {
        wizardLines = await getLines(wizardStationId)
        wizardLines = wizardLines.map((v) => {
          v.selected = false
          return v
        })
        populateLinesTable()
        await QuickLook.present(linesTable)
        let linesConfig = wizardLines.filter(v => v.selected).map((v) => {
          return {
            data: `${v.network}:${v.line}:+:${v.directionCode}`
          }
        
        })
        
        widgetParameter = widgetParameter + ";" + JSON.stringify(linesConfig)
      }
      
      Pasteboard.copy(widgetParameter);
      let alert = new Alert();
      alert.message = `Config '${widgetParameter}' was copied to the clipboard. Please paste this config to the widget parameter.`
      alert.addAction('Ok')
      alert.present()
    }
    return
  }
  throw new Error('No Station Code set!')
}

console.log(widgetInput)

let selectedTransportTypes = transportTypes.filter(function(v){
  return v.show
})

let selectedTransportTypesCodes = selectedTransportTypes.map(function(v){
  return v.code
})

let { departureData: data, stationName } = await fetchStationdata(widgetInput[0], widgetInput[2] || '', widgetInput[1], selectedTransportTypesCodes);

console.log(JSON.stringify(data, null, 2))

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


if(!config.runsInWidget) {
  await widget.presentMedium()
} else {
  // Tell the system to show the widget.
  Script.setWidget(widget)
  Script.complete()
}
