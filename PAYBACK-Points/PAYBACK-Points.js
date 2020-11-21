// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: shopping-basket;

// Version 1.0.0

const cacheMinutes = 60 * 12 // 12h
const today = new Date()
const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:82.0) Gecko/20100101 Firefox/82.0'

////////////////////////////////////////////////////////////
let widgetInputRAW = args.widgetParameter;
let widgetInput;
if (widgetInputRAW !== null) {
  widgetInput = widgetInputRAW.toString().trim().split(';')

  if (widgetInput[0] && !/^[\d]+$/.test(widgetInput[0])) {
    throw new Error('the first parameter has to be a number')
  }
}
////////////////////////////////////////////////////////////
const getTokenAndCookies = async () => {
  const req = new Request('https://www.payback.de/login')
  req.headers = {
    'User-Agent': userAgent
  }
  const htmlString = await req.loadString()
  const csrfToken = htmlString.match(/<input[\s]type="hidden".*name="_csrf"[\s]value="([\a-zA-Z0-9\-]+)"[\s]?>/)
  if (!csrfToken) {
    if (htmlString.indexOf('dass Sie ein Bot sein') !== -1) {
      if (config.runsInApp) {
        const alert = new Alert()
        alert.message = 'Please solve the capture so that the widget is no longer recognized as a bot.'
        alert.addAction('Ok')
        await alert.present()
        const r = new Request('https://www.payback.de/login')
        r.headers = {
          'User-Agent': userAgent
        }
        const view = new WebView()
        view.loadRequest(r)
        await view.present()
      } else {
        throw new Error('Widget was detected as a bot. Please execute the script in the Scriptable App to solve the capture.')
      }
    }
    throw new Error('Unable to get Security Token') 
  }
  return { token: csrfToken[1], cookies: req.response.cookies }
}
////////////////////////////////////////////////////////////
const getPoints = async () => {
  const { token, cookies } = await getTokenAndCookies()
  if (widgetInput === undefined || !widgetInput[0] || !widgetInput[1]) {
    throw new Error('No customer-number and password set. Please set needed data to widget parameter.')
  }
  let cookieString = cookies.map(function (v) {
    return v.name + "=" + v.value
  }).join('; ')
  const req = new Request('https://www.payback.de/resources/action/login/login-action')
  req.headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': userAgent,
    Cookie: cookieString
  }
  req.method = 'POST';
  req.body = `login-method=pwd&SITE_NAME=payback-main-page&_csrf=${token}&aliasTypePassName=${widgetInput[0]}&passwordName=${widgetInput[1]}`
  
  const res = await req.loadString()
  if (req.response.statusCode !== 200) {
    throw new Error('Unable to fetch Point. Status-Code: ' + req.response.statusCode)
  }
  const points = res.match(/<a[\s]href="\/punktekonto".*><strong>(.*)<\/strong><\/a>/)
  if (!points) {
    throw new Error('Unable to get Point out of HTML Body')
  }
  return points[1]
}
////////////////////////////////////////////////////////////
const files = FileManager.local()

const cachePath = files.joinPath(files.cacheDirectory(), "widget-payback-" + ((widgetInput !== undefined) ? widgetInput[0] : ''))
const cacheExists = files.fileExists(cachePath)
const cacheDate = cacheExists ? files.modificationDate(cachePath) : 0
let points
if (!config.runsInApp && cacheExists && (today.getTime() - cacheDate.getTime()) < (cacheMinutes * 60 * 1000)) {
  console.log("Get from Cache")
  points = files.readString(cachePath)
} else {
  console.log("Get from Website")
  try {
    points = await getPoints()
    console.log("Write to Cache")
    files.writeString(cachePath, points)
  } catch (e) {
    console.error('Fetching data from website failed:')
    console.error(e)
    if (cacheExists) {
      console.warn('Fallback to Cache')
      points = files.readString(cachePath)
    } else {
      throw e
    }
  }
}

const imageCachePath = files.joinPath(files.cacheDirectory(), "widget-payback-logo")
const imageCachePathExists = files.fileExists(imageCachePath)
let logo
if (imageCachePathExists) {
  logo = files.readImage(imageCachePath)
} else {
  const imgReq = new Request('https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Payback_Logo.svg/200px-Payback_Logo.svg.png')
  logo = await imgReq.loadImage()
  files.writeImage(imageCachePath, logo)
}
////////////////////////////////////////////////////////////

let widget = new ListWidget();

if (!points) {
  widget.addText('Unable to get Payback Points. Please check logs.')
} else {
  widget.setPadding(10, 10, 10, 10)
  widget.backgroundColor = new Color('0046AA')

  const logoElement = widget.addImage(logo)
  logoElement.imageSize = new Size(35, 35)
  logoElement.applyFillingContentMode()
  logoElement.centerAlignImage()
  
  widget.addSpacer(15)
  
  const pointText = widget.addText(points)
  pointText.font = Font.regularSystemFont(36)
  pointText.textColor = Color.white()
  pointText.centerAlignText()
  pointText.minimumScaleFactor = 0.5
  pointText.lineLimit = 1
  
  widget.addSpacer()
}
if (!config.runsInWidget) {
  await widget.presentSmall()
} else {
  // Tell the system to show the widget.
  Script.setWidget(widget)
  Script.complete()
}