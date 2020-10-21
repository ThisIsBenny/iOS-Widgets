// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;

// Credits Sillium@GitHub (https://gist.github.com/Sillium/f904fb89444bc8dde12cfc07b8fa8728)

// How many minutes should the cache be valid
let cacheMinutes = 60;

async function getSessionCookies() {
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
    return { cookies: req.response.cookies, msisdn: res.msisdn}
  } catch (e) {
    console.log(e)
    throw e
  }
};

async function getUsage() {
  let {cookies, msisdn} = await getSessionCookies();
  let CookieValues = cookies.map(function(v){
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
    
    let datenContainer = res['serviceUsageVBO']['usageAccounts'][0]['usageGroup'].find(function(v){
      return v.container == "Daten"
    })
    let datenvolumen = datenContainer.usage.find(function(v){
      return v.code == "-1"
    })
    console.log(datenvolumen)
    return {
      total: datenvolumen.total,
      used: datenvolumen.used,
      remaining: datenvolumen.remaining
    }
  } catch (e) {
    console.log(e)
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
    data = await getUsage()
    files.writeString(cachePath, JSON.stringify(data))
    lastUpdate = today
  }
} catch (e) {
  console.log(e)
  console.log("Get from Cache")
  data = JSON.parse(files.readString(cachePath))
  lastUpdate = cacheDate
}

// Create Widget
let widget = new ListWidget();

widget.backgroundColor = new Color("#FD0000")

let provider = widget.addText("Vodafone")
provider.font = Font.mediumSystemFont(12)

widget.addSpacer()

let remainingPercentage = (100 / data.total * data.remaining).toFixed(0);

const remainingPercentageText = widget.addText(remainingPercentage + "%")
remainingPercentageText.font = Font.boldSystemFont(36)

widget.addSpacer()

let remainingGB = (data.remaining / 1024).toFixed(1)
let totalGB = (data.total / 1024).toFixed(0)
let totalValuesText = widget.addText(`${remainingGB} GB von ${totalGB} GB`)
totalValuesText.font = Font.mediumSystemFont(12)

widget.addSpacer()
let lastUpdateText = widget.addDate(lastUpdate)
lastUpdateText.font = Font.mediumSystemFont(10)
lastUpdateText.centerAlignText()
lastUpdateText.applyTimeStyle()
lastUpdateText.textColor = Color.darkGray()

if(!config.runsInWidget) {
  await widget.presentSmall()
} else {
  // Tell the system to show the widget.
  Script.setWidget(widget)
  Script.complete()
}