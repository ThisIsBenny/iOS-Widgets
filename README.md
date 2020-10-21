# iOS-Widgets
This is a Collection of Scripts which can be used with the Scriptable App to create a iOS Widget.

To use the Script, you have to Download the App "Scriptable" from the App Store: https://apps.apple.com/de/app/scriptable/id1405459188
Then you have to copy & paste the desired script into the Scriptable App. Now you can create a Sciptable widget and select the script in the widget settings.

## Vodafone DE data usage
![Vodafone Widget Preview light](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/VodafoneDE/previewLight.jpeg)
![Vodafone Widget Preview dark](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/VodafoneDE/previewDark.jpeg)

This widget loads the remaining data volume via the MyVodafone API. For this purpose, an automatic login via the cell phone network is performed, therefore it is necessary that the WIFI is not active for the first usage.
After the first usage, the informations are cached and will be used in case of an active WIFI Connection. The cached information will be also used to prevent the API from a lot of request. The TTL (Time To Live) of the Cache can be setup at the beginning of the script (default is 60 min)

It is possible to overwrite the used colors of the widget. To overwrite the colors, you have to add four color codes separated by | to the widget parameter option: `BackgroundColor|TextColor|CircleFillColor|CircleStrokeColor`

Example: `D32D1F|EDEDED|EDEDED|B0B0B0`

If no parameter are set or not four colors are set the default color set for light or dark Mode will be used.

[[Download]](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/VodafoneDE/VodafoneDE.js)

_Roadmap_:
* Add GigaDepot volume

_Credits_:
* Sillium for the inspiration https://gist.github.com/Sillium/f904fb89444bc8dde12cfc07b8fa8728
* Chaeimg for the Circle diagram (https://github.com/chaeimg/battCircle)
