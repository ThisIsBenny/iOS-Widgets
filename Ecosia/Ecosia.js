// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: magic;
// Version 1.0.0

let widgetInputRAW = args.widgetParameter;
let token;
if (widgetInputRAW !== null) {
  token = widgetInputRAW.toString().trim();
  if (/^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/.text(token) === false) {
    throw new Errpr('Invalid Token Format')
  }
} else {
  throw new Error('No token set via widget parameter! You can request a token here: https://www.ecosia.org/account/login')
}

////////////////////////////////////////////////////////////////////////////////
async function getTreeCounter(token) {
  let req = new Request("https://api.ecosia.org/v1/accounts/personalcounter?token=" + token)
  let res = await req.loadJSON()
  return parseInt(res.counterValue)
}

async function getLogo() {
  let fm = FileManager.local()
  const pathLogo = fm.joinPath(fm.temporaryDirectory(), 'ecosiaLogo')

  if (fm.fileExists(pathLogo)) {
    return fm.readImage(pathLogo)
  } else {
    try {
      let req = new Request('https://uc948e7ad6c396973f81d540ee4f.dl.dropboxusercontent.com/cd/0/get/BCSgEaIvDEkR-T7KEmiGl3_qHREwC9xuXRJpUM61i27BB3_qczSDa8yH6wlK5CoRtSKikI6G-iGN7AdM-xRpFO9g5ahznpU7kfJVEy7SGvR2Gw/file?_download_id=9234590427327855751170888564094591338853848773569417305635998585&_notify_domain=www.dropbox.com&dl=1')
      let logo = await req.loadImage()
      fm.writeImage(pathLogo, logo)
      return logo
    } catch (e) {
      console.error(e)
      return null
    }
  }
}

let treeCounter = await getTreeCounter(token);
let ecosiaLogo = await getLogo()
// Create Widget
let widget = new ListWidget();
widget.url = 'https://ecosia.org/'

widget.setPadding(10, 10, 10, 10)

if (ecosiaLogo !== null) {
  let titleLogo = widget.addImage(ecosiaLogo)
  titleLogo.imageSize = new Size(50, 50)
  titleLogo.rightAlignImage()
  if (config.widgetFamily === 'large') {
    widget.addSpacer()
  } else {
    widget.addSpacer(5)
  }
} else {
  let title = widget.addText("Ecosia")
  title.font = Font.mediumSystemFont(12)
  widget.addSpacer()
}

let counterText = widget.addText(`${treeCounter.toLocaleString(Device.locale().replace('_', '-'))} 🌳`)
counterText.font = Font.regularSystemFont(36)
counterText.minimumScaleFactor = 0.7;
counterText.lineLimit = 1
counterText.centerAlignText()

widget.addSpacer()

if (!config.runsInWidget) {
  await widget.presentSmall()
} else {
  // Tell the system to show the widget.
  Script.setWidget(widget)
  Script.complete()
}