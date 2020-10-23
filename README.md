# iOS-Widgets
This is a Collection of Scripts which can be used with the Scriptable App to create a iOS Widget.

To use the Script, you have to Download the App "Scriptable" from the App Store: https://apps.apple.com/de/app/scriptable/id1405459188

Then you have to copy & paste the desired script into the Scriptable App. Now you can create a Sciptable widget and select the script in the widget settings:

![Setup](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/setup.gif)


You can also download a Script with this Shortcut via iOS Share Menu: https://www.reddit.com/r/Scriptable/comments/jdcyuu/simply_ios_shortcut_to_renamesave_a_script_from

### Roadmap
The following widget are planned from my side:
* Countdown
* Skype Meeting Dial-In via Phone or Web
* Server Health Check
* Script to Download / Update Widget from a Widget catalog, like a Widget Store

If you have widget ideas, please feel free and share those ideas with me via GitHub Issue


## Countdown
![Countdown Widget Preview light](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/Countdown/previewLight.jpeg)
![Countdown Widget Preview dark](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/Countdown/previewDark.jpeg)
![Countdown Widget Preview light](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/Countdown/previewLight2.jpeg)
![Countdown Widget Preview dark](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/Countdown/previewDark2.jpeg)

Simple Countdown widget which shows the remaining days to a specified date.

[[Download]](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/Countdown/Countdown.js)

### Setup
Set the date in ISO8601 format (YYYY-MM-DD) to the Widget Parameter.
Optional: Define an emoji for your widget by adding the desired emoji behind the date and separating both values with a ";". Like this:

![Countdown Widget setup](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/Countdown/setup.jpeg)


## Covid-19 7-Day-Inzidenz for Düsseldorf
![Covid-19 Widget Preview light](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/Covid-19/previewLight.jpeg)
![Covid-19 Widget Preview dark](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/Covid-19/previewDark.jpeg)

This widget displays current 7-Day-incidence for Düsseldorf. The incidence is based on the OpenData data of the city Düsseldorf. New data are published daily at around 12 pm.

[[Download]](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/Covid-19/Covid-19.js)


## Vodafone DE remaining data volume
![Vodafone Widget Preview light](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/VodafoneDE/previewLight.jpeg)
![Vodafone Widget Preview dark](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/VodafoneDE/previewDark.jpeg)

This widget shows the remaining data volume for a Vodafone contract or prepaid card. The information will be loaded via MeinVodafone API. For this purpose, an automatic login via the cell phone network is performed, therefore it is necessary that the WIFI is not active for the first usage.
After the first usage, the informations are cached and will be used in case of an active WIFI Connection. The cached information will be also used to prevent the API from a lot of request. The TTL (Time To Live) of the Cache can be setup at the beginning of the script (default is 60 min)

[[Download]](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/VodafoneDE/VodafoneDE.js)

### Options
#### Use MeinVodafone Login
It is possible to set the MeinVodafone Credentails via widget parameter, which allows the widget to update itself even with active WIFI connection or to show data usage of a different mobile contract.
Add your Credentails in this format to your widget parameters: `username|password|mobile-number`. the mobile-number has to start with 49 instead of 0.

Example: `JohnSmith|TopSecretPassword!|491721234567`

_Remark: If your password contains a | character, you have to adapt the script and use a different divider._

### Roadmap
* Add Medium Widget Support to display GigaDepot usage

### Contributors
* [Necriso](https://github.com/Necriso)

### Credits
* Sillium for the inspiration https://gist.github.com/Sillium/f904fb89444bc8dde12cfc07b8fa8728
* Chaeimg for the Circle diagram (https://github.com/chaeimg/battCircle)


## VRR-Monitor
![VRR-Monitor Widget Preview light](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/VRR-Monitor/previewLight.jpeg)
![VRR-Monitor Widget Preview dark](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/VRR-Monitor/previewDark.jpeg)

This widget displays the departure times of a selected station. The data for this is provided by the Verkehrsverbund Rhein-Ruhr (VRR), which is why only stations within the VRR are supported.

[[Download]](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/VRR-Monitor/VRR-Monitor.js)


### Setup
A Station-ID is required to set up the widget. To get the Station-ID, you can run the Script directly in the Scriptable App to use the Setup Wizard.
The wizard searches for stations near to you (this requires your location).

Add the generated config to the Widget Parameter like this:

![VRR-Monitor Widget setup](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/VRR-Monitor/setup.jpeg)

#### Alternativ
The Station-ID can be searched with this URL: 
`https://abfahrtsmonitor.vrr.de/backend/api/stations/search?query=`

Put the name of the station behind the "query=" in the URL and open the URL in your Browser.
Example: `https://abfahrtsmonitor.vrr.de/backend/api/stations/search?query=Düsseldorf HBF`

Add the Station-ID and the needed Walking Minutes to the Station, separated by a ";", to the Widget Parameter.
