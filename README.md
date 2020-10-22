# iOS-Widgets
This is a Collection of Scripts which can be used with the Scriptable App to create a iOS Widget.

To use the Script, you have to Download the App "Scriptable" from the App Store: https://apps.apple.com/de/app/scriptable/id1405459188

Then you have to copy & paste the desired script into the Scriptable App. Now you can create a Sciptable widget and select the script in the widget settings:

![Setup](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/setup.gif)


You can also download a Script with this Shortcut via iOS Share Menu: https://www.reddit.com/r/Scriptable/comments/jdcyuu/simply_ios_shortcut_to_renamesave_a_script_from

### Roadmap
The following widget are planned from my side:
* VRR Abfahrmonitor
* Countdown
* Covid-19 7-Day-Inzidenz
* Skype Meeting Dial-In via Phone or Web

If you have widget ideas, please feel free and share those ideas with me via GitHub Issue

## Vodafone DE data usage
![Vodafone Widget Preview light](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/VodafoneDE/previewLight.jpeg)
![Vodafone Widget Preview dark](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/VodafoneDE/previewDark.jpeg)

This widget loads the remaining data volume via the MyVodafone API. For this purpose, an automatic login via the cell phone network is performed, therefore it is necessary that the WIFI is not active for the first usage.
After the first usage, the informations are cached and will be used in case of an active WIFI Connection. The cached information will be also used to prevent the API from a lot of request. The TTL (Time To Live) of the Cache can be setup at the beginning of the script (default is 60 min)

[[Download]](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/VodafoneDE/VodafoneDE.js)

### Options
#### Set own color scheme
To overwrite the colors, you have to add four color codes separated by | to the widget parameter option: `BackgroundColor|TextColor|CircleFillColor|CircleStrokeColor`

Example: `D32D1F|EDEDED|EDEDED|B0B0B0`

If no parameter are set or not four colors are set the default color set for light or dark Mode will be used.

#### Use MeinVodafone Login
It is possible to add the MeinVodafone Credentails to the beginning of script, which allows the widget to update itself even with active WIFI or show data usage of another mobile contract.

### Contributors
* [Necriso](https://github.com/Necriso)

### Credits
* Sillium for the inspiration https://gist.github.com/Sillium/f904fb89444bc8dde12cfc07b8fa8728
* Chaeimg for the Circle diagram (https://github.com/chaeimg/battCircle)

## VRR-Monitor
![VRR-Monitor Widget Preview light](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/VRR-Monitor/previewLight.png)
![VRR-Monitor Widget Preview dark](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/VRR-Monitor/previewDark.png)

This widget displays the departure times of a selected station. The data for this is provided by the Verkehrsverbund Rhein-Ruhr (VRR), which is why only stations within the VRR are supported.

[[Download]](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/VRR-Monitor/VRR-Monitor.js)


### Setup
A Station-ID is required to set up the widget. The ID can be searched with this URL: 
`https://abfahrtsmonitor.vrr.de/backend/api/stations/search?query=`

Put the name of the station behind the "query=" in the URL and open the URL in your Browser.
Example: `https://abfahrtsmonitor.vrr.de/backend/api/stations/search?query=Düsseldorf HBF`

Add the Station-ID and the needed Walking Minutes, separated by a ";", to the Widget Parameter like this:
![VRR-Monitor Widget setup](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/VRR-Monitor/setup.jpeg)
