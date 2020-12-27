// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: broadcast-tower;

/**************
Version 2.0.0

Changelog:  
  v2.0.0:
          - Disable "Dark Mode Support"
          - Medium Widget Support
          - Switch between used and remaining volume
          - Use MSISDN for Cache-Name
          - Show amount for prepaid cards
          - Show remaining days as progress-bar
  v1.2.4:
          - use color.dynamic
  v1.2.3:
          - Fix typo (thanks @CuzImStantac)
  v1.2.2:
          - Fix remaining Day issue
  v1.2.1:
          - Code '40100' added for CallYa Tariff
  v1.2.0:
          - Option to set colors by widget parameters removed
          - Option to set MeinVodafone credentails via widget parameters added
  v1.1.1:
          - new CallYa Tariff added: C_DIY_Data_National
  v1.1.0:
          - Login via MeinVodafone Login added
          - Show Remaining Days
          - MegaByte Support added for tariffs with <= 1 GB 
  v1.0.3:
          - CallYa Support
          - Write more useful information in the log, so that you can add support yourself if necessary
  v1.0.2:
          - Enhanced logging for CallYa troubeshooting
  v1.0.1:
          - Better Error handling
          - Better logging
          - Fallback Widget screen in case of an error

If you have problems or need help, ask for support here: https://github.com/ThisIsBenny/iOS-Widgets/issues

Credits: 
  - Sillium@GitHub (https://gist.github.com/Sillium/f904fb89444bc8dde12cfc07b8fa8728)
  - Chaeimg@Github (https://github.com/chaeimg/battCircle)
**************/

// How many minutes should the cache be valid
const cacheMinutes = 60

// Set to false if the widget should display always in red
const darkModeSupport = true

// Switch between remaining and used contingent. If you want show the used contingent, then change the value from true to false
const showRemainingContingent = true

// To disable the progressbar for the remaining days, you have to change the value from true to false
const showRemainingDaysAsProgressbar = true

// Please add additional values to these list, in case that your contract/tarif isn't supported by these default values.
const containerList = ['Daten', 'D_EU_DATA', 'C_DIY_Data_National']
const codeList = ['-1', '-5' ,'45500', '40100']

// Dev Settings
const debug = false
config.widgetFamily = config.widgetFamily || 'small'
////////////////////////////////////////////////////////////////////////////////
let widgetInputRAW = args.widgetParameter;
let widgetInput = null;
let user, pass, number
if (widgetInputRAW !== null) {
  [user, pass, number] = widgetInputRAW.toString().split("|");

  if (!user || !pass || !number) {
    throw new Error("Invalid Widget parameter. Expected format: username|password|phonenumber")
  }
  if (/^49[\d]{5,}/.test(number) === false) {
    throw new Error("Invalid phonenumber format. Expected format: 491721234567")
  }
}

const h = 5
let width
if (config.widgetFamily === 'small') {
  width = 200
} else {
  width = 400
}

let backColor = new Color('D32D1F')
let backColor2 = new Color('93291E')
let textColor = new Color('EDEDED')
let fillColor = new Color('EDEDED')
let strokeColor = new Color('B0B0B0')

if (darkModeSupport) {  
  backColor = Color.dynamic(backColor, new Color('111111'))
  backColor2 = Color.dynamic(backColor2, new Color('222222'))
  textColor = Color.dynamic(textColor, new Color('EDEDED'))
  fillColor = Color.dynamic(fillColor, new Color('EDEDED'))
  strokeColor = Color.dynamic(strokeColor, new Color('121212'))
}

function creatProgress(total, havegone) {
  const context = new DrawContext()
  context.size = new Size(width, h)
  context.opaque = false
  context.respectScreenScale = false
  
  // Background Path
  context.setFillColor(fillColor)
  const path = new Path()
  path.addRoundedRect(new Rect(0, 0, width, h), 3, 2)
  context.addPath(path)
  context.fillPath()
  
  // Progress Path
  context.setFillColor(strokeColor)  
  const path1 = new Path()
  const path1width = (width * (havegone / total) > width) ? width : width * (havegone / total)
  path1.addRoundedRect(new Rect(0, 0, path1width, h), 3, 2)
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
  
    canvas.setFillColor(fillColor)
    canvas.setStrokeColor(strokeColor)
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
  canvas.setTextColor(textColor)
  canvas.setFont(Font.boldSystemFont(canvTextSize))
  canvas.drawTextInRect(`${percentage}%`, canvTextRect)

  return canvas.getImage()
}

function getTimeRemaining(endtime) {
  const total = Date.parse(endtime) - Date.parse(new Date())
  const seconds = Math.floor((total / 1000) % 60)
  const minutes = Math.floor((total / 1000 / 60) % 60)
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const days = Math.floor(total / (1000 * 60 * 60 * 24))

  return {
    total,
    days,
    hours,
    minutes,
    seconds
  }
}

async function getSessionCookiesViaNetworkLogin() {
  let req;
  req = new Request("https://www.vodafone.de/mint/rest/session/start")
  req.method = "POST";
  req.headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }

  req.body = JSON.stringify({
    "authMethod": "AAA",
    "byPIN": false,
    "additionalParameters": {
      "deviceType": "Smartphone"
    }
  })
  try {
    let res = await req.loadJSON()
    return { cookies: req.response.cookies, msisdn: res.msisdn }
  } catch (e) {
    console.log("Login failed! Please check if Wifi is disabled.")
    throw new Error(`Login failed with HTTP-Status-Code ${req.response.statusCode}`)
  }
}

async function getSessionCookiesViaMeinVodafoneLogin(u, p) {
  let req;
  req = new Request("https://www.vodafone.de/mint/rest/session/start")
  req.method = "POST";
  req.headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }

  req.body = JSON.stringify({
    "clientType": "Portal",
    "username": u,
    "password": p,
  })
  try {
    let res = await req.loadJSON()
    return { cookies: req.response.cookies }
  } catch (e) {
    console.log("Login failed!")
    throw new Error(`Login failed with HTTP-Status-Code ${req.response.statusCode}`)
  }
}

async function getUsage(user, pass, number) {
  let cookies, msisdn
  if (user && pass && number) {
    console.log("Login via MeinVodafone")
    let { cookies: c } = await getSessionCookiesViaMeinVodafoneLogin(user, pass)
    cookies = c
    msisdn = number
  } else {
    console.log("Login via Network")
    let { cookies: c, msisdn: m } = await getSessionCookiesViaNetworkLogin()
    cookies = c
    msisdn = m
  }
  let CookieValues = cookies.map(function (v) {
    return v.name + "=" + v.value
  })
  let req
  req = new Request(`https://www.vodafone.de/api/enterprise-resources/core/bss/sub-nil/mobile/payment/service-usages/subscriptions/${msisdn}/unbilled-usage`)
  req.headers = {
    'x-vf-api': '1499082775305',
    'Referer': 'https://www.vodafone.de/meinvodafone/services/',
    'Accept': 'application/json',
    'Cookies': CookieValues.join(';')
  }
  try {
    let res = await req.loadJSON()
    if(!res['serviceUsageVBO'] || !res['serviceUsageVBO']['usageAccounts'] || !res['serviceUsageVBO']['usageAccounts'][0]) {
      if (debug) {
        console.log(JSON.stringify(res, null, 2))
      }
      
    }
    console.log("unbilled-usage loaded")
    if (debug) {
      console.log(JSON.stringify(res['serviceUsageVBO']['usageAccounts'][0], null, 2))
    }
    const marketCode = res['serviceUsageVBO']['usageAccounts'][0]['details']['marketCode']
    const billDate = res['serviceUsageVBO']['usageAccounts'][0]['details']['billDate']
    const amount = res['serviceUsageVBO']['usageAccounts'][0]['details']['amount']
    
    let usage = []
    
    // Get Main Container
    let container = res['serviceUsageVBO']['usageAccounts'][0]['usageGroup'].filter(function (v) {
      return containerList.includes(v.container)
    })  

    if (container.length === 0) {
      const ErrorMsg = "Can't find usageGroup with supported Container: " + containerList.join(', ') + ".";
      console.log(ErrorMsg)

      const listOfContainerNamesInResponse = res['serviceUsageVBO']['usageAccounts'][0]['usageGroup'].map(function (v) {
        return v.container
      })
      console.log("Please check the following list to find the correct container name for your case and adjust the list of container names at the beginnging: " + listOfContainerNamesInResponse.join(",  "))
      throw new Error(ErrorMsg)
    }

  
    for(let i = 0; i < container.length; i++) {
      for (let j = 0; j < container[i]['usage'].length; j++) {
        if (codeList.includes(container[i]['usage'][j]['code'])) {
          usage.push(container[i]['usage'][j])
        }
      }
    }
    if (usage.length === 0) {
      const ErrorMsg = "Can't find Usage with supported Codes: " + codeList.join(', ') + ".";
      console.log(ErrorMsg)  
       
      const listOfCodeInResponse = []
      for(let i = 0; i < container.length; i++) {
        for (let j = 0; j < container[i]['usage'].length; j++) {
          listOfCodeInResponse.push(`Code: "${container[i]['usage'][j].code}" for "${container[i]['usage'][j].description}"`)
        }
      }
      console.log("Please check the following list to find the correct code for your case and adjust the list of codes at the beginnging: " + listOfCodeInResponse.join(", "))
      throw new Error(ErrorMsg)
    }
    
    let endDate = usage[0].endDate
    if (endDate == null) {
      endDate = res['serviceUsageVBO']['billDetails']['billCycleEndDate'] || null
    }
    
    return {
      billDate,
      endDate,
      amount,
      marketCode,
      usage
    }
  } catch (e) {
    console.log("Loading usage data failed")
    throw e
  }
}

var today = new Date()

// Set up the file manager.
const files = FileManager.local()

// Set up cache
const cacheNamePostfix = (number) ? number.substr(number.length - 4) : 'networkLogin'
const cachePath = files.joinPath(files.documentsDirectory(), "widget-vodafone-" + cacheNamePostfix)
const cacheExists = files.fileExists(cachePath)
const cacheDate = cacheExists ? files.modificationDate(cachePath) : 0

// Get Data
let data
let lastUpdate
try {
  // If cache exists and it's been less than 30 minutes since last request, use cached data.
  if (cacheExists && (today.getTime() - cacheDate.getTime()) < (cacheMinutes * 60 * 1000)) {
    console.log("Get from Cache")
    data = JSON.parse(files.readString(cachePath))
    lastUpdate = cacheDate
  } else {
    console.log("Get from API")
    data = await getUsage(user, pass, number)
    console.log("Write Data to Cache")
    try {
      files.writeString(cachePath, JSON.stringify(data))
    } catch (e) {
      console.log("Creating Cache failed!")
      console.log(e)
    }

    lastUpdate = today
  }
} catch (e) {
  console.error(e)
  if (cacheExists) {
    console.log("Get from Cache")
    data = JSON.parse(files.readString(cachePath))
    lastUpdate = cacheDate
  } else {
    console.log("No fallback to cache possible. Due to missing cache.")
  }
}

// Create Widget
let widget = new ListWidget();

widget.setPadding(10, 10, 10, 10)

if (data !== undefined) {
  if(debug) {
      console.log(JSON.stringify(data, null, 2))
  }
  const gradient = new LinearGradient()
  gradient.locations = [0, 1]
  gradient.colors = [
    backColor,
    backColor2
  ]
  widget.backgroundGradient = gradient

  let firstLineStack = widget.addStack()

  let provider = firstLineStack.addText("Vodafone")
  provider.font = Font.mediumSystemFont(12)
  provider.textColor = textColor
  
  if (data.marketCode === 'MMO') {
    widget.addSpacer(2)
    const amount = widget.addText(`Guthaben: ${data.amount.replace('.', ',')} €`)
    amount.font = Font.systemFont(8)
    amount.textColor = textColor
  }

  // Last Update
  firstLineStack.addSpacer()
  let lastUpdateText = firstLineStack.addDate(lastUpdate)
  lastUpdateText.font = Font.systemFont(8)
  lastUpdateText.rightAlignText()
  lastUpdateText.applyTimeStyle()
  lastUpdateText.textColor = Color.lightGray()

  widget.addSpacer()
  
  const stack = widget.addStack()
  stack.layoutHorizontally()
    
  data.usage.slice(0, (config.widgetFamily === 'small' ? 1 : 2)).forEach((v) => {
    const column = stack.addStack()
    column.layoutVertically()
    column.centerAlignContent()
    
    const percentage = (100 / v.total * (showRemainingContingent ? v.remaining : v.used)).toFixed(0);
    const imageStack = column.addStack()
    imageStack.layoutHorizontally()
    imageStack.addSpacer()
    imageStack.addImage(getDiagram(percentage));
    imageStack.addSpacer()
    column.addSpacer(2)
    
    // Total Values
    let totalValues;
    if (v.unitOfMeasure !== 'MB') {
      totalValues = `${(showRemainingContingent ? v.remaining : v.used)} ${v.unitOfMeasure} von ${v.total} ${v.unitOfMeasure}`
    } else if (parseInt(v.total) < 1000) {
      totalValues = `${(showRemainingContingent ? v.remaining : v.used)} MB von ${v.total} MB`
    } else {
      let GB = ((showRemainingContingent ? v.remaining : v.used) / 1024).toFixed(2)
      let totalGB = (v.total / 1024).toFixed(2)
      totalValues = `${GB} GB von ${totalGB} GB`
    }
    textStack = column.addStack()
    textStack.layoutHorizontally()
    textStack.addSpacer()
    let diagramText = textStack.addText(totalValues)
    diagramText.font = Font.mediumSystemFont(11)
    diagramText.lineLimit = 1
    diagramText.centerAlignText()
    diagramText.textColor = textColor
    textStack.addSpacer()
    
    nameStack = column.addStack()
    nameStack.layoutHorizontally()
    nameStack.addSpacer()
    let diagramName = nameStack.addText(v.name.replace('Inland & EU', '').trim())
    diagramName.font = Font.systemFont(10)
    diagramName.lineLimit = 1
    diagramName.centerAlignText()
    diagramName.textColor = textColor
    nameStack.addSpacer()
  })
  
  widget.addSpacer()

  // Remaining Days
  if (data.endDate) {
    widget.addSpacer(5)
    let remainingDays = getTimeRemaining(data.endDate).days + 2
    if(data.billDate && showRemainingDaysAsProgressbar) {
      const startDate = new Date(data.billDate)
      const endDate = new Date(data.endDate)
      const total = (endDate - startDate) / (1000 * 60 * 60 * 24)
      
      const progressBarStack = widget.addStack()
      progressBarStack.layoutHorizontally()
      progressBarStack.addSpacer()
      
      const progressBar = progressBarStack.addImage(creatProgress(total, total - remainingDays))
      progressBarStack.addSpacer()
      widget.addSpacer(4)
    }

    let remainingDaysText = widget.addText(`${remainingDays} Tage verbleibend`)
    remainingDaysText.font = Font.systemFont(8)
    remainingDaysText.centerAlignText()
    remainingDaysText.textColor = textColor
  }

} else {
  let fallbackText = widget.addText("Es ist ein Fehler aufgetreten! Bitte prüfen Sie die Logs direkt in der App.")
  fallbackText.font = Font.mediumSystemFont(12)
  fallbackText.textColor = textColor
}

if (!config.runsInWidget) {
  switch (config.widgetFamily) {
    case 'small': await widget.presentSmall(); break;
    case 'medium': await widget.presentMedium(); break;
    case 'large': await widget.presentLarge(); break;
  }
  
} else {
  // Tell the system to show the widget.
  Script.setWidget(widget)
  Script.complete()
}
