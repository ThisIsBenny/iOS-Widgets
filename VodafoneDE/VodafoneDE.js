// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: broadcast-tower;

/**************
Version 1.2.4

Changelog:
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
let cacheMinutes = 60;

// Please add additional values to these list, in case that your contract/tarif isn't supported by these default values.
const containerList = ['Daten', 'D_EU_DATA', 'C_DIY_Data_National']
const codeList = ['-1', '45500', '40100']

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

const backColor = Color.dynamic(new Color('D32D1F'), new Color('111111'));
const backColor2 = Color.dynamic(new Color('76150C'), new Color('222222'));
const textColor = Color.dynamic(new Color('EDEDED'), new Color('EDEDED'));
const fillColor = Color.dynamic(new Color('EDEDED'), new Color('EDEDED'));
const strokeColor = Color.dynamic(new Color('B0B0B0'), new Color('121212'));

const canvas = new DrawContext();
const canvSize = 200;
const canvTextSize = 36;

const canvWidth = 22;
const canvRadius = 80;

canvas.opaque = false
canvas.size = new Size(canvSize, canvSize);
canvas.respectScreenScale = true;

function sinDeg(deg) {
  return Math.sin((deg * Math.PI) / 180);
}

function cosDeg(deg) {
  return Math.cos((deg * Math.PI) / 180);
}

function drawArc(ctr, rad, w, deg) {
  bgx = ctr.x - rad;
  bgy = ctr.y - rad;
  bgd = 2 * rad;
  bgr = new Rect(bgx, bgy, bgd, bgd);

  canvas.setFillColor(fillColor);
  canvas.setStrokeColor(strokeColor);
  canvas.setLineWidth(w);
  canvas.strokeEllipse(bgr);

  for (t = 0; t < deg; t++) {
    rect_x = ctr.x + rad * sinDeg(t) - w / 2;
    rect_y = ctr.y - rad * cosDeg(t) - w / 2;
    rect_r = new Rect(rect_x, rect_y, w, w);
    canvas.fillEllipse(rect_r);
  }
}

function getTimeRemaining(endtime) {
  const total = Date.parse(endtime) - Date.parse(new Date());
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return {
    total,
    days,
    hours,
    minutes,
    seconds
  };
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
};

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
};

async function getUsage(user, pass, number) {
  let cookies, msisdn;
  if (user && pass && number) {
    console.log("Login via MeinVodafone")
    let { cookies: c } = await getSessionCookiesViaMeinVodafoneLogin(user, pass);
    cookies = c;
    msisdn = number;
  } else {
    console.log("Login via Network")
    let { cookies: c, msisdn: m } = await getSessionCookiesViaNetworkLogin();
    cookies = c;
    msisdn = m;
  }
  let CookieValues = cookies.map(function (v) {
    return v.name + "=" + v.value
  })
  let req;
  req = new Request(`https://www.vodafone.de/api/enterprise-resources/core/bss/sub-nil/mobile/payment/service-usages/subscriptions/${msisdn}/unbilled-usage`)
  req.headers = {
    'x-vf-api': '1499082775305',
    'Referer': 'https://www.vodafone.de/meinvodafone/services/',
    'Accept': 'application/json',
    'Cookies': CookieValues.join(';')
  }
  try {
    let res = await req.loadJSON()
    console.log("unbilled-usage loaded")
    let datenContainer = res['serviceUsageVBO']['usageAccounts'][0]['usageGroup'].find(function (v) {
      return containerList.includes(v.container)
    })

    if (datenContainer === undefined) {
      const ErrorMsg = "Can't find usageGroup with supported Container: " + containerList.join(', ') + ".";
      console.log(ErrorMsg)

      const listOfContainerNamesInResponse = res['serviceUsageVBO']['usageAccounts'][0]['usageGroup'].map(function (v) {
        return v.container;
      })
      console.log("Please check the following list to find the correct container name for your case and adjust the list of container names at the beginnging: " + listOfContainerNamesInResponse.join(", "))
      throw new Error(ErrorMsg)
    }

    let datenvolumen;
    if (datenContainer.usage.length == 1) {
      datenvolumen = datenContainer.usage[0]
    } else {
      datenvolumen = datenContainer.usage.find(function (v) {
        return codeList.includes(v.code)
      })
    }

    if (datenvolumen === undefined) {
      const ErrorMsg = "Can't find Usage with supported Codes: " + codeList.join(', ') + ".";
      console.log(ErrorMsg)

      const listOfCodeInResponse = datenContainer.usage.map(function (v) {
        return `Code: "${v.code}" for "${v.description}"`;
      })
      console.log("Please check the following list to find the correct code for your case and adjust the list of codes at the beginnging: " + listOfCodeInResponse.join(", "))
      throw new Error(ErrorMsg)
    }


    let endDate = datenvolumen.endDate;
    if (endDate == null) {
      endDate = res['serviceUsageVBO']['billDetails']['billCycleEndDate'] || null
    }

    return {
      total: datenvolumen.total,
      used: datenvolumen.used,
      remaining: datenvolumen.remaining,
      endDate
    }
  } catch (e) {
    console.log("Loading usage data failed")
    throw e
  }
};

var today = new Date();

// Set up the file manager.
const files = FileManager.local()

// Set up cache .
const cachePath = files.joinPath(files.documentsDirectory(), "widget-vodafone")
const cacheExists = files.fileExists(cachePath)
const cacheDate = cacheExists ? files.modificationDate(cachePath) : 0

// Get Data
let data;
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
  console.log(data)
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

  // Last Update
  firstLineStack.addSpacer()
  let lastUpdateText = firstLineStack.addDate(lastUpdate)
  lastUpdateText.font = Font.mediumSystemFont(8)
  lastUpdateText.rightAlignText()
  lastUpdateText.applyTimeStyle()
  lastUpdateText.textColor = Color.lightGray()

  widget.addSpacer()

  let remainingPercentage = (100 / data.total * data.remaining).toFixed(0);

  drawArc(
    new Point(canvSize / 2, canvSize / 2),
    canvRadius,
    canvWidth,
    Math.floor(remainingPercentage * 3.6)
  );

  const canvTextRect = new Rect(
    0,
    100 - canvTextSize / 2,
    canvSize,
    canvTextSize
  );
  canvas.setTextAlignedCenter();
  canvas.setTextColor(textColor);
  canvas.setFont(Font.boldSystemFont(canvTextSize));
  canvas.drawTextInRect(`${remainingPercentage}%`, canvTextRect);

  const canvImage = canvas.getImage();
  let image = widget.addImage(canvImage);
  image.centerAlignImage()

  widget.addSpacer()

  // Total Values
  let totalValues;
  if (parseInt(data.total) < 1000) {
    totalValues = `${data.remaining} MB von ${data.total} MB`
  } else {
    let remainingGB = (data.remaining / 1024).toFixed(2)
    let totalGB = (data.total / 1024).toFixed(0)
    totalValues = `${remainingGB} GB von ${totalGB} GB`
  }
  let totalValuesText = widget.addText(totalValues)
  totalValuesText.font = Font.mediumSystemFont(12)
  totalValuesText.centerAlignText()
  totalValuesText.textColor = textColor

  // Remaining Days    
  if (data.endDate) {
    widget.addSpacer(5)
    let remainingDays = getTimeRemaining(data.endDate).days + 2
    let remainingDaysText = widget.addText(`${remainingDays} Tage verbleibend`)
    remainingDaysText.font = Font.mediumSystemFont(8)
    remainingDaysText.centerAlignText()
    remainingDaysText.textColor = textColor
  }

} else {
  let fallbackText = widget.addText("Es ist ein Fehler aufgetreten! Bitte prüfen Sie die Logs direkt in der App.")
  fallbackText.font = Font.mediumSystemFont(12)
  fallbackText.textColor = textColor
}

if (!config.runsInWidget) {
  await widget.presentSmall()
} else {
  // Tell the system to show the widget.
  Script.setWidget(widget)
  Script.complete()
}
