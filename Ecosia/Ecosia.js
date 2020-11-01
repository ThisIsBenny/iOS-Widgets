// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: magic;
// Version 1.1.0

let widgetInputRAW = args.widgetParameter;
let token;
if (widgetInputRAW !== null) {
  token = widgetInputRAW.toString().trim();
  if (/^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/.test(token) === false) {
    throw new Errpr('Invalid Token Format')
  }
} else {
  throw new Error('No token set via widget parameter! You can request a token here: https://www.ecosia.org/account/login')
}

////////////////////////////////////////////////////////////////////////////////
let backColor; //Widget background color
let backColor2; //Widget background color
let textColor; //Widget text color

if (Device.isUsingDarkAppearance()) {
  backColor = '111111';
  backColor2 = '222222';
  textColor = 'EDEDED';
} else {
  backColor = '229954';
  backColor2 = '52be80 ';
  textColor = 'EDEDED';
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

const gradient = new LinearGradient()
gradient.locations = [0, 1]
gradient.colors = [
  new Color(backColor),
  new Color(backColor2)
]
widget.backgroundGradient = gradient

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
  title.textColor = new Color(textColor)
  widget.addSpacer()
}

let counterText = widget.addText(`${treeCounter.toLocaleString(Device.locale().replace('_', '-'))} 🌳`)
counterText.font = Font.regularSystemFont(36)
counterText.minimumScaleFactor = 0.7;
counterText.lineLimit = 1
counterText.centerAlignText()
counterText.textColor = new Color(textColor)

widget.addSpacer()

if (!config.runsInWidget) {
  await widget.presentSmall()
} else {
  // Tell the system to show the widget.
  Script.setWidget(widget)
  Script.complete()
}
