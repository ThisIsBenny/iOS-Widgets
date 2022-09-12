// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: hourglass-half;
// Version 1.2.2

let dateForCountdown = ''
let icon = ''
let showDate = false

let widgetInputRAW = args.widgetParameter;
let widgetInput = null;

if (widgetInputRAW !== null) {
  widgetInput = widgetInputRAW.toString().split(";");
  if (/^\d{4}-\d{2}-\d{2}$/.test(widgetInput[0].trim()) === false) {
     throw new Error('Invalid Date format. Please use the ISO8601 format: 2020-12-31') 
  }
  dateForCountdown = widgetInput[0].trim()
  icon = widgetInput[1] || '⏳';
  text = widgetInput[3]; // new
  if (widgetInput[2] && widgetInput[2].toLowerCase() === 'true') {
    showDate = true
  }
} else {
  throw new Error('No Date set! Please set a Date via Widget parameter like 2020-12-31')
}

////////////////////////////////////////////////////////////////////////////////
const localeText = {
  default: ['Day', 'Days', 'weeks'],
  en: ['Day', 'Days', 'Weeks'],
  de: ['Tag', 'Tage', 'Wochen'],
  fr: ['Jour', 'Jours'],
  es: ['día', 'días'],
  it: ['giorno', 'giorni']
}
////////////////////////////////////////////////////////////////////////////////
let backColor = Color.dynamic(new Color('A04000'), new Color('111111'))
let backColor2 = Color.dynamic(new Color('DC7633'), new Color('222222'))
let textColor = new Color('EDEDED')

function getTimeRemaining(endtime){
  const total = Date.parse(endtime) - Date.parse(new Date());
  const seconds = Math.floor( (total/1000) % 60 );
  const minutes = Math.floor( (total/1000/60) % 60 );
  const hours = Math.floor( (total/(1000*60*60)) % 24 );
  const days = Math.floor( total/(1000*60*60*24) );

  return {
    total,
    days,
    hours,
    minutes,
    seconds
  };
}
let remainingDays = getTimeRemaining(dateForCountdown).days + 1;
let remainingWeeks = Math.round(remainingDays /7);

// Create Widget
let widget = new ListWidget();

widget.setPadding(10, 10, 10, 10)

const gradient = new LinearGradient()
gradient.locations = [0, 1]
gradient.colors = [
  backColor,
  backColor2
]
widget.backgroundGradient = gradient


let provider = widget.addText(icon + " " + text) // variant
provider.font = Font.mediumSystemFont(12)
provider.textColor = textColor

widget.addSpacer()

let textStack = widget.addStack();
textStack.layoutHorizontally()
textStack.addSpacer()
textStack.centerAlignContent()

let daysText = textStack.addText(`${remainingDays}`)
daysText.font = Font.regularSystemFont(50)
daysText.textColor = textColor;
daysText.minimumScaleFactor = 0.5;

textStack.addSpacer(5)

const languageCode = Device.preferredLanguages()[0].match(/^[\a-z]{2}/)
const t = (localeText[languageCode]) ? localeText[languageCode] : localeText.default
let postfixText;
if (remainingDays === 1) {
  postfixText = textStack.addText(t[0])

} else {
  postfixText = textStack.addText(t[1])
}
postfixText.font = Font.regularSystemFont(20)
postfixText.textColor = textColor;
let provider2 = widget.addText(remainingWeeks+ " " + (t[2]))
provider2.font = Font.mediumSystemFont(16)
provider2.textColor = textColor
provider2.centerAlignText()
textStack.addSpacer()

textStack.addSpacer()

widget.addSpacer()

if(showDate) {
  const dateText = widget.addDate(new Date(dateForCountdown))
  dateText.font = Font.lightSystemFont(10)
  dateText.textColor = textColor;
  dateText.centerAlignText()
  widget.addSpacer(5) 
}

if(!config.runsInWidget) {
  await widget.presentSmall()
} else {
  // Tell the system to show the widget.
  Script.setWidget(widget)
  Script.complete()
}
