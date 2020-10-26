// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: car;
// Version 1.0.2

/*
Notice: You need a free API Key from https://developer.mapquest.com for this Widget
        Please add the API Key to your Widget via widget parameter.
*/
const zoomLevel = 17
let type,iconColor, cachedParameter;

////////////////////////////////////////////////////////////////////////////////

if (Device.isUsingDarkAppearance()) {
  type = 'dark'
  iconColorPosition = 'CB4335'
  iconColorUpdate = 'EDEDED'
} else {
  type = 'light' 
  iconColorPosition = '222222'
  iconColorUpdate = '222222'
}
////////////////////////////////////////////////////////////////////////////////
let fm = FileManager.local()
let paths = {
  'location': fm.joinPath(fm.documentsDirectory(), 'widget-car-location'),
  'parameter': fm.joinPath(fm.documentsDirectory(), 'widget-car-location-parameter'),
  'small': fm.joinPath(fm.documentsDirectory(), 'widget-car-location-image-small'),
  'medium': fm.joinPath(fm.documentsDirectory(), 'widget-car-location-image-medium'),
  'large': fm.joinPath(fm.documentsDirectory(), 'widget-car-location-image-large')
}
let locactionInformationExists = fm.fileExists(paths['location'])

if (fm.fileExists(paths['parameter'])) {
  cachedParameter = fm.readString(paths['parameter'])
}

////////////////////////////////////////////////////////////////////////////////
let widgetInputRAW = args.widgetParameter || cachedParameter; // set stored Parameter as fallback in case that the script will be run in the app
let widgetInput = null;

if (widgetInputRAW !== null && widgetInputRAW !== undefined) {
  widgetInput = widgetInputRAW.toString().split(';')
} else {
  throw new Error('No API Key! Please add a API-Key from "developer.mapquest.com" to the widget parameter')
}
fm.writeString(paths['parameter'], widgetInputRAW.toString())
////////////////////////////////////////////////////////////////////////////////
async function updateLocationImage (location, size) {
  let sizeQuery 
  switch (size) {
    case 'small':
      sizeQuery = '200,200@2x';
      break;
    case 'medium':
      sizeQuery = '400,200@2x';
      break;
    case 'large':
      sizeQuery = '400,400@2x';
      break;
    default: throw new Error('Not supported Size!')
  }
  
    let url = `https://www.mapquestapi.com/staticmap/v5/map?key=${widgetInput[0].trim()}&locations=${location.latitude},${location.longitude}&zoom=${zoomLevel}&format=png&size=${sizeQuery}&type=${type}&defaultMarker=marker-${iconColorPosition}`
  
  let req = new Request(url)
  let img = await req.loadImage()
  
  fm.writeImage(paths[size], img)
}

async function updateLocation() {
  let l = await Location.current()
  
  await updateLocationImage(l, 'small')
  await updateLocationImage(l, 'medium')
  await updateLocationImage(l, 'large')
  
  fm.writeString(paths['location'], `${l.latitude};${l.longitude}`)
  return
}
////////////////////////////////////////////////////////////////////////////////

// Create Widget
let widget = new ListWidget();

widget.setPadding(10, 10, 10, 10)

// Taping on small widget isn't working due to iOS 14 limitation
if (config.widgetFamily !== 'small') {
  let stack = widget.addStack()
  stack.layoutHorizontally()
  stack.addSpacer()
  let iconStack = stack.addStack()
  iconStack.layoutVertically()

  let updateImage = iconStack.addImage(SFSymbol.named('arrow.triangle.2.circlepath').image)
  updateImage.imageSize = new Size(25,25)
  updateImage.tintColor = new Color(iconColorUpdate)
  updateImage.url = URLScheme.forRunningScript()  + '&option=updateLocation'

  iconStack.addSpacer(10)

  let navigationImage = iconStack.addImage(SFSymbol.named('arrow.triangle.turn.up.right.diamond').image)
  navigationImage.imageSize = new Size(25,25)
  navigationImage.tintColor = new Color(iconColorUpdate)

  if (locactionInformationExists) {
    let location = fm.readString(paths['location']).split(';')

    if ((widgetInput[1] || '').trim().toLocaleLowerCase() == 'google') {
      navigationImage.url = `comgooglemaps://?daddr=${location[0]},${location[1]}&travelMode=walking`
    } else {
      navigationImage.url = `http://maps.apple.com/maps?saddr=Current%20Location&daddr=${location[0]},${location[1]}`
    }
  }
  widget.addSpacer()
}

if (locactionInformationExists) {
  widget.backgroundImage = fm.readImage(paths[config.widgetFamily || 'large'])
} else {
  let initText = widget.addText('You have to set the location. Click the icon in the right corner.')
  initText.font = Font.systemFont(20)
  initText.minimumScaleFactor = 0.5
  widget.addSpacer()
}

let appQuery = args.queryParameters
if (config.runsInWidget === false && ((appQuery.option && appQuery.option == 'updateLocation') || locactionInformationExists == false)) {
  let a = new Alert()
  a.message = 'Do you like to set the current position as the position of your car?'
  a.addAction('Yes')
  a.addCancelAction('No')
  if(await a.present() === 0) {
    await updateLocation()
    let b = new Alert()
    b.message = 'New location was set'
    b.addAction('Close')
    await b.present()
  }
}else if(config.runsInWidget === false) {
  await widget.presentLarge()
} else {
  Script.setWidget(widget)
}
Script.complete()
