// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: hourglass-half;
// Version 1.0.0

let dateForCountdown = ''
let icon = ''

let widgetInputRAW = args.widgetParameter;
let widgetInput = null;

if (widgetInputRAW !== null) {
  widgetInput = widgetInputRAW.toString().split(";");
  if (/^\d{4}-\d{2}-\d{2}$/.test(widgetInput[0].trim()) === false) {
     throw new Error('Invalid Date format. Please use the ISO8601 format: 2020-12-31') 
  }
  dateForCountdown = widgetInput[0].trim()
  icon = widgetInput[1] || '⏳';
} else {
  throw new Error('No Date set! Please set a Date via Widget parameter like 2020-12-31')
}

////////////////////////////////////////////////////////////////////////////////
const localeText = {
  default: ['Day', 'Days'],
  en: ['Day', 'Days'],
  de: ['Tag', 'Tage'],
  fr: ['Jour', 'Jours'],
  es: ['día', 'días'],
  it: ['giorno', 'giorni']
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
  backColor = 'A04000';
  backColor2 = 'DC7633';
  textColor = 'EDEDED';
}

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

// Create Widget
let widget = new ListWidget();

widget.setPadding(10, 10, 10, 10)

const gradient = new LinearGradient()
gradient.locations = [0, 1]
gradient.colors = [
  new Color(backColor),
  new Color(backColor2)
]
widget.backgroundGradient = gradient


let provider = widget.addText(icon + " Countdown")
provider.font = Font.mediumSystemFont(12)
provider.textColor = new Color(textColor)

widget.addSpacer()

let textStack = widget.addStack();
textStack.layoutHorizontally()
textStack.addSpacer()
textStack.centerAlignContent()

let dayText = textStack.addText(`${remainingDays}`)
dayText.font = Font.regularSystemFont(50)
dayText.textColor = new Color(textColor);
dayText.minimumScaleFactor = 0.5;

textStack.addSpacer(5)

const languageCode = Device.language().match(/^[\a-z]{2}/)
const t = (localeText[languageCode]) ? localeText[languageCode] : localeText.default
let postfixText;
if (remainingDays === 1) {
  postfixText = textStack.addText(t[0])

} else {
  postfixText = textStack.addText(t[1])
}
postfixText.font = Font.regularSystemFont(20)
postfixText.textColor = new Color(textColor);

textStack.addSpacer()

widget.addSpacer()

if(!config.runsInWidget) {
  await widget.presentSmall()
} else {
  // Tell the system to show the widget.
  Script.setWidget(widget)
  Script.complete()
}
