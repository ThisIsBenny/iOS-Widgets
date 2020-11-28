// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-brown; icon-glyph: power-off;
// Version 1.0.0

//////////////////////////////////////////////////////
let fm
try {
  fm = FileManager.iCloud()
  fm.documentsDirectory()
} catch (e) {
  console.log(e)
  fm = FileManager.local()
}

const settingsPath = fm.joinPath(fm.documentsDirectory(), 'health-check-settings.json')
if (!fm.fileExists(settingsPath)) {
  const examplePath = fm.joinPath(fm.documentsDirectory(), 'health-check-settings.example.json')
  fm.writeString(examplePath, JSON.stringify([{
    name: 'Server 1',
    endpoint: 'https://example.com/api/health',
    expectedContentType: 'application/json',
    timeoutInterval: 1,
    notification: true,
    headers: [{key: 'x-customer-header-key',value: 'x-customer-header-value'}]
  }], null, 2))
  
  throw new Error('No health-check-settings.json found! Please rename health-check-settings.example.json to health-check-settings.json and add your settings.')
} else {
  try {
    fm.downloadFileFromiCloud(settingsPath)
  } catch(e) {
    console.error(e)
  } 
}
//////////////////////////////////////////////////////
const chooseRandom = (arr, num = 1) => {
   const res = [];
   for(let i = 0; i < num; ){
      const random = Math.floor(Math.random() * arr.length);
      if(res.indexOf(arr[random]) !== -1){
         continue;
      };
      res.push(arr[random]);
      i++;
   };
   return res;
};
//////////////////////////////////////////////////////
const check = async ({ endpoint, headers, timeoutInterval }) => {
  const req = new Request(endpoint)
  req.timeoutInterval = timeoutInterval || 5
  if (headers) {
    let i
    const h = {}
    for (i = 0; i < headers.length; i++) {
      h[headers[i].key] = headers[i].value
    }
    req.headers = h
  }
  
  let body, httpStatus, contentType
  try {
    const res = await req.loadString()
    if (req.response.headers['Content-Type'] === 'application/json') {
      body = JSON.parse(res)
    }
    httpStatus = req.response.statusCode
    contentType = req.response.headers['Content-Type']
  } catch (e) {
    httpStatus = 504
  }
  return {
    httpStatus,
    contentType,
    body
  }
}
//////////////////////////////////////////////////////
const settings = JSON.parse(fm.readString(settingsPath))

let i
for (i = 0; i < settings.length; i++) {
  const { httpStatus, contentType } = await check(settings[i])
  if (settings[i].history === undefined) {
    settings[i].history = []
  }
  
  let status = 'healthy'
  if (!/^2/.test(httpStatus)) {
    status = 'unhealthy'
  }
  if (settings[i].contentType && settings[i].expectedContentType !== contentType) {
    status = 'unhealthy'
  }
  settings[i].history.push({
    date: new Date().toISOString(),
    status
  })
  settings[i].history = settings[i].history.splice(-40)
  if (settings[i].notification && /^2/.test(httpStatus) === false) {
    const n = new Notification()
    n.body = `🚨 Service '${settings[i].name}' is ${(httpStatus === 504) ? 'slow' : 'unhealthy'}`
    n.schedule()
  }
}
//////////////////////////////////////////////////////
fm.writeString(settingsPath, JSON.stringify(settings, null, 2))
//////////////////////////////////////////////////////

const widget = new ListWidget()

const titleStack = widget.addStack()
titleStack.layoutHorizontally()

const widgetTitle = titleStack.addText('Health Check')

titleStack.addSpacer()

const globalStatus = settings.filter((e) => {
  return e.history[e.history.length - 1].status === 'healthy'
})

const widgetGlobalStatus = titleStack.addText(`${globalStatus.length}/${settings.length} healthy`)
widgetGlobalStatus.font = Font.regularSystemFont(10)

widget.addSpacer(5)

const stack = widget.addStack()
stack.layoutHorizontally()

const leftColumn = stack.addStack()
leftColumn.layoutVertically()
leftColumn.spacing = 5

let rightColumn
if (config.widgetFamily !== 'small' ) {
  stack.addSpacer(20)
  rightColumn = stack.addStack()
  rightColumn.layoutVertically()
  rightColumn.spacing = 5
}

const maxView = (config.widgetFamily !== 'large') ? 4 : 8
let toShow

if (settings.length > maxView) {
  toShow = chooseRandom(settings, maxView)
} else {
  toShow = settings
}

for (i = 0; i < toShow.length; i++) {
  const lastCheck = toShow[i].history[toShow[i].history.length - 1]
  const labelText = leftColumn.addText(`${lastCheck.status === 'healthy' ? '🟢' : '⚠️'} ${toShow[i].name}`)
  labelText.font = Font.regularSystemFont(12)
  labelText.lineLimit = 1
  
  
  if (config.widgetFamily !== 'small' ) {
    let j
    const field = rightColumn.addStack()
    field.layoutHorizontally()
    for (j = 0; j < toShow[i].history.length; j++) {
      const status = field.addText('|')
      status.font = Font.regularSystemFont(12)
      status.textColor = (toShow[i].history[j].status === 'healthy') ? Color.green() : Color.red()
    }
  }
}
widget.addSpacer()

const widgetUpdate = widget.addText(`Last Check: ${new Date().toLocaleString()}`)
widgetUpdate.font = Font.regularSystemFont(8)
widgetUpdate.textColor = Color.lightGray()
widgetUpdate.centerAlignText()

if (!config.runsInWidget) {
  await widget.presentLarge()
} else {
  // Tell the system to show the widget.
  Script.setWidget(widget)
  Script.complete()
}
