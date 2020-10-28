// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-brown; icon-glyph: magic;
// Version 0.1.0 Beta-Version

/****************************
Notice

Since some services, such as Skype, allow own domains or phone numbers, it cannot be guaranteed that the current search patterns always find all dial-in data.
The search pattern list must be constantly expanded.
If the dial-in data of a meeting should not be recognized, the invitation can be provided under https://github.com/ThisIsBenny/iOS-Widgets/issues/21, so that the list of search patterns can be extended.

*****************************/

let timeformat, countryCode

let widgetInputRAW = args.widgetParameter;
let widgetInput = null;

if (widgetInputRAW) {
  widgetInput = widgetInputRAW.toString().split(';')
  countryCode = widgetInput[0]
  timeformat = widgetInput[1] || 'de-DE'
  if (/^\+[\d]{1,3}$/.test(countryCode) === false) {
    throw new Error('Invalid format of country code: ' + countryCode);
  }
} else {
  countryCode = '+49'
  timeformat = 'de-DE'
}

const listLimit = (config.widgetFamily == 'medium') ? 1 : 5;

let iconColor;
if (Device.isUsingDarkAppearance()) {
  iconColor = 'EDEDED'
} else {
  iconColor = '222222'
}

let now = new Date()
let end = new Date()
end.setHours(23, 59, 59, 999);

const matchPatterns = {
  skype: {
    online: [
      /Skype-Besprechung teilnehmen <(https?:\/\/[a-zA-Z0-9\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF./\-_]*)>/
    ],
    phone: [
      { number: /Per Telefon teilnehmen[\r\n\s]+.*<tel:(\+49[0-9%]+)>/, pin: /Konferenzkennung:[\s]([0-9]+)/ }
    ]
  },
  circuit: {
    online: [
      /(https:\/\/eu\.yourcircuit\.com\/guest\?token=[\a-z0-9-]+)/
    ],
    phone: [
      { number: /Einwahlnummern[\r\n]*Deutschland[\r\n]*Deutsch[\r\n]*(\+49[0-9\s]+)/, pin: /PIN[\r\n]*([0-9\s]+)#/ }
    ]
  },
  msteams: {
    online: [
      /<(https:\/\/teams\.microsoft\.com\/l\/meetup-join\/.+)>/
    ]
  }
}

let upcomingRemoteMeeting = (await CalendarEvent.between(now, end)).map((event) => {
  if (event.notes) {
    for (const [key, value] of Object.entries(matchPatterns)) {
      for (pattern of value.online || []) {
        let m = event.notes.match(new RegExp(pattern, 'im'))
        if (m && m[1]) {
          event.dialInUrl = m[1]
          break
        }
      }
      // Some Invitations contains multiple phone numbers with different Country Codes, why first all numbers will be collected and late the needed number with the given country code will be filtered out
      let dialInNumbers = []
      for (pattern of value.phone || []) {
        let numberMatch = event.notes.match(new RegExp(pattern.number, 'im'))
        if (numberMatch && numberMatch[1]) {
          let dialInNumber = numberMatch[1]
          let pinMatch = event.notes.match(new RegExp(pattern.pin, 'im'))
          if (pinMatch && pinMatch[1]) {
            dialInNumber += ',,' + pinMatch[1] + '#'
          }
          dialInNumbers.push(dialInNumber.replace(/%20|[\s\r\n]/g, ''))
        }
      }
      // Find the phonenumber with the given Conuntry Code.
      event.dialInNumber = dialInNumbers.find((number) => number.startsWith(countryCode))
      if (event.dialInUrl || event.dialInNumber) {
        event.dialInService = key
        break
      }
    }
  }
  return {
    title: event.title,
    startDate: event.startDate,
    endDate: event.endDate,
    dialInService: event.dialInService,
    dialInUrl: event.dialInUrl,
    dialInNumber: event.dialInNumber
  }
}).filter((e) => e.dialInUrl || e.dialInNumber)

console.log(JSON.stringify(upcomingRemoteMeeting, null, 2))

// Create Widget
let widget = new ListWidget();

widget.setPadding(10, 10, 10, 10)

let [nextUpcomingMeeting, ...upComingMeetings] = upcomingRemoteMeeting

if (config.widgetFamily == 'small')
  widget.addText("Small widget isn't supported. Please use the medium or large widget.")

else if (nextUpcomingMeeting) {
  widget.addSpacer(5)
  let headlineText = widget.addText("Next Remote Meeting")
  headlineText.font = Font.boldSystemFont(12)

  widget.addSpacer(10)

  let stack = widget.addStack()
  stack.layoutHorizontally()

  let leftStack = stack.addStack()
  leftStack.layoutVertically()
  leftStack.size = new Size(260, 70)

  let nextMeetingTime = leftStack.addText(`${(new Date(nextUpcomingMeeting.startDate)).toLocaleString(timeformat)} - ${(new Date(nextUpcomingMeeting.endDate)).toLocaleString(timeformat)}`)
  nextMeetingTime.font = Font.thinSystemFont(10)

  let nextMeetingTitle = leftStack.addText(nextUpcomingMeeting.title)
  nextMeetingTitle.font = Font.boldSystemFont(20)
  nextMeetingTime.minimumScaleFactor = 1
  nextMeetingTime.lineLimit = 2

  leftStack.addSpacer()

  stack.addSpacer()

  let rightStack = stack.addStack()
  rightStack.layoutVertically()
  rightStack.size = new Size(25, 70)

  if (nextUpcomingMeeting.dialInNumber) {
    let phoneImage = rightStack.addImage(SFSymbol.named('phone').image)
    phoneImage.imageSize = new Size(25, 25)
    phoneImage.url = 'tel:' + nextUpcomingMeeting.dialInNumber
    if (iconColor) { phoneImage.tintColor = new Color(iconColor) }
  }

  if (nextUpcomingMeeting.dialInUrl) {
    rightStack.addSpacer(10)
    let videoImage = rightStack.addImage(SFSymbol.named('video').image)
    videoImage.imageSize = new Size(25, 25)
    videoImage.url = nextUpcomingMeeting.dialInUrl
    videoImage.centerAlignImage()
    if (iconColor) { videoImage.tintColor = new Color(iconColor) }
  }
  rightStack.addSpacer()
  widget.addSpacer()

  let upcomingMeetingStack = widget.addStack()
  upcomingMeetingStack.layoutVertically()

  if (upComingMeetings && upComingMeetings.length > 0) {
    let upComingText = upcomingMeetingStack.addText((upComingMeetings.length == 1) ? 'Upcoming Remote Meeting' : 'Upcoming Remote Meetings')
    upComingText.font = Font.boldSystemFont(10)
    upcomingMeetingStack.addSpacer(2)
  }

  for (let i = 0; i < listLimit && i < upComingMeetings.length; i++) {
    let row = upcomingMeetingStack.addStack()
    row.layoutHorizontally()

    let leftColumn = row.addStack()
    leftColumn.layoutVertically()

    row.addSpacer()

    let rightColumn = row.addStack()
    rightColumn.layoutHorizontally()
    rightColumn.setPadding(5, 5, 5, 5)
    rightColumn.spacing = 5

    let meetingTime = leftColumn.addText(`${(new Date(upComingMeetings[i].startDate)).toLocaleString(timeformat)} - ${(new Date(upComingMeetings[i].endDate)).toLocaleString(timeformat)}`)
    meetingTime.font = Font.thinSystemFont(8)

    let meetingTitle = leftColumn.addText(upComingMeetings[i].title)
    meetingTitle.font = Font.systemFont(10)
    meetingTitle.lineLimit = 1

    if (upComingMeetings[i].dialInNumber) {
      let phoneImage = rightColumn.addImage(SFSymbol.named('phone').image)
      phoneImage.imageSize = new Size(15, 15)
      phoneImage.url = 'tel:' + upComingMeetings[i].dialInNumber
      if (iconColor) { phoneImage.tintColor = new Color(iconColor) }
    }

    if (upComingMeetings[i].dialInUrl) {
      let videoImage = rightColumn.addImage(SFSymbol.named('video').image)
      videoImage.imageSize = new Size(15, 15)
      videoImage.url = upComingMeetings[i].dialInUrl
      if (iconColor) { videoImage.tintColor = new Color(iconColor) }
    }
  }
  widget.addSpacer(5)
} else {
  widget.addSpacer()
  let noMeetingText = widget.addText("No upcoming remote meeting")
  noMeetingText.font = Font.thinSystemFont(12)
  let enjoyText = widget.addText("Enjoy the day")
  enjoyText.font = Font.systemFont(20)
  widget.addSpacer()
}

if (!config.runsInWidget) {
  await widget.presentLarge()
} else {
  // Tell the system to show the widget.
  Script.setWidget(widget)
  Script.complete()
}
