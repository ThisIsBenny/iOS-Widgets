# iOS-Widgets
This is a Collection of Scripts which can be used with the Scriptable App to create a iOS Widget.

To use the Script, you have to Download the App "Scriptable" from the App Store: https://apps.apple.com/de/app/scriptable/id1405459188
Then you have to copy & paste the desired script into the Scriptable App. Now you can create a Sciptable widget and select the script in the widget settings.

## Vodafone DE data usage
![Vodafone Widget](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/VodafoneDE/preview.jpeg)

This widget loads the remaining data volume via the MyVodafone API. For this purpose, an automatic login via the cell phone network is performed, therefore it is necessary that the WIFI is not active for the first usage.
After the first usage, the informations are cached and will be used in case of an active WIFI Connection. The cached information will be also used to prevent the API from a lot of request. The TTL (Time To Live) of the Cache can be setup at the beginning of the script (default is 60 min)

[[Download]](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/VodafoneDE/VodafoneDE.js)

_Roadmap_:
* Change Background Color
* Add diagramm
* Add GigaDepot volume

_Credits_:
* Sillium for the inspiration https://gist.github.com/Sillium/f904fb89444bc8dde12cfc07b8fa8728
* Chaeimg for the Circle diagram (https://github.com/chaeimg/battCircle)