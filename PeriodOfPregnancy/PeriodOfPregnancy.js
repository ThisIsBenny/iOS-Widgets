// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: hourglass-half;
// Version 1.2.0

let startDate = ''
let widgetInputRAW = args.widgetParameter || '2020-12-14';
let widgetInput = null;

if (widgetInputRAW !== null) {
  widgetInput = widgetInputRAW.toString().split(';')
  if (/^\d{4}-\d{2}-\d{2}$/.test(widgetInput[0].trim()) === false) {
     throw new Error('Invalid Date format. Please use the ISO8601 format: 2020-12-31') 
  }
  startDate = widgetInput[0].trim()
} else {
  throw new Error('No Date set! Please set a Date via Widget parameter like 2020-12-31')
}

////////////////////////////////////////////////////////////////////////////////
const localTextSupport = {
  default: ['Day', 'Days', 'Week'],
  en: ['Day', 'Days', 'Week'],
  de: ['Tag', 'Tage', 'Woche'],
  fr: ['Jour', 'Jours', 'semaines'],
  es: ['día', 'días', 'semanas'],
  it: ['giorno', 'giorni', 'settimane']
}
const languageCode = Device.preferredLanguages()[0].match(/^[\a-z]{2}/)
const localText = (localTextSupport[languageCode]) ? localTextSupport[languageCode] : localTextSupport.default
////////////////////////////////////////////////////////////////////////////////
const backColor = Color.dynamic(new Color('17A589'), new Color('111111'))
const backColor2 = Color.dynamic(new Color('48C9B0'), new Color('222222'))
const textColor = Color.dynamic(new Color('EDEDED'), new Color('EDEDED'))

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

function getWeeksAndDays(startDate){
  const total = Date.parse(new Date) - Date.parse(startDate);
  const days = Math.floor((total/(1000*60*60*24 + 1)) % 7)
  const weeks = Math.floor( total/(1000*60*60*24 + 1) / 7 );
  
  const target = new Date(startDate)
  target.setDate(target.getDate() + 40 * 7)

  return {
    total,
    target,
    days,
    weeks
  };
}
const { weeks, days, target } = getWeeksAndDays(startDate);
const remainingDays = getTimeRemaining(target).days + 1;

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

widget.addSpacer()

let mainStack = widget.addStack();
mainStack.layoutHorizontally()
mainStack.addSpacer()
mainStack.centerAlignContent()

let weeksText = mainStack.addText(`${weeks}${localText[2].substr(0, 1).toLocaleLowerCase()} ${days}${localText[1].substr(0, 1).toLocaleLowerCase()}`)
weeksText.font = Font.regularSystemFont(38)
weeksText.textColor = textColor;
weeksText.minimumScaleFactor = 0.5;
weeksText.lineLimit = 1

mainStack.addSpacer()

widget.addSpacer()

let targetDateText = widget.addText(`🗓 ${target.toLocaleDateString()}`)
targetDateText.font = Font.regularSystemFont(16)
targetDateText.textColor = textColor;
targetDateText.minimumScaleFactor = 0.5;
targetDateText.lineLimit = 1

widget.addSpacer(5)

let postfixText
if (remainingDays === 1) {
  postfixText = localText[0]

} else {
  postfixText = localText[1]
}
let remainingDaysText = widget.addText(`⏳ ${remainingDays} ${postfixText}`)
remainingDaysText.font = Font.regularSystemFont(16)
remainingDaysText.textColor = textColor;
remainingDaysText.minimumScaleFactor = 0.5;
remainingDaysText.lineLimit = 1

if(!config.runsInWidget) {
  await widget.presentSmall()
} else {
  // Tell the system to show the widget.
  Script.setWidget(widget)
  Script.complete()
}
