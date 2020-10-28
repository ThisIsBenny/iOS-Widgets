# Meeting dial in (Beta-Version)

This widget shows the next and upcoming remote meeting. The widget can be used to dial into the meeting directly via phone number + pin or url.

The following services are currently supported:
* Skype (de)
* Circuit
* MS Team (url only)

[[Download]](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/Meeting-dial-in/Meeting-dial-in.js)

## Setup
Via the widget parameters the country code has to be set. This code has to start with a +. Example: +49
The country code is needed in case several international phone numbers are found (please check notice 1, because a country code does not automatically mean that the phone number is found).

### Optional
By default, the german date format will be used: DD.MM.YYYY, HH:mm

To use a different format, the format has to be set to the widget parameter. The format has to be separated from the country code with a ;

![Meeting dial in Widget setup](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/Meeting-dial-in/setup.jpeg)


## Notice 1
Since some services, such as Skype, allow own domains or phone numbers, it cannot be guaranteed that the current search patterns always find all dial-in data.
The search pattern list must be constantly expanded.
If the dial-in data of a meeting should not be recognized, the invitation can be provided under https://github.com/ThisIsBenny/iOS-Widgets/issues/21, so that the list of search patterns can be extended.

## Notice 2
The small widget isn't supported due to the limited space and the iOS limitation that small Widget aren't interactive
