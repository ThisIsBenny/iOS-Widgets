// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: magic;
// Version 1.1.3

// You can use this shortcut to get the needed Token via Safari Share Menu while you are on Ecosia.org: https://www.icloud.com/shortcuts/ab84483a898d42428b1a9be981c37854
// It is important, that you are already logged in with the Safari Browser where you execute Shortcut

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
  try {
    const url = "https://api.ecosia.org/v1/accounts/personalcounter?token=" + token
    let req = new Request(url)
    let res = await req.loadJSON()
    return parseInt(res.counterValue)
  } catch (error) {
    throw new Error('An error occurred when loading data from the Ecosia API. Please check the entered token.')
  }
}

async function getLogo() {
  let fm = FileManager.local()
  const pathLogo = fm.joinPath(fm.temporaryDirectory(), 'ecosiaLogo')

  if (fm.fileExists(pathLogo)) {
    return fm.readImage(pathLogo)
  } else {
    try {
      let req = new Request('https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/Ecosia/logo.png')
      let logo = await req.loadImage()
      fm.writeImage(pathLogo, logo)
      return logo
    } catch (e) {
      console.error(e)
      return null
    }
  }
}
console.log('Load Tree Counter')
let treeCounter = await getTreeCounter(token);
console.log('Tree Counter loaded')
console.log(treeCounter)
console.log('Load Logo')
let ecosiaLogo = await getLogo()
console.log('Logo loaded')
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
